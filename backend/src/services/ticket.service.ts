import prisma from "../config/prisma";
import { TicketStatus } from "@prisma/client";
import { CreateTicketInput, UpdateTicketInput } from "../types/ticket";
import AuditService from "./audit.service";

class TicketService {
  async create(userId: string, data: CreateTicketInput) {
    const membership = await prisma.membership.findFirst({
      where: { userId },
    });

    if (!membership) {
      throw new Error("User does not belong to any organization.");
    }

    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        createdById: userId,
        organizationId: membership.organizationId,
      },
    });

    // ── Audit: Ticket Created ──────────────────────────────────────────────
    void AuditService.log({
      organizationId: membership.organizationId,
      userId,
      action: "TICKET_CREATED",
      entityType: "Ticket",
      entityId: ticket.id,
      metadata: { title: ticket.title },
    });

    return ticket;
  }

  async getAll(userId: string) {
    const membership = await prisma.membership.findFirst({
      where: { userId },
    });

    if (!membership) {
      throw new Error("Organization not found.");
    }

    return prisma.ticket.findMany({
      where: {
        organizationId: membership.organizationId,
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

  async getById(ticketId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
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
    // Fetch org for audit log before updating.
    const existing = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { organizationId: true },
    });

    if (!existing) {
      throw new Error("Ticket not found.");
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status as TicketStatus,
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

    return ticket;
  }

  async delete(ticketId: string, userId: string) {
    // Fetch org before deleting (record won't exist after).
    const existing = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { organizationId: true, title: true },
    });

    if (!existing) {
      throw new Error("Ticket not found.");
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