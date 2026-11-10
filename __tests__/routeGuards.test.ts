// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { middleware } from "@/middleware";
import { NextRequest } from "next/server";
import {
  getClientRole,
  setClientRole,
  clearClientRole,
  authenticateWithCredentials,
  TEST_ACCOUNTS,
} from "@/lib/rbac";

describe("RBAC Route Guards & Middleware Protection", () => {
  beforeEach(() => {
    clearClientRole();
  });

  // =========================================================================
  // 1. CLIENT ROLE HELPERS
  // =========================================================================
  it("should set and retrieve client role from document cookies", () => {
    // Arrange & Act
    setClientRole("admin");

    // Assert
    expect(getClientRole()).toBe("admin");

    // Clear
    clearClientRole();
    expect(getClientRole()).toBeNull();
  });

  // =========================================================================
  // 2. ADMIN ROUTE PROTECTION
  // =========================================================================
  it("should block unauthenticated access to /admin and redirect to login", () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/admin");

    // Act
    const response = middleware(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/auth/login");
    expect(location).toContain("role=admin");
    expect(location).toContain("error=unauthorized");
  });

  it("should block customer access to /admin and redirect to login", () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/admin");
    request.cookies.set("souq_role", "customer");

    // Act
    const response = middleware(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("role=admin");
  });

  it("should allow verified admin to access /admin", () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/admin");
    request.cookies.set("souq_role", "admin");

    // Act
    const response = middleware(request);

    // Assert
    expect(response.status).toBe(200); // NextResponse.next()
  });

  // =========================================================================
  // 3. VENDOR ROUTE PROTECTION
  // =========================================================================
  it("should block unauthenticated access to /vendor and redirect to login", () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/vendor");

    // Act
    const response = middleware(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/auth/login");
    expect(location).toContain("role=vendor");
  });

  it("should allow unauthenticated access to public vendor registration /vendor/register", () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/vendor/register");

    // Act
    const response = middleware(request);

    // Assert
    expect(response.status).toBe(200);
  });

  it("should allow authenticated vendor to access /vendor", () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/vendor");
    request.cookies.set("souq_role", "vendor");

    // Act
    const response = middleware(request);

    // Assert
    expect(response.status).toBe(200);
  });

  // =========================================================================
  // 4. EMAIL & PASSWORD ACCOUNT AUTHENTICATION FOR ALL ROLES
  // =========================================================================
  it("should authenticate Admin account with email and password and set admin role", async () => {
    const res = await authenticateWithCredentials(
      TEST_ACCOUNTS.admin.email,
      TEST_ACCOUNTS.admin.password,
      "admin"
    );
    expect(res.success).toBe(true);
    expect(res.user?.role).toBe("admin");
    expect(res.redirectTo).toBe("/admin");
    expect(getClientRole()).toBe("admin");
  });

  it("should authenticate Vendor account with email and password and set vendor role", async () => {
    const res = await authenticateWithCredentials(
      TEST_ACCOUNTS.vendor.email,
      TEST_ACCOUNTS.vendor.password,
      "vendor"
    );
    expect(res.success).toBe(true);
    expect(res.user?.role).toBe("vendor");
    expect(res.redirectTo).toBe("/vendor");
    expect(getClientRole()).toBe("vendor");
  });

  it("should authenticate Customer account with email and password and set customer role", async () => {
    const res = await authenticateWithCredentials(
      TEST_ACCOUNTS.customer.email,
      TEST_ACCOUNTS.customer.password,
      "customer"
    );
    expect(res.success).toBe(true);
    expect(res.user?.role).toBe("customer");
    expect(res.redirectTo).toBe("/account");
    expect(getClientRole()).toBe("customer");
  });

  it("should reject invalid password or mismatched role", async () => {
    const badPass = await authenticateWithCredentials("admin@souq.sa", "WrongPassword", "admin");
    expect(badPass.success).toBe(false);

    const wrongRole = await authenticateWithCredentials(
      TEST_ACCOUNTS.customer.email,
      TEST_ACCOUNTS.customer.password,
      "admin"
    );
    expect(wrongRole.success).toBe(false);
  });
});
