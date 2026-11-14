import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

/**
 * Tap Payments Webhook Handler
 * Verifies Tap `hashstring` header using `TAP_SECRET_KEY` (HMAC-SHA256),
 * then calls `public.mark_order_paid_secure` when status is `CAPTURED`.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody || "{}");

    const tapSecret = process.env.TAP_SECRET_KEY || process.env.TAP_WEBHOOK_SECRET;
    if (!tapSecret) {
      return NextResponse.json({ error: "TAP_SECRET_KEY is not configured" }, { status: 503 });
    }

    const receivedHash = req.headers.get("hashstring") || "";
    const toBeHashed = [
      `x_id${payload.id ?? ""}`,
      `x_amount${Number(payload.amount ?? 0).toFixed(2)}`,
      `x_currency${payload.currency ?? "SAR"}`,
      `x_gateway_reference${payload.reference?.gateway ?? ""}`,
      `x_payment_reference${payload.reference?.payment ?? ""}`,
      `x_status${payload.status ?? ""}`,
      `x_created${payload.transaction?.created ?? ""}`,
    ].join("");

    const computedHash = crypto.createHmac("sha256", tapSecret).update(toBeHashed).digest("hex");
    const valid =
      receivedHash.length === computedHash.length &&
      crypto.timingSafeEqual(Buffer.from(receivedHash), Buffer.from(computedHash));

    if (!valid) {
      return NextResponse.json({ error: "Invalid Tap hashstring" }, { status: 401 });
    }

    const orderId = payload.metadata?.order_id || payload.reference?.order;
    const status = String(payload.status || "").toUpperCase();

    if (status === "CAPTURED" && orderId && payload.id) {
      const admin = createSupabaseAdminClient();
      const { error } = await admin.rpc("mark_order_paid_secure", {
        p_order: String(orderId),
        p_gateway: "tap",
        p_ref: String(payload.id),
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
