import prisma from "../config/prisma";
import { AuditLogFilters, CreateAuditInput } from "../types/audit";

class AuditService {
  // ─────────────────────────────────────────────────────────────────────────
  // log()
  //
  // Fire-and-forget helper called by every write service.
  // NEVER throws — a logging failure must never break a business operation.
  // ─────────────────────────────────────────────────────────────────────────
  async log(input: CreateAuditInput): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          organizationId: input.organizationId,
          userId: input.userId,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          metadata: input.metadata ? (input.metadata as any) : undefined,
        },
      });
    } catch {
      // Intentionally swallow — audit failures are non-fatal.
      // In production, forward to an error tracker here.
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/audit-logs
  // Returns org-scoped logs, newest first.
  // Supports optional filters: startDate, endDate, userId, entityType, action
  // ─────────────────────────────────────────────────────────────────────────
  async getAll(requestingUserId: string, filters: AuditLogFilters, preferredOrgId?: string) {
    let organizationId = preferredOrgId;

    if (organizationId) {
      const mem = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId: requestingUserId, organizationId } },
      });
      if (!mem) organizationId = undefined;
    }

    if (!organizationId) {
      const membership = await prisma.membership.findFirst({
        where: { userId: requestingUserId },
        select: { organizationId: true },
      });

      if (!membership) {
        throw new Error("User does not belong to any organization.");
      }

      organizationId = membership.organizationId;
    }

    const where: Record<string, unknown> = { organizationId };


    if (filters.userId) where.userId = filters.userId;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.action) where.action = filters.action;

    if (filters.startDate || filters.endDate) {
      const createdAt: Record<string, Date> = {};
      if (filters.startDate) createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) createdAt.lte = new Date(filters.endDate);
      where.createdAt = createdAt;
    }

    return prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/audit-logs/:id
  // Returns one audit record — org-scoped.
  // ─────────────────────────────────────────────────────────────────────────
  async getById(auditLogId: string, requestingUserId: string) {
    const membership = await prisma.membership.findFirst({
      where: { userId: requestingUserId },
      select: { organizationId: true },
    });

    if (!membership) {
      throw new Error("User does not belong to any organization.");
    }

    const log = await prisma.auditLog.findUnique({
      where: { id: auditLogId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!log) {
      throw new Error("Audit log not found.");
    }

    // Enforce org isolation — users cannot read another org's audit logs.
    if (log.organizationId !== membership.organizationId) {
      throw new Error("Access denied.");
    }

    return log;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/audit-logs/export
  // Returns the org's audit logs as a CSV string.
  // Columns: timestamp, user, action, entityType, entityId
  // ─────────────────────────────────────────────────────────────────────────
  async exportCsv(requestingUserId: string, preferredOrgId?: string): Promise<string> {
    const logs = await this.getAll(requestingUserId, {}, preferredOrgId);


    const header = "timestamp,user,action,entityType,entityId";

    const rows = logs.map((l) => {
      const timestamp = l.createdAt.toISOString();
      const user = `"${l.user.fullName} <${l.user.email}>"`;
      const action = `"${l.action}"`;
      const entityType = `"${l.entityType}"`;
      const entityId = `"${l.entityId}"`;
      return [timestamp, user, action, entityType, entityId].join(",");
    });

    return [header, ...rows].join("\n");
  }
}

export default new AuditService();
