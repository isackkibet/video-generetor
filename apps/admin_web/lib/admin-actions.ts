"use server";
import * as bcrypt from "bcryptjs";
import { PrismaClient, AdminRole } from "@prisma/client";
import { requireAdminSession, canAccess } from "./auth";
import { redirectError, redirectSuccess } from "./action-result";
const prisma = new PrismaClient();
function requireSuperAdmin() {
  const session = requireAdminSession();
  if (!canAccess(session.role, "ADMIN")) {
    throw new Error("Only super admins can manage admin users");
  }
  return session;
}
async function writeAudit(input: {
  actorId?: string;
  action: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.adminAuditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetId: input.targetId,
      metadata: input.metadata,
    },
  });
}
export async function createAdminUser(formData: FormData) {
  try {
    const session = requireSuperAdmin();
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "")
      .toLowerCase()
      .trim();
    const password = String(formData.get("password") || "");
    const role = String(formData.get("role") || "VIEWER") as AdminRole;
    if (!name || !email || !password) {
      return redirectError(
        "/admin-users",
        "Name, email, and password are required.",
      );
    }
    if (password.length < 8) {
      return redirectError(
        "/admin-users",
        "Password must be at least 8 characters.",
      );
    }
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return redirectError(
        "/admin-users",
        "An admin with this email already exists.",
      );
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const created = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        isActive: true,
      },
    });
    await writeAudit({
      actorId: session.id,
      action: "ADMIN_CREATED",
      targetId: created.id,
      metadata: { email, role },
    });
    return redirectSuccess("/admin-users", "Admin user created successfully.");
  } catch (error) {
    return redirectError(
      "/admin-users",
      error instanceof Error ? error.message : "Failed to create admin user.",
    );
  }
}
export async function changeAdminRole(formData: FormData) {
  try {
    const session = requireSuperAdmin();
    const id = String(formData.get("id") || "");
    const role = String(formData.get("role") || "VIEWER") as AdminRole;
    if (!id) {
      return redirectError("/admin-users", "Missing admin user ID.");
    }
    await prisma.adminUser.update({
      where: { id },
      data: { role },
    });
    await writeAudit({
      actorId: session.id,
      action: "ADMIN_ROLE_CHANGED",
      targetId: id,
      metadata: { role },
    });
    return redirectSuccess("/admin-users", "Admin role updated successfully.");
  } catch (error) {
    return redirectError(
      "/admin-users",
      error instanceof Error ? error.message : "Failed to update admin role.",
    );
  }
}
export async function deactivateAdminUser(formData: FormData) {
  try {
    const session = requireSuperAdmin();
    const id = String(formData.get("id") || "");
    if (!id) {
      return redirectError("/admin-users", "Missing admin user ID.");
    }
    if (session.id === id) {
      return redirectError(
        "/admin-users",
        "You cannot deactivate your own account.",
      );
    }
    await prisma.adminUser.update({
      where: { id },
      data: { isActive: false },
    });
    await writeAudit({
      actorId: session.id,
      action: "ADMIN_DEACTIVATED",
      targetId: id,
    });
    return redirectSuccess(
      "/admin-users",
      "Admin user deactivated successfully.",
    );
  } catch (error) {
    return redirectError(
      "/admin-users",
      error instanceof Error
        ? error.message
        : "Failed to deactivate admin user.",
    );
  }
}
export async function reactivateAdminUser(formData: FormData) {
  try {
    const session = requireSuperAdmin();
    const id = String(formData.get("id") || "");
    if (!id) {
      return redirectError("/admin-users", "Missing admin user ID.");
    }
    await prisma.adminUser.update({
      where: { id },
      data: { isActive: true },
    });
    await writeAudit({
      actorId: session.id,
      action: "ADMIN_REACTIVATED",
      targetId: id,
    });
    return redirectSuccess(
      "/admin-users",
      "Admin user reactivated successfully.",
    );
  } catch (error) {
    return redirectError(
      "/admin-users",
      error instanceof Error
        ? error.message
        : "Failed to reactivate admin user.",
    );
  }
}
export async function resetAdminPassword(formData: FormData) {
  try {
    const session = requireSuperAdmin();
    const id = String(formData.get("id") || "");
    const password = String(formData.get("password") || "");
    if (!id) {
      return redirectError("/admin-users", "Missing admin user ID.");
    }
    if (!password || password.length < 8) {
      return redirectError(
        "/admin-users",
        "Password must be at least 8 characters.",
      );
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });
    await writeAudit({
      actorId: session.id,
      action: "ADMIN_PASSWORD_RESET",
      targetId: id,
    });
    return redirectSuccess(
      "/admin-users",
      "Admin password reset successfully.",
    );
  } catch (error) {
    return redirectError(
      "/admin-users",
      error instanceof Error
        ? error.message
        : "Failed to reset admin password.",
    );
  }
}
