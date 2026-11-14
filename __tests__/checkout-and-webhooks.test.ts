import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as checkoutHandler } from "@/app/api/checkout/route";
import { POST as moyasarHandler } from "@/app/api/payments/moyasar/route";
import { POST as tapHandler } from "@/app/api/payments/tap/route";
import { POST as stripeHandler } from "@/app/api/payments/stripe/route";
import { NextRequest } from "next/server";
import crypto from "crypto";

vi.mock("@/lib/supabase-server", () => {
  const mockRpc = vi.fn();
  const mockSingle = vi.fn().mockResolvedValue({
    data: { id: "ord-123", total: 1500, currency: "SAR", payment_status: "paid", status: "confirmed" },
    error: null,
  });

  const mockSelect = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      maybeSingle: mockSingle,
      single: mockSingle,
    }),
  });

  const mockAdminClient = {
    rpc: mockRpc,
    from: vi.fn().mockReturnValue({
      select: mockSelect,
    }),
  };

  return {
    getSessionUser: vi.fn(),
    createSupabaseAdminClient: () => mockAdminClient,
    __mockRpc: mockRpc,
  };
});

import { getSessionUser, createSupabaseAdminClient } from "@/lib/supabase-server";

describe("API: /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not logged in", async () => {
    (getSessionUser as any).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ items: [] }),
    });

    const res = await checkoutHandler(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain("تسجيل الدخول");
  });

  it("returns 400 when cart items are empty", async () => {
    (getSessionUser as any).mockResolvedValue({ id: "user-123", role: "customer", email: "cust@souq.sa" });

    const req = new NextRequest("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ items: [], address: { fullName: "أحمد", phone: "055", city: "الرياض" } }),
    });

    const res = await checkoutHandler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("سلة المشتريات فارغة");
  });

  it("creates order via create_order_secure RPC on valid payload", async () => {
    (getSessionUser as any).mockResolvedValue({ id: "user-123", role: "customer", email: "cust@souq.sa" });
    const admin = createSupabaseAdminClient();
    (admin.rpc as any).mockResolvedValue({ data: "ord-success-999", error: null });

    const req = new NextRequest("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        items: [{ product_id: "prod-1", quantity: 2 }],
        address: { fullName: "أحمد محمد", phone: "0501234567", city: "الرياض" },
        gateway: "cod",
      }),
    });

    const res = await checkoutHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.orderId).toBe("ord-success-999");
    expect(json.order).toBeDefined();
  });
});

describe("API Webhook: /api/payments/moyasar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.MOYASAR_WEBHOOK_SECRET;
    delete process.env.MOYASAR_SECRET_KEY;
  });

  it("returns 503 if secret is not configured", async () => {
    const req = new NextRequest("http://localhost/api/payments/moyasar", {
      method: "POST",
      body: JSON.stringify({ status: "paid" }),
    });

    const res = await moyasarHandler(req);
    expect(res.status).toBe(503);
  });

  it("returns 401 when signature/token is invalid", async () => {
    process.env.MOYASAR_WEBHOOK_SECRET = "secret_moyasar_123456789";

    const req = new NextRequest("http://localhost/api/payments/moyasar", {
      method: "POST",
      headers: { "x-moyasar-secret-token": "wrong_secret_token" },
      body: JSON.stringify({ status: "paid" }),
    });

    const res = await moyasarHandler(req);
    expect(res.status).toBe(401);
  });

  it("marks order paid when valid secret token is provided", async () => {
    const secret = "secret_moyasar_123456789";
    process.env.MOYASAR_WEBHOOK_SECRET = secret;

    const admin = createSupabaseAdminClient();
    (admin.rpc as any).mockResolvedValue({ data: null, error: null });

    const payload = {
      data: {
        id: "pay_moyasar_test_1",
        status: "paid",
        metadata: { order_id: "ord-123" },
      },
    };

    const req = new NextRequest("http://localhost/api/payments/moyasar", {
      method: "POST",
      headers: { "x-moyasar-secret-token": secret },
      body: JSON.stringify(payload),
    });

    const res = await moyasarHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
    expect(admin.rpc).toHaveBeenCalledWith("mark_order_paid_secure", expect.objectContaining({
      p_order: "ord-123",
      p_gateway: "moyasar",
      p_ref: "pay_moyasar_test_1",
    }));
  });
});

describe("API Webhook: /api/payments/tap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.TAP_WEBHOOK_SECRET;
  });

  it("returns 503 if Tap secret is not configured", async () => {
    const req = new NextRequest("http://localhost/api/payments/tap", {
      method: "POST",
      body: JSON.stringify({ status: "CAPTURED" }),
    });

    const res = await tapHandler(req);
    expect(res.status).toBe(503);
  });

  it("verifies hash and marks order paid", async () => {
    const secret = "tap_secret_key_1234567890";
    process.env.TAP_SECRET_KEY = secret;

    const admin = createSupabaseAdminClient();
    (admin.rpc as any).mockResolvedValue({ data: null, error: null });

    const payload = {
      id: "chg_tap_1",
      amount: 1500,
      currency: "SAR",
      status: "CAPTURED",
      reference: { order: "ord-456", gateway: "gw_1", payment: "pay_1" },
      transaction: { created: "1794610000" },
    };

    const toBeHashed = [
      `x_id${payload.id}`,
      `x_amount${Number(payload.amount).toFixed(2)}`,
      `x_currency${payload.currency}`,
      `x_gateway_reference${payload.reference.gateway}`,
      `x_payment_reference${payload.reference.payment}`,
      `x_status${payload.status}`,
      `x_created${payload.transaction.created}`,
    ].join("");

    const signature = crypto.createHmac("sha256", secret).update(toBeHashed).digest("hex");

    const req = new NextRequest("http://localhost/api/payments/tap", {
      method: "POST",
      headers: { hashstring: signature },
      body: JSON.stringify(payload),
    });

    const res = await tapHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
    expect(admin.rpc).toHaveBeenCalledWith("mark_order_paid_secure", expect.objectContaining({
      p_order: "ord-456",
      p_gateway: "tap",
      p_ref: "chg_tap_1",
    }));
  });
});
