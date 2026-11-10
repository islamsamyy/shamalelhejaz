import { describe, it, expect } from "vitest";
import { requireRole, requireAdmin, canManageVendor, AuthError, ForbiddenError } from "@/lib/rbac";

describe("requireRole", () => {
  it("throws 401 when there is no user", () => {
    expect(() => requireRole(null, ["admin"])).toThrow(AuthError);
    try {
      requireRole(undefined, ["admin"]);
    } catch (e) {
      expect((e as AuthError).statusCode).toBe(401);
    }
  });

  it("throws 403 when role is not allowed", () => {
    expect(() => requireRole({ role: "customer" }, ["admin"])).toThrow(ForbiddenError);
    expect(() => requireAdmin({ role: "vendor" })).toThrow(ForbiddenError);
  });

  it("passes for an allowed role", () => {
    expect(requireAdmin({ role: "admin" })).toBe(true);
    expect(requireRole({ role: "vendor" }, ["vendor", "admin"])).toBe(true);
  });
});

describe("canManageVendor", () => {
  const vendor = { id: "u1", email: "v@x.com", role: "vendor" as const, vendorId: "v-1" };
  it("lets admins manage any vendor", () => {
    expect(canManageVendor({ ...vendor, role: "admin" }, "other")).toBe(true);
  });
  it("lets a vendor manage only their own store", () => {
    expect(canManageVendor(vendor, "v-1")).toBe(true);
    expect(canManageVendor(vendor, "v-2")).toBe(false);
  });
  it("denies customers and anonymous users", () => {
    expect(canManageVendor({ ...vendor, role: "customer" }, "v-1")).toBe(false);
    expect(canManageVendor(null, "v-1")).toBe(false);
  });
});
