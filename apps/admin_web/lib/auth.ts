import { cookies } from "next/headers";

export type AdminRole =
  | "SUPER_ADMIN"
  | "CONTENT_ADMIN"
  | "MODERATOR"
  | "VIEWER";

export type AdminSession = {
  email: string;
  name: string;
  role: AdminRole;
};

export function getAdminSession(): AdminSession | null {
  const cookieName = process.env.ADMIN_SESSION_COOKIE || "yohpal_admin_session";
  const value = cookies().get(cookieName)?.value;

  if (!value) return null;

  try {
    return JSON.parse(Buffer.from(value, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

export function requireAdminSession() {
  const session = getAdminSession();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export function canAccess(
  role: AdminRole,
  permission: "VIEW" | "GENERATE" | "MODERATE" | "PUBLISH" | "ADMIN",
): boolean {
  const matrix: Record<AdminRole, string[]> = {
    SUPER_ADMIN: ["VIEW", "GENERATE", "MODERATE", "PUBLISH", "ADMIN"],
    CONTENT_ADMIN: ["VIEW", "GENERATE"],
    MODERATOR: ["VIEW", "MODERATE", "PUBLISH"],
    VIEWER: ["VIEW"],
  };

  return matrix[role].includes(permission);
}
