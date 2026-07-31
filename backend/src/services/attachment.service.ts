import prisma from "../config/prisma";
import { CreateAttachmentInput } from "../types/attachment";
import AuditService from "./audit.service";
import fs from "fs/promises";
import path from "path";

class AttachmentService {
  // ─────────────────────────────────────────────────────────────────────────
  // Internal helper: verify the ticket exists and return its organizationId.
  // Throws if not found.
  // ─────────────────────────────────────────────────────────────────────────
  private async requireTicket(ticketId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, organizationId: true },
    });

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    return ticket;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internal helper: verify the requesting user is a member of the org that
  // owns this ticket.  Enforces org-scoped access at the query layer.
  // ─────────────────────────────────────────────────────────────────────────
  private async requireOrgMembership(
    userId: string,
    organizationId: string
  ): Promise<void> {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
      select: { id: true },
    });

    if (!membership) {
      throw new Error(
        "Access denied. You are not a member of this organization."
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/tickets/:ticketId/attachments
  //  - ticketId    populated from route param
  //  - uploadedById populated from JWT
  //  - Ticket must exist
  //  - User must belong to the ticket's organization
  // ─────────────────────────────────────────────────────────────────────────
  async create(
    ticketId: string,
    userId: string,
    data: CreateAttachmentInput
  ) {
    const ticket = await this.requireTicket(ticketId);
    await this.requireOrgMembership(userId, ticket.organizationId);

    const attachment = await prisma.ticketAttachment.create({
      data: {
        ticketId,
        uploadedById: userId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // ── Audit: Attachment Uploaded ─────────────────────────────────────────
    void AuditService.log({
      organizationId: ticket.organizationId,
      userId,
      action: "ATTACHMENT_UPLOADED",
      entityType: "TicketAttachment",
      entityId: attachment.id,
      metadata: { fileName: data.fileName, fileSize: data.fileSize },
    });

    return attachment;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/tickets/:ticketId/attachments
  //  Returns all attachments ordered by createdAt ASC.
  //  Includes uploader details and full file metadata.
  //  User must belong to the ticket's organization.
  // ─────────────────────────────────────────────────────────────────────────
  async getByTicket(ticketId: string, userId: string) {
    const ticket = await this.requireTicket(ticketId);
    await this.requireOrgMembership(userId, ticket.organizationId);

    return prisma.ticketAttachment.findMany({
      where: { ticketId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/attachments/:attachmentId
  //  Returns one attachment with uploader, ticket, and organization.
  //  User must belong to the ticket's organization.
  // ─────────────────────────────────────────────────────────────────────────
  async getById(attachmentId: string, userId: string) {
    const attachment = await prisma.ticketAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        ticket: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      throw new Error("Attachment not found.");
    }

    await this.requireOrgMembership(userId, attachment.ticket.organizationId);

    return attachment;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE /api/attachments/:attachmentId
  //  Deletes the attachment record only — parent ticket is untouched.
  //  User must belong to the ticket's organization.
  // ─────────────────────────────────────────────────────────────────────────
  async delete(attachmentId: string, userId: string) {
    const attachment = await prisma.ticketAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        ticket: {
          select: { organizationId: true },
        },
      },
    });

    if (!attachment) {
      throw new Error("Attachment not found.");
    }

    await this.requireOrgMembership(userId, attachment.ticket.organizationId);

    await prisma.ticketAttachment.delete({
      where: { id: attachmentId },
    });

    // ── Delete Physical File ──────────────────────────────────────────────
    if (attachment.fileUrl.startsWith("/uploads/")) {
      try {
        const filePath = path.join(__dirname, "../../", attachment.fileUrl.replace(/^\//, ""));
        await fs.unlink(filePath);
      } catch (err) {
        console.error("Failed to delete physical file:", err);
      }
    }

    // ── Audit: Attachment Deleted ─────────────────────────────────────────
    void AuditService.log({
      organizationId: attachment.ticket.organizationId,
      userId,
      action: "ATTACHMENT_DELETED",
      entityType: "TicketAttachment",
      entityId: attachmentId,
      metadata: { fileName: attachment.fileName },
    });

    return { message: "Attachment deleted successfully." };
  }
}

export default new AttachmentService();
