import prisma from "../config/prisma";
import { CreateShareInput } from "../types/share";
import { ConnectionStatus, SharedItemType } from "@prisma/client";
import AuditService from "./audit.service";
import NotificationService from "./notification.service";

class ShareService {
  private async getUserOrgId(userId: string): Promise<string> {
    const membership = await prisma.membership.findFirst({
      where: { userId },
    });
    if (!membership) {
      throw new Error("User does not belong to any organization.");
    }
    return membership.organizationId;
  }

  // 1. POST /api/share
  async shareItem(userId: string, data: CreateShareInput) {
    const myOrgId = await this.getUserOrgId(userId);

    // Get the target user's org
    const targetUserMembership = await prisma.membership.findFirst({
      where: { userId: data.sharedWithUserId },
    });

    if (!targetUserMembership) {
      throw new Error("Target user does not belong to any organization.");
    }

    const targetOrgId = targetUserMembership.organizationId;

    if (myOrgId === targetOrgId) {
      throw new Error("Cannot share with users in your own organization (they already have access).");
    }

    // Check if organizations are connected
    const connection = await prisma.organizationConnection.findFirst({
      where: {
        OR: [
          { requesterOrgId: myOrgId, partnerOrgId: targetOrgId },
          { requesterOrgId: targetOrgId, partnerOrgId: myOrgId },
        ],
        status: ConnectionStatus.ACCEPTED,
      },
    });

    if (!connection) {
      throw new Error("Organizations must be connected before sharing items.");
    }

    let ticketId: string | undefined;
    let pullRequestId: string | undefined;

    // Validate item belongs to myOrgId
    if (data.type === SharedItemType.TICKET) {
      const ticket = await prisma.ticket.findUnique({ where: { id: data.itemId } });
      if (!ticket) throw new Error("Ticket not found.");
      if (ticket.organizationId !== myOrgId) throw new Error("Unauthorized to share this ticket.");
      ticketId = ticket.id;
    } else if (data.type === SharedItemType.PULL_REQUEST) {
      const pr = await prisma.pullRequest.findUnique({ where: { id: data.itemId } });
      if (!pr) throw new Error("Pull request not found.");
      if (pr.organizationId !== myOrgId) throw new Error("Unauthorized to share this pull request.");
      pullRequestId = pr.id;
    } else {
      throw new Error("Invalid share type.");
    }

    // Prevent duplicate shares
    const existing = await prisma.sharedItem.findFirst({
      where: {
        type: data.type,
        sharedWithUserId: data.sharedWithUserId,
        ...(ticketId ? { ticketId } : {}),
        ...(pullRequestId ? { pullRequestId } : {}),
      },
    });

    if (existing) {
      throw new Error("Item is already shared with this user.");
    }

    const share = await prisma.sharedItem.create({
      data: {
        type: data.type,
        ticketId: ticketId ?? null,
        pullRequestId: pullRequestId ?? null,
        sharedWithUserId: data.sharedWithUserId,
        sharedByUserId: userId,
        permission: data.permission ?? "VIEW_COMMENT",
      },
    });

    // ── Audit: Item Shared ──────────────────────────────────────────────────
    void AuditService.log({
      organizationId: myOrgId,
      userId,
      action: "ITEM_SHARED",
      entityType: "SharedItem",
      entityId: share.id,
      metadata: { type: data.type, itemId: data.itemId, sharedWithUserId: data.sharedWithUserId },
    });

    // ── Notification: Item Shared ───────────────────────────────────────────
    void NotificationService.send({
      organizationId: targetOrgId,
      userId: data.sharedWithUserId,
      type: "SHARED_ITEM",
      title: "Item Shared With You",
      message: `An external organization has shared a ${data.type} with you.`,
      metadata: { shareId: share.id, type: data.type, itemId: data.itemId },
    });

    return share;
  }

  // 2. GET /api/share
  async getSharedItems(userId: string) {
    // Return everything shared WITH the authenticated user's organization.
    // That means items where sharedWithUserId belongs to this user's org.
    // Wait, the requirement says "Return everything shared with the authenticated organization."
    // Since SharedItem maps to a specific user (sharedWithUserId), if we want to show everything shared
    // with the organization, we should find all SharedItems where sharedWithUser belongs to myOrgId.
    const myOrgId = await this.getUserOrgId(userId);

    return prisma.sharedItem.findMany({
      where: {
        sharedWithUser: {
          memberships: {
            some: {
              organizationId: myOrgId,
            },
          },
        },
      },
      include: {
        ticket: true,
        pullRequest: true,
        sharedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        sharedWithUser: {
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

  // 3. DELETE /api/share/:id
  async revokeShare(shareId: string, userId: string) {
    const myOrgId = await this.getUserOrgId(userId);

    const share = await prisma.sharedItem.findUnique({
      where: { id: shareId },
      include: {
        sharedByUser: {
          include: {
            memberships: true,
          },
        },
        sharedWithUser: {
          include: {
            memberships: true,
          },
        },
      },
    });

    if (!share) {
      throw new Error("Shared item not found.");
    }

    // Either the org that shared it, or the org it was shared with, can revoke the share.
    const sharerOrgId = share.sharedByUser.memberships[0]?.organizationId;
    const targetOrgId = share.sharedWithUser.memberships[0]?.organizationId;

    if (myOrgId !== sharerOrgId && myOrgId !== targetOrgId) {
      throw new Error("Unauthorized to revoke this share.");
    }

    await prisma.sharedItem.delete({
      where: { id: shareId },
    });

    // ── Audit: Share Revoked ────────────────────────────────────────────────
    void AuditService.log({
      organizationId: myOrgId,
      userId,
      action: "SHARE_REVOKED",
      entityType: "SharedItem",
      entityId: shareId,
    });

    return { message: "Share revoked successfully." };
  }
}

export default new ShareService();
