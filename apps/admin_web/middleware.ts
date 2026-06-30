import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth/login")) {
    return NextResponse.next();
  }

  const cookieName = process.env.ADMIN_SESSION_COOKIE || "yohpal_admin_session";
  const token = request.cookies.get(cookieName)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET || "dev-secret");
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/",
    "/trends/:path*",
    "/scripts/:path*",
    "/videos/:path*",
    "/moderation/:path*",
    "/provider-jobs/:path*",
    "/script-provider-logs/:path*",
    "/feed-diagnostics/:path*",
    "/admin-users/:path*",
    "/admin-audit-logs/:path*",
    "/api/admin/:path*",
  ],
};
