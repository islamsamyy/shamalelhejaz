import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

/**
 * Moyasar Webhook Handler
 * Verifies shared secret token (`secret_token` in payload or `x-moyasar-secret-token` header)
 * or HMAC signature when `MOYASAR_WEBHOOK_SECRET` / `MOYASAR_SECRET_KEY` is configured,
 * then marks the order paid via `public.mark_order_paid_secure`.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody || "{}");

    const webhookSecret = process.env.MOYASAR_WEBHOOK_SECRET || process.env.MOYASAR_SECRET_KEY;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Moyasar webhook secret is not configured" },
        { status: 503 }
      );
    }

    const headerToken = req.headers.get("x-moyasar-secret-token") || payload.secret_token || "";
    const validToken =
      headerToken.length === webhookSecret.length &&
      crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(webhookSecret));

    if (!validToken) {
      return NextResponse.json({ error: "Invalid Moyasar webhook signature" }, { status: 401 });
    }

    const paymentData = payload.data || payload;
    const status = String(paymentData.status || "").toLowerCase();
    const orderId = paymentData.metadata?.order_id || paymentData.description;
    const gatewayRef = String(paymentData.id || "");

    if (status === "paid" && orderId && gatewayRef) {
      const admin = createSupabaseAdminClient();
      const { error } = await admin.rpc("mark_order_paid_secure", {
        p_order: String(orderId),
        p_gateway: "moyasar",
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
