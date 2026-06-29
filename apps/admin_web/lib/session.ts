import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
export type AdminJwtPayload = {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "CONTENT_ADMIN" | "MODERATOR" | "VIEWER";
};
const cookieName = process.env.ADMIN_SESSION_COOKIE || "yohpal_admin_session";
export function signAdminToken(payload: AdminJwtPayload): string {
  return jwt.sign(payload, process.env.ADMIN_JWT_SECRET || "dev-secret", {
    expiresIn: "12h",
  });
}
export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    return jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET || "dev-secret",
    ) as AdminJwtPayload;
  } catch {
    return null;
  }
}
export function setAdminCookie(token: string) {
  cookies().set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}
export function clearAdminCookie() {
  cookies().delete(cookieName);
}
export function getAdminFromCookie(): AdminJwtPayload | null {
  const token = cookies().get(cookieName)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
