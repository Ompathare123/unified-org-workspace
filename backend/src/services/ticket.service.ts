import prisma from "../config/prisma";
import { TicketStatus, TicketPriority } from "@prisma/client";
import { CreateTicketInput, UpdateTicketInput } from "../types/ticket";
import AuditService from "./audit.service";
import NotificationService from "./notification.service";

class TicketService {
  private async getUserOrgId(userId: string, preferredOrgId?: string): Promise<string> {
    if (preferredOrgId) {
      const mem = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId, organizationId: preferredOrgId } },
      });
      if (mem) return mem.organizationId;
    }

    const membership = await prisma.membership.findFirst({
      where: { userId },
    });

    if (!membership) {
      throw new Error("User does not belong to any organization.");
    }

    return membership.organizationId;
  }

  async create(userId: string, data: CreateTicketInput, preferredOrgId?: string) {
    const orgId = await this.getUserOrgId(userId, preferredOrgId);

    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description || "",
        status: (data.status as TicketStatus) || TicketStatus.OPEN,
        priority: (data.priority as TicketPriority) || TicketPriority.MEDIUM,
        createdById: userId,
        organizationId: orgId,
      },
    });


    // ── Audit: Ticket Created ──────────────────────────────────────────────
    void AuditService.log({
      organizationId: orgId,
      userId,
      action: "TICKET_CREATED",
      entityType: "Ticket",
      entityId: ticket.id,
      metadata: { title: ticket.title },
    });

    return ticket;
  }

  async getAll(userId: string, preferredOrgId?: string) {
    const orgId = await this.getUserOrgId(userId, preferredOrgId);

    return prisma.ticket.findMany({
      where: {
        organizationId: orgId,
      },

      include: {
        createdBy: true,
        assignedTo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getById(ticketId: string, userId: string, preferredOrgId?: string) {
    const orgId = await this.getUserOrgId(userId, preferredOrgId);

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId, organizationId: orgId },
      include: {
        createdBy: true,
        assignedTo: true,
        comments: true,
        attachments: true,
      },
    });

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    return ticket;
  }

  async update(ticketId: string, userId: string, data: UpdateTicketInput) {
    const membership = await prisma.membership.findFirst({
      where: { userId },
    });

    if (!membership) throw new Error("Unauthorized.");

    // Fetch org for audit log and IDOR check before updating.
    const existing = await prisma.ticket.findUnique({
      where: { id: ticketId, organizationId: membership.organizationId },
      select: { organizationId: true, assignedToId: true },
    });

    if (!existing) {
      throw new Error("Ticket not found or unauthorized.");
    }

    if (membership.role === "DEVELOPER") {
      if (data.title || data.description || data.assignedToId) {
        throw new Error("Developers can only update ticket status.");
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status as TicketStatus,
        ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
      },
    });

    // ── Audit: Ticket Updated ──────────────────────────────────────────────
    void AuditService.log({
      organizationId: existing.organizationId,
      userId,
      action: "TICKET_UPDATED",
      entityType: "Ticket",
      entityId: ticketId,
      metadata: { updatedFields: Object.keys(data).filter((k) => data[k as keyof UpdateTicketInput] !== undefined) },
    });

    if (data.assignedToId && data.assignedToId !== existing.assignedToId) {
      void NotificationService.send({
        organizationId: existing.organizationId,
        userId: data.assignedToId,
        type: "SYSTEM",
        title: "Ticket Assigned",
        message: `You have been assigned ticket: ${ticket.title}`,
        metadata: { ticketId: ticket.id },
      });
    }

    return ticket;
  }

  async delete(ticketId: string, userId: string) {
    const orgId = await this.getUserOrgId(userId);

    // Fetch org before deleting (record won't exist after).
    const existing = await prisma.ticket.findUnique({
      where: { id: ticketId, organizationId: orgId },
      select: { organizationId: true, title: true },
    });

    if (!existing) {
      throw new Error("Ticket not found or unauthorized.");
    }

    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    // ── Audit: Ticket Deleted ──────────────────────────────────────────────
    void AuditService.log({
      organizationId: existing.organizationId,
      userId,
      action: "TICKET_DELETED",
      entityType: "Ticket",
      entityId: ticketId,
      metadata: { title: existing.title },
    });

    return { message: "Ticket deleted successfully." };
  }
}

export default new TicketService();