import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow login page
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const cookieName = process.env.ADMIN_SESSION_COOKIE || "yohpal_admin_session";
  const session = request.cookies.get(cookieName);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
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
  ],
};
