import { AdminRole, canAccess } from "./auth";

export function requirePermission(
  role: AdminRole,
  permission: "VIEW" | "GENERATE" | "MODERATE" | "PUBLISH" | "ADMIN",
) {
  if (!canAccess(role, permission)) {
    throw new Error("FORBIDDEN");
  }
}
