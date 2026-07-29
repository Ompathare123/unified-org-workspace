import prisma from "../config/prisma";

import { TicketStatus } from "@prisma/client";
import {
  CreateTicketInput,
  UpdateTicketInput,
} from "../types/ticket";

class TicketService {
  async create(userId: string, data: CreateTicketInput) {
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
      },
    });

    if (!membership) {
      throw new Error("User does not belong to any organization.");
    }

    return prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        createdById: userId,
        organizationId: membership.organizationId,
      },
    });
  }

  async getAll(userId: string) {
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
      },
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
      where: {
        id: ticketId,
      },
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

  async update(ticketId: string, data: UpdateTicketInput) {
    return prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        title: data.title,
        description: data.description,
        status: data.status as TicketStatus,
      },
    });
  }

  async delete(ticketId: string) {
    await prisma.ticket.delete({
      where: {
        id: ticketId,
      },
    });

    return {
      message: "Ticket deleted successfully.",
    };
  }
}

export default new TicketService();