// lib/rbac.ts
import { supabase } from "@/lib/supabase";

export type Role = "admin" | "vendor" | "customer";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  vendorId?: string;
}

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export class ForbiddenError extends AuthError {
  constructor(message: string = "ليس لديك الصلاحية للوصول إلى لوحة التحكم الإدارية") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

/**
 * Verify JWT token payload and extract user claim.
 */
export function verifyJwtToken(token: string | null | undefined): { userId: string; role: Role; exp: number } {
  if (!token) {
    throw new AuthError("رمز المصادقة (Token) غير متوفر", 401);
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new AuthError("رمز المصادقة غير صالح أو مشوه", 401);
    }

    // Decode base64 payload
    const payloadStr = Buffer.from(parts[1], "base64").toString("utf-8");
    const payload = JSON.parse(payloadStr);

    if (!payload.sub && !payload.userId) {
      throw new AuthError("رمز المصادقة يفتقر إلى معرّف المستخدم (sub/userId)", 401);
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new AuthError("انتهت صلاحية جلسة الدخول (Token Expired)", 401);
    }

    const role: Role = payload.role === "admin" || payload.role === "vendor" ? payload.role : "customer";
    return {
      userId: payload.sub || payload.userId,
      role,
      exp: payload.exp || now + 3600,
    };
  } catch (err: any) {
    if (err instanceof AuthError) throw err;
    throw new AuthError("فشل فك تشفير وتدقيق رمز المصادقة", 401);
  }
}

/**
 * Guard function to enforce Role-Based Access Control (RBAC).
 */
export function requireRole(user: { role: Role } | null | undefined, allowedRoles: Role[]): boolean {
  if (!user) {
    throw new AuthError("يجب تسجيل الدخول أولاً للوصول إلى هذا المورد", 401);
  }

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`صلاحية غير كافية: الدور (${user.role}) غير مصرح له بتنفيذ هذه العملية.`);
  }

  return true;
}

/**
 * Check if the active session has Admin role privileges.
 */
export function requireAdmin(user: { role: Role } | null | undefined): boolean {
  return requireRole(user, ["admin"]);
}

/**
 * Verify if current caller can manage vendor resource (Vendor himself or Admin).
 */
export function canManageVendor(user: AuthUser | null | undefined, targetVendorId: string): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.role === "vendor" && user.vendorId === targetVendorId;
}

/**
 * Retrieve current client role from document cookies or localStorage.
 */
export function getClientRole(): Role | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )souq_role=([^;]*)"));
  if (match) return decodeURIComponent(match[1]) as Role;
  const local = localStorage.getItem("souq_role");
  return (local as Role) || null;
}

/**
 * Persist client role to cookies and localStorage for seamless route guards.
 */
export function setClientRole(role: Role) {
  if (typeof window === "undefined") return;
  document.cookie = `souq_role=${encodeURIComponent(role)}; path=/; max-age=604800; SameSite=Lax`;
  try {
    localStorage.setItem("souq_role", role);
  } catch (_) {}
}

/**
 * Clear client role on sign out.
 */
export function clearClientRole() {
  if (typeof window === "undefined") return;
  document.cookie = "souq_role=; path=/; max-age=0; SameSite=Lax";
  try {
    localStorage.removeItem("souq_role");
  } catch (_) {}
}
