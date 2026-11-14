import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_PROJECT_REF = "lazleotmwyxglqgqwyrq";
const DEFAULT_SUPABASE_URL = "https://lazleotmwyxglqgqwyrq.supabase.co";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const url = rawUrl.includes(SUPABASE_PROJECT_REF)
  ? rawUrl
  : DEFAULT_SUPABASE_URL;

const rawKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const anon = rawKey.startsWith("sb_publishable_")
  ? rawKey
  : "sb_publishable_eCNgYI7EbhYU7t2yVovEdg_xROl387f";

export type Role = "admin" | "vendor" | "customer";

/** Session-bound client (RLS applies as the signed-in user). */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** Service-role client. Server only; bypasses RLS. Never import from client code. */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export interface SessionUser {
  id: string;
  email: string | undefined;
  role: Role;
}

/** Verified user (JWT validated by Supabase) plus role read from public.profiles. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  const role = (profile?.role as Role) ?? "customer";
  return { id: data.user.id, email: data.user.email, role };
}

export class HttpAuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
  }
}

/** For route handlers / server actions. Throws HttpAuthError. */
export async function requireRole(allowed: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new HttpAuthError(401, "Not authenticated");
  if (!allowed.includes(user.role)) throw new HttpAuthError(403, "Forbidden");
  return user;
}
