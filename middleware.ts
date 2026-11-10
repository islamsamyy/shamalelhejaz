import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("souq_role")?.value;

  // 1. Protect Admin routes: /admin and any sub-routes
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("role", "admin");
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect Vendor Hub: /vendor and sub-routes (EXCEPT public registration /vendor/register)
  if (pathname.startsWith("/vendor") && pathname !== "/vendor/register") {
    if (role !== "vendor" && role !== "admin") {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("role", "vendor");
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*"],
};
