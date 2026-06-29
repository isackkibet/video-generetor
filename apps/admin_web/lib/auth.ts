import { getAdminFromCookie } from "./session";

export type AdminRole =
  | "SUPER_ADMIN"
  | "CONTENT_ADMIN"
  | "MODERATOR"
  | "VIEWER";

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

export function getAdminSession(): AdminSession | null {
  return getAdminFromCookie();
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
