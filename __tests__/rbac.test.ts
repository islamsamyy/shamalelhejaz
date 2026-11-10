import { describe, it, expect } from "vitest";
import {
  verifyJwtToken,
  requireRole,
  requireAdmin,
  canManageVendor,
  AuthError,
  ForbiddenError,
  AuthUser,
} from "@/lib/rbac";

// Helper function to create fake test JWTs
function createMockJwt(payload: Record<string, any>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = "mock_signature";
  return `${header}.${body}.${signature}`;
}

describe("Security & Admin RBAC: lib/rbac.ts", () => {
  // =========================================================================
  // 1. TOKEN VALIDATION & DECODING (AAA PATTERN)
  // =========================================================================

  describe("verifyJwtToken", () => {
    it("should successfully validate an active Admin JWT token", () => {
      // Arrange
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour ahead
      const token = createMockJwt({
        sub: "user-admin-1",
        email: "admin@souq.sa",
        role: "admin",
        exp: futureExp,
      });

      // Act
      const decoded = verifyJwtToken(token);

      // Assert
      expect(decoded.userId).toBe("user-admin-1");
      expect(decoded.role).toBe("admin");
      expect(decoded.exp).toBe(futureExp);
    });

    it("should throw 401 AuthError when token is missing or null", () => {
      // Arrange & Act & Assert
      expect(() => verifyJwtToken(null)).toThrow(AuthError);
      expect(() => verifyJwtToken("")).toThrow("رمز المصادقة (Token) غير متوفر");
    });

    it("should reject expired tokens with an explicit expiration error", () => {
      // Arrange: token expired 10 minutes ago
      const pastExp = Math.floor(Date.now() / 1000) - 600;
      const expiredToken = createMockJwt({
        sub: "user-old",
        role: "admin",
        exp: pastExp,
      });

      // Act & Assert
      expect(() => verifyJwtToken(expiredToken)).toThrow("انتهت صلاحية جلسة الدخول (Token Expired)");
    });

    it("should reject malformed or invalid JWT payloads (invalid format)", () => {
      // Arrange
      const malformedToken = "not.a.valid.jwt.token";

      // Act & Assert
      expect(() => verifyJwtToken(malformedToken)).toThrow("رمز المصادقة غير صالح أو مشوه");
    });

    it("should reject JWT payloads missing user identifier (sub/userId)", () => {
      // Arrange
      const tokenWithoutUser = createMockJwt({ role: "admin", exp: 9999999999 });

      // Act & Assert
      expect(() => verifyJwtToken(tokenWithoutUser)).toThrow("رمز المصادقة يفتقر إلى معرّف المستخدم");
    });
  });

  // =========================================================================
  // 2. ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSION CHECKS
  // =========================================================================

  describe("requireRole & requireAdmin", () => {
    it("should allow Admin role to access administrative modules", () => {
      // Arrange
      const adminUser: AuthUser = { id: "admin-1", email: "admin@souq.sa", role: "admin" };

      // Act
      const hasAccess = requireAdmin(adminUser);

      // Assert
      expect(hasAccess).toBe(true);
    });

    it("should explicitly reject Customer role trying to access Admin command center (403 Forbidden)", () => {
      // Arrange: A normal customer trying to breach the admin module
      const customerUser: AuthUser = { id: "cust-99", email: "shopper@gmail.com", role: "customer" };

      // Act & Assert
      expect(() => requireAdmin(customerUser)).toThrow(ForbiddenError);
      expect(() => requireAdmin(customerUser)).toThrow("صلاحية غير كافية");
    });

    it("should reject unauthenticated request when user is null (401 Unauthorized)", () => {
      // Arrange & Act & Assert
      expect(() => requireRole(null, ["admin", "vendor"])).toThrow(AuthError);
      expect(() => requireRole(null, ["admin"])).toThrow("يجب تسجيل الدخول أولاً");
    });

    it("should enforce multi-role permission boundaries correctly", () => {
      // Arrange
      const vendorUser: AuthUser = {
        id: "vendor-1",
        email: "vendor@store.sa",
        role: "vendor",
        vendorId: "modern-tech",
      };

      // Act: Vendor accesses vendor portal
      const vendorAccess = requireRole(vendorUser, ["admin", "vendor"]);

      // Assert
      expect(vendorAccess).toBe(true);
      // Vendor cannot access admin-only
      expect(() => requireRole(vendorUser, ["admin"])).toThrow(ForbiddenError);
    });
  });

  // =========================================================================
  // 3. VENDOR DATA ISOLATION & TENANT ACCESS CHECKS
  // =========================================================================

  describe("canManageVendor", () => {
    it("should allow Admin to manage ANY vendor store", () => {
      // Arrange
      const adminUser: AuthUser = { id: "admin-1", email: "admin@souq.sa", role: "admin" };

      // Act & Assert
      expect(canManageVendor(adminUser, "any-store-id")).toBe(true);
    });

    it("should allow Vendor to manage ONLY their own assigned storeId", () => {
      // Arrange
      const vendorUser: AuthUser = {
        id: "v-1",
        email: "seller@tech.sa",
        role: "vendor",
        vendorId: "modern-tech",
      };

      // Act & Assert: match -> true
      expect(canManageVendor(vendorUser, "modern-tech")).toBe(true);
      // Act & Assert: different vendor -> false
      expect(canManageVendor(vendorUser, "competitor-store")).toBe(false);
    });

    it("should deny Customer from managing any vendor", () => {
      // Arrange
      const customerUser: AuthUser = { id: "c-1", email: "user@test.sa", role: "customer" };

      // Act & Assert
      expect(canManageVendor(customerUser, "modern-tech")).toBe(false);
    });
  });
});
