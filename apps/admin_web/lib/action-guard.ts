"use server";
import { requireAdminSession, canAccess } from "./auth";
export async function requireActionPermission(
  permission: "VIEW" | "GENERATE" | "MODERATE" | "PUBLISH" | "ADMIN",
) {
  const session = requireAdminSession();
  if (!canAccess(session.role, permission)) {
    throw new Error(`FORBIDDEN: ${session.role} cannot perform ${permission}`);
  }
  return session;
}
