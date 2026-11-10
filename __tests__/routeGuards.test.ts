// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { middleware } from "@/middleware";
import { NextRequest } from "next/server";
import { getClientRole, setClientRole, clearClientRole } from "@/lib/rbac";

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
});
