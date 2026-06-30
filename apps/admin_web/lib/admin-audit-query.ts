import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export type AdminAuditQuery = {
  actorId?: string;
  targetId?: string;
  action?: string;
  take?: number;
};
export async function listAdminAuditLogs(query: AdminAuditQuery) {
  return prisma.adminAuditLog.findMany({
    where: {
      actorId: query.actorId || undefined,
      targetId: query.targetId || undefined,
      action: query.action || undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: query.take || 100,
  });
}
export async function getAdminAuditSummary() {
  const [total, created, roleChanged, deactivated, reactivated, passwordReset] =
    await Promise.all([
      prisma.adminAuditLog.count(),
      prisma.adminAuditLog.count({ where: { action: "ADMIN_CREATED" } }),
      prisma.adminAuditLog.count({ where: { action: "ADMIN_ROLE_CHANGED" } }),
      prisma.adminAuditLog.count({ where: { action: "ADMIN_DEACTIVATED" } }),
      prisma.adminAuditLog.count({ where: { action: "ADMIN_REACTIVATED" } }),
      prisma.adminAuditLog.count({ where: { action: "ADMIN_PASSWORD_RESET" } }),
    ]);
  return {
    total,
    created,
    roleChanged,
    deactivated,
    reactivated,
    passwordReset,
  };
}
