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
      where: {
        id: ticketId,
      },
    });

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId,
        authorId: userId,
        message: data.message,
      },
      include: {
        author: true,
      },
    });

    // ── Audit: Comment Added ──────────────────────────────────────────────
    void AuditService.log({
      organizationId: ticket.organizationId,
      userId,
      action: "COMMENT_ADDED",
      entityType: "TicketComment",
      entityId: comment.id,
      metadata: { ticketId },
    });

    return comment;
  }

  async getAll(ticketId: string) {
    return prisma.ticketComment.findMany({
      where: {
        ticketId,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async update(
    commentId: string,
    data: UpdateCommentInput
  ) {
    return prisma.ticketComment.update({
      where: {
        id: commentId,
      },
      data: {
        message: data.message,
      },
    });
  }

  async delete(commentId: string) {
    await prisma.ticketComment.delete({
      where: {
        id: commentId,
      },
    });

    return {
      message: "Comment deleted successfully.",
    };
  }
}

export = new CommentService();