import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

let mockUser: { id: string } | null = null;
let mockRole: string | null = null;

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: mockUser } }) },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: mockRole ? { role: mockRole } : null }) }),
      }),
    }),
  }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";

const run = async (path: string, cookies: Record<string, string> = {}) => {
  const { proxy } = await import("@/proxy");
  const req = new NextRequest(`http://localhost${path}`, {
    headers: { cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ") },
  });
  return proxy(req);
};

beforeEach(() => {
  mockUser = null;
  mockRole = null;
});

describe("proxy route guards (DB-backed roles)", () => {
  it("redirects anonymous users away from /admin", async () => {
    const res = await run("/admin/products");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/login");
  });

  it("ignores a forged souq_role=admin cookie", async () => {
    const res = await run("/admin", { souq_role: "admin" });
    expect(res.status).toBe(307);
  });

  it("blocks signed-in customers from /admin and /vendor", async () => {
    mockUser = { id: "u1" };
    mockRole = "customer";
    expect((await run("/admin")).status).toBe(307);
    expect((await run("/vendor")).status).toBe(307);
  });

  it("allows admins into /admin and /vendor", async () => {
    mockUser = { id: "u1" };
    mockRole = "admin";
    expect((await run("/admin")).status).toBe(200);
    expect((await run("/vendor")).status).toBe(200);
  });

  it("allows vendors into /vendor but not /admin", async () => {
    mockUser = { id: "u2" };
    mockRole = "vendor";
    expect((await run("/vendor")).status).toBe(200);
    expect((await run("/admin")).status).toBe(307);
  });

  it("keeps /vendor/register public", async () => {
    expect((await run("/vendor/register")).status).toBe(200);
  });

  it("requires a session for /account", async () => {
    expect((await run("/account")).status).toBe(307);
    mockUser = { id: "u3" };
    mockRole = "customer";
    expect((await run("/account")).status).toBe(200);
  });
});
