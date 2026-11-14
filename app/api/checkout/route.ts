import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient, getSessionUser } from "@/lib/supabase-server";

export interface CheckoutRequestBody {
  items: { product_id: string; quantity: number }[];
  address: {
    fullName: string;
    phone: string;
    city: string;
    district?: string;
    street?: string;
    buildingNo?: string;
    postalCode?: string;
  };
  gateway: "cod" | "wallet" | "moyasar" | "hyperpay" | "tap" | "stripe";
  coupon?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "يرجى تسجيل الدخول لإتمام عملية الشراء." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CheckoutRequestBody;
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "سلة المشتريات فارغة." }, { status: 400 });
    }
    if (!body.address?.fullName || !body.address?.phone || !body.address?.city) {
      return NextResponse.json({ error: "بيانات العنوان غير مكتملة." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: orderId, error } = await admin.rpc("create_order_secure", {
      p_user: user.id,
      p_items: body.items.map((i) => ({
        product_id: String(i.product_id),
        quantity: Number(i.quantity),
      })),
      p_address: body.address,
      p_gateway: body.gateway || "cod",
      p_coupon: body.coupon || null,
    });

    if (error || !orderId) {
      return NextResponse.json(
        { error: error?.message || "تعذر إنشاء الطلب في قاعدة البيانات." },
        { status: 400 }
      );
    }

    // Fetch created order total for external payment session creation if needed
    const { data: orderRow } = await admin
      .from("orders")
      .select("id, total, currency, payment_status, status")
      .eq("id", orderId)
      .single();

    return NextResponse.json({
      success: true,
      orderId,
      order: orderRow,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "خطأ غير متوقع أثناء معالجة الطلب." },
      { status: 500 }
    );
  }
}
