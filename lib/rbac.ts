// lib/rbac.ts
import { supabase } from "@/lib/supabase";

export type Role = "admin" | "vendor" | "customer";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  vendorId?: string;
}

export interface TestAccountCredential {
  id: string;
  email: string;
  altEmails: string[];
  password: string;
  altPasswords: string[];
  name: string;
  role: Role;
  phone: string;
  identifier?: string;
  vendorId?: string;
  redirectTo: string;
}

export const TEST_ACCOUNTS: Record<Role, TestAccountCredential> = {
  customer: {
    id: "usr-customer-001",
    email: "customer@souq.sa",
    altEmails: ["customer@example.com", "vip@souq.sa", "0501234567"],
    password: "Customer@123",
    altPasswords: ["CustomerPass123", "123456", "1234"],
    name: "سلطان العتيبي (مقتني VIP)",
    role: "customer",
    phone: "0501234567",
    redirectTo: "/account",
  },
  vendor: {
    id: "usr-vendor-001",
    email: "vendor@souq.sa",
    altEmails: ["vendor@example.com", "b2b@souq.sa", "1010884920"],
    password: "Vendor@123",
    altPasswords: ["VendorPass123", "123456"],
    name: "شركة آفاق التقنية للتجارة (B2B)",
    role: "vendor",
    phone: "0559876543",
    identifier: "1010884920",
    vendorId: "modern-tech",
    redirectTo: "/vendor",
  },
  admin: {
    id: "usr-admin-001",
    email: "admin@souq.sa",
    altEmails: ["admin@example.com", "root@souq.sa", "KSA-ADM-901"],
    password: "Admin@123",
    altPasswords: ["AdminPass123", "123456"],
    name: "م. فهد السبيعي (المشرف العام)",
    role: "admin",
    phone: "0500000001",
    identifier: "KSA-ADM-901",
    redirectTo: "/admin",
  },
};

/**
 * Authenticate user credentials against built-in test accounts or Supabase Auth.
 */
export async function authenticateWithCredentials(
  emailOrId: string,
  password: string,
  expectedRole?: Role
): Promise<{ success: boolean; user?: AuthUser; redirectTo?: string; error?: string }> {
  const normalizedInput = emailOrId.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!normalizedInput || !trimmedPassword) {
    return { success: false, error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" };
  }

  // 1. Check built-in test accounts first
  for (const account of Object.values(TEST_ACCOUNTS)) {
    const emailMatches =
      account.email.toLowerCase() === normalizedInput ||
      account.altEmails.some((alt) => alt.toLowerCase() === normalizedInput);

    const passwordMatches =
      account.password === trimmedPassword ||
      account.altPasswords.includes(trimmedPassword);

    if (emailMatches && passwordMatches) {
      if (expectedRole && account.role !== expectedRole) {
        return {
          success: false,
          error: `هذا الحساب مخصص لدور (${account.role}) وليس الدور المحدد حالياً`,
        };
      }
      const authUser: AuthUser = {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
        vendorId: account.vendorId,
      };
      setClientRole(account.role);
      setClientUser(authUser);
      return {
        success: true,
        user: authUser,
        redirectTo: account.redirectTo,
      };
    }
  }

  // 2. Try Supabase Auth if it looks like an email
  if (normalizedInput.includes("@")) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedInput,
        password: trimmedPassword,
      });

      if (!error && data?.user) {
        const resolvedRole: Role =
          (data.user.user_metadata?.role as Role) || expectedRole || "customer";
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || normalizedInput,
          name: data.user.user_metadata?.full_name || normalizedInput.split("@")[0],
          role: resolvedRole,
        };
        setClientRole(resolvedRole);
        setClientUser(authUser);
        return {
          success: true,
          user: authUser,
          redirectTo: TEST_ACCOUNTS[resolvedRole]?.redirectTo || "/account",
        };
      }
    } catch (_) {
      // Fallback if Supabase network is unreachable
    }
  }

  return {
    success: false,
    error: "بيانات الدخول غير صحيحة. تأكد من البريد الإلكتروني وكلمة المرور.",
  };
}

export function setClientUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("souq_user", JSON.stringify(user));
  } catch (_) {}
}

export function getClientUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("souq_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch (_) {
    return null;
  }
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
    localStorage.removeItem("souq_user");
  } catch (_) {}
}
