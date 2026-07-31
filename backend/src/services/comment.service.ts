import prisma from "../config/prisma";
import {
  CreateCommentInput,
  UpdateCommentInput,
} from "../types/comment";
import AuditService from "./audit.service";

class CommentService {
  async create(
    ticketId: string,
    userId: string,
    data: CreateCommentInput
  ) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { organizationId: true },
    });

    if (!ticket) throw new Error("Ticket not found.");

    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: ticket.organizationId } },
    });

    if (!membership) throw new Error("Unauthorized to comment on this ticket.");

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId,
        userId,
        content: data.content,
      },
      include: { user: true },
    });

    void AuditService.log({
      organizationId: ticket.organizationId,
      userId,
      action: "COMMENT_CREATED",
      entityType: "TicketComment",
      entityId: comment.id,
      metadata: { ticketId },
    });

    return comment;
  }

  async getAll(ticketId: string, userId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { organizationId: true },
    });

    if (!ticket) throw new Error("Ticket not found.");

    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: ticket.organizationId } },
    });

    if (!membership) throw new Error("Unauthorized to view comments on this ticket.");

    return prisma.ticketComment.findMany({
      where: { ticketId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async update(commentId: string, userId: string, data: UpdateCommentInput) {
    const existing = await prisma.ticketComment.findUnique({
      where: { id: commentId },
      include: { ticket: { select: { organizationId: true } } },
    });

    if (!existing) throw new Error("Comment not found.");
    if (existing.isDeleted) throw new Error("Cannot edit a deleted comment.");

    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: existing.ticket.organizationId } },
    });

    if (!membership) throw new Error("Unauthorized.");

    if (existing.userId !== userId && membership.role !== "ORG_ADMIN" && membership.role !== "PLATFORM_ADMIN") {
      throw new Error("You can only edit your own comments.");
    }

    const updated = await prisma.ticketComment.update({
      where: { id: commentId },
      data: {
        content: data.content,
        isEdited: true,
      },
      include: { user: true },
    });

    void AuditService.log({
      organizationId: existing.ticket.organizationId,
      userId,
      action: "COMMENT_EDITED",
      entityType: "TicketComment",
      entityId: commentId,
    });

    return updated;
  }

  async delete(commentId: string, userId: string) {
    const existing = await prisma.ticketComment.findUnique({
      where: { id: commentId },
      include: { ticket: { select: { organizationId: true } } },
    });

    if (!existing) throw new Error("Comment not found.");
    if (existing.isDeleted) throw new Error("Comment is already deleted.");

    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: existing.ticket.organizationId } },
    });

    if (!membership) throw new Error("Unauthorized.");

    if (existing.userId !== userId && membership.role !== "ORG_ADMIN" && membership.role !== "PLATFORM_ADMIN") {
      throw new Error("You can only delete your own comments.");
    }

    await prisma.ticketComment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    void AuditService.log({
      organizationId: existing.ticket.organizationId,
      userId,
      action: "COMMENT_DELETED",
      entityType: "TicketComment",
      entityId: commentId,
    });

    return { message: "Comment deleted successfully." };
  }
}

export default new CommentService();