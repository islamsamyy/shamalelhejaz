import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

/**
 * HyperPay Webhook / Notification Handler
 * Verifies `x-hyperpay-signature` (HMAC-SHA256 with `HYPERPAY_WEBHOOK_SECRET` or `HYPERPAY_ACCESS_TOKEN`)
 * and marks the order paid when the result code matches OPPWA success pattern `^(000\.000\.|000\.100\.1|000\.[36])`.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const secret = process.env.HYPERPAY_WEBHOOK_SECRET || process.env.HYPERPAY_ACCESS_TOKEN;
    if (!secret) {
      return NextResponse.json(
        { error: "HYPERPAY_ACCESS_TOKEN is not configured" },
        { status: 503 }
      );
    }

    const sig = req.headers.get("x-hyperpay-signature") || "";
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const valid =
      sig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));

    if (!valid) {
      return NextResponse.json({ error: "Invalid HyperPay signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody || "{}");
    const data = payload.payload || payload;
    const resultCode = String(data.result?.code || "");
    const isSuccess = /^(000\.000\.|000\.100\.1|000\.[36])/.test(resultCode);
    const orderId = data.merchantTransactionId || data.customParameters?.order_id;
    const gatewayRef = String(data.id || "");

    if (isSuccess && orderId && gatewayRef) {
      const admin = createSupabaseAdminClient();
      const { error } = await admin.rpc("mark_order_paid_secure", {
        p_order: String(orderId),
        p_gateway: "hyperpay",
        p_ref: gatewayRef,
        p_raw: payload,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Webhook error" }, { status: 400 });
  }
}
