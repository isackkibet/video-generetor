"use server";

import * as bcrypt from "bcryptjs";
import { PrismaClient, AdminRole } from "@prisma/client";
import { requireAdminSession, canAccess } from "./auth";

const prisma = new PrismaClient();

function requireSuperAdmin() {
  const session = requireAdminSession();
  if (!canAccess(session.role, "ADMIN")) {
    throw new Error("FORBIDDEN: Only super admins can manage admin users");
  }
  return session;
}

// ✅ Helper to write audit logs
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
  const session = requireSuperAdmin();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "VIEWER") as AdminRole;

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
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

  // ✅ Audit: Admin created
  await writeAudit({
    actorId: session.id,
    action: "ADMIN_CREATED",
    targetId: created.id,
    metadata: { email, role },
  });
}

export async function changeAdminRole(formData: FormData) {
  const session = requireSuperAdmin();

  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "VIEWER") as AdminRole;

  await prisma.adminUser.update({
    where: { id },
    data: { role },
  });

  // ✅ Audit: Role changed
  await writeAudit({
    actorId: session.id,
    action: "ADMIN_ROLE_CHANGED",
    targetId: id,
    metadata: { role },
  });
}

export async function deactivateAdminUser(formData: FormData) {
  const session = requireSuperAdmin();
  const id = String(formData.get("id") || "");

  if (session.id === id) {
    throw new Error("You cannot deactivate your own account");
  }

  await prisma.adminUser.update({
    where: { id },
    data: { isActive: false },
  });

  // ✅ Audit: Deactivated
  await writeAudit({
    actorId: session.id,
    action: "ADMIN_DEACTIVATED",
    targetId: id,
  });
}

export async function reactivateAdminUser(formData: FormData) {
  const session = requireSuperAdmin();
  const id = String(formData.get("id") || "");

  await prisma.adminUser.update({
    where: { id },
    data: { isActive: true },
  });

  // ✅ Audit: Reactivated
  await writeAudit({
    actorId: session.id,
    action: "ADMIN_REACTIVATED",
    targetId: id,
  });
}

export async function resetAdminPassword(formData: FormData) {
  const session = requireSuperAdmin();
  const id = String(formData.get("id") || "");
  const password = String(formData.get("password") || "");

  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.update({
    where: { id },
    data: { passwordHash },
  });

  // ✅ Audit: Password reset
  await writeAudit({
    actorId: session.id,
    action: "ADMIN_PASSWORD_RESET",
    targetId: id,
  });
}
