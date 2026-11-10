// lib/rbac.ts
// Role-based access control helpers. The source of truth for a user's role is
// public.profiles.role in Supabase; nothing here trusts client-writable state.
import { supabase } from "@/lib/supabase";

export type Role = "admin" | "vendor" | "customer";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  vendorId?: string;
}

export const ROLE_HOME: Record<Role, string> = {
  customer: "/account",
  vendor: "/vendor",
  admin: "/admin",
};

/** Read the verified current user + DB role (client side). Returns null when signed out. */
export async function fetchClientUser(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", data.user.id)
    .maybeSingle();
  const role: Role =
    profile?.role === "admin" || profile?.role === "vendor" ? profile.role : "customer";
  let vendorId: string | undefined;
  if (role === "vendor") {
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("owner_id", data.user.id)
      .maybeSingle();
    vendorId = vendor?.id;
  }
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: profile?.full_name ?? data.user.email?.split("@")[0],
    role,
    vendorId,
  };
}

/** Convenience for UI guards: the DB role of the signed-in user, or null. */
export async function fetchClientRole(): Promise<Role | null> {
  return (await fetchClientUser())?.role ?? null;
}

/**
 * Sign in with Supabase Auth. The role comes from the database, never from the
 * caller. If expectedRole is given and the account has a different role, the
 * session is discarded and an error is returned.
 */
export async function signInWithCredentials(
  email: string,
  password: string,
  expectedRole?: Role
): Promise<{ success: boolean; user?: AuthUser; redirectTo?: string; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { success: false, error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" };
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });
  if (error) {
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes("invalid api key") || msg.includes("apikey")) {
      return {
        success: false,
        error: "خطأ في مفتاح الاتصال بقاعدة البيانات (Supabase Publishable Key).",
      };
    }
    return {
      success: false,
      error: "بيانات الدخول غير صحيحة. تأكد من البريد الإلكتروني وكلمة المرور.",
    };
  }
  const user = await fetchClientUser();
  if (!user) return { success: false, error: "تعذر تحميل بيانات الحساب." };

  const allowed =
    !expectedRole ||
    user.role === expectedRole ||
    // admins may enter the vendor hub
    (expectedRole === "vendor" && user.role === "admin");
  if (!allowed) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: `هذا الحساب مخصص لدور (${user.role}) وليس الدور المحدد حالياً`,
    };
  }
  return { success: true, user, redirectTo: ROLE_HOME[user.role] };
}

export async function signOutClient() {
  await supabase.auth.signOut();
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
 * Guard function to enforce Role-Based Access Control (RBAC).
 * `user` must come from a verified session (see getSessionUser in lib/supabase-server).
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
