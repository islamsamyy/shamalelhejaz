import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

/**
 * Stripe Webhook Handler
 * Verifies standard `stripe-signature` (`t=...,v1=...`) using `STRIPE_WEBHOOK_SECRET`
 * and calls `public.mark_order_paid_secure` on `checkout.session.completed` or `payment_intent.succeeded`.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "STRIPE_WEBHOOK_SECRET is not configured" },
        { status: 503 }
      );
    }

    const sigHeader = req.headers.get("stripe-signature") || "";
    const parts = Object.fromEntries(
      sigHeader.split(",").map((kv) => {
        const [k, v] = kv.trim().split("=");
        return [k, v];
      })
    );

    const timestamp = parts.t;
    const v1 = parts.v1;
    if (!timestamp || !v1) {
      return NextResponse.json({ error: "Malformed stripe-signature header" }, { status: 401 });
    }

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(signedPayload)
      .digest("hex");

    const valid =
      v1.length === expectedSig.length &&
      crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expectedSig));

    if (!valid) {
      return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody || "{}");
    const type = String(event.type || "");
    const obj = event.data?.object || {};

    if (type === "checkout.session.completed" || type === "payment_intent.succeeded") {
      const orderId = obj.metadata?.order_id || obj.client_reference_id;
      const gatewayRef = String(obj.payment_intent || obj.id || "");
      if (orderId && gatewayRef) {
        const admin = createSupabaseAdminClient();
        const { error } = await admin.rpc("mark_order_paid_secure", {
          p_order: String(orderId),
          p_gateway: "stripe",
          p_ref: gatewayRef,
          p_raw: event,
        });
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Webhook error" }, { status: 400 });
  }
}
