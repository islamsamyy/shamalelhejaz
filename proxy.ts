import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

function redirectToLogin(request: NextRequest, role: "admin" | "vendor", error: string) {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("role", role);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  loginUrl.searchParams.set("error", error);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() validates the JWT with Supabase (never trust unverified cookies).
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const isAdminArea = pathname.startsWith("/admin");
  const isVendorArea = pathname.startsWith("/vendor") && pathname !== "/vendor/register";
  const isAccountArea = pathname.startsWith("/account");

  if (isAdminArea || isVendorArea || isAccountArea) {
    if (!user) {
      return redirectToLogin(request, isAdminArea ? "admin" : "vendor", "unauthorized");
    }
    if (isAdminArea || isVendorArea) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      const role = profile?.role;
      if (isAdminArea && role !== "admin") return redirectToLogin(request, "admin", "forbidden");
      if (isVendorArea && role !== "vendor" && role !== "admin") {
        return redirectToLogin(request, "vendor", "forbidden");
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*", "/account/:path*", "/api/admin/:path*"],
};
