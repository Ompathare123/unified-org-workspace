import prisma from "../config/prisma";
import { ConnectionStatus, Role } from "@prisma/client";
import NotificationService from "./notification.service";

class ConnectionService {
  private async getUserOrgId(userId: string): Promise<string> {
    const membership = await prisma.membership.findFirst({
      where: { userId },
    });
    if (!membership) {
      throw new Error("User does not belong to any organization.");
    }
    return membership.organizationId;
  }

  // 1. POST /api/connections/request
  async requestConnection(userId: string, partnerOrgId: string) {
    const requesterOrgId = await this.getUserOrgId(userId);

    if (requesterOrgId === partnerOrgId) {
      throw new Error("Cannot connect to your own organization.");
    }

    // Verify partner org exists
    const partner = await prisma.organization.findUnique({
      where: { id: partnerOrgId },
    });
    if (!partner) {
      throw new Error("Partner organization not found.");
    }

    // Prevent duplicate connections (in either direction)
    const existing = await prisma.organizationConnection.findFirst({
      where: {
        OR: [
          { requesterOrgId, partnerOrgId },
          { requesterOrgId: partnerOrgId, partnerOrgId: requesterOrgId },
        ],
      },
    });

    if (existing) {
      if (existing.status === ConnectionStatus.PENDING) {
        throw new Error("A connection request is already pending.");
      }
      if (existing.status === ConnectionStatus.ACCEPTED) {
        throw new Error("Organizations are already connected.");
      }
      // If rejected/revoked, we could allow re-requesting, but for simplicity we will just update it or throw.
      // Let's update if it was rejected/revoked.
      return prisma.organizationConnection.update({
        where: { id: existing.id },
        data: {
          status: ConnectionStatus.PENDING,
          requesterOrgId, // Reset requester to whoever initiated this new request
          partnerOrgId,
        },
      });
    }

    return prisma.organizationConnection.create({
      data: {
        requesterOrgId,
        partnerOrgId,
        status: ConnectionStatus.PENDING,
      },
    });
  }

  // 2. POST /api/connections/:id/accept
  async acceptConnection(connectionId: string, userId: string) {
    const orgId = await this.getUserOrgId(userId);

    const connection = await prisma.organizationConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error("Connection request not found.");
    }

    // Only the partner org can accept the request
    if (connection.partnerOrgId !== orgId) {
      throw new Error("Unauthorized to accept this connection request.");
    }

    if (connection.status !== ConnectionStatus.PENDING) {
      throw new Error(`Cannot accept connection with status ${connection.status}`);
    }

    const updated = await prisma.organizationConnection.update({
      where: { id: connectionId },
      data: { status: ConnectionStatus.ACCEPTED },
    });

    // ── Notification: Connection Accepted ───────────────────────────────────
    const admins = await prisma.membership.findMany({
      where: { organizationId: connection.requesterOrgId, role: Role.ORG_ADMIN },
      select: { userId: true },
    });

    for (const admin of admins) {
      void NotificationService.send({
        organizationId: connection.requesterOrgId,
        userId: admin.userId,
        type: "SYSTEM",
        title: "Connection Accepted",
        message: `Your connection request has been accepted.`,
        metadata: { connectionId },
      });
    }

    return updated;
  }

  // 3. POST /api/connections/:id/reject
  async rejectConnection(connectionId: string, userId: string) {
    const orgId = await this.getUserOrgId(userId);

    const connection = await prisma.organizationConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error("Connection request not found.");
    }

    // Only the partner org can reject the request
    if (connection.partnerOrgId !== orgId) {
      throw new Error("Unauthorized to reject this connection request.");
    }

    return prisma.organizationConnection.update({
      where: { id: connectionId },
      data: { status: ConnectionStatus.REJECTED },
    });
  }

  // 4. DELETE /api/connections/:id
  async revokeConnection(connectionId: string, userId: string) {
    const orgId = await this.getUserOrgId(userId);

    const connection = await prisma.organizationConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error("Connection not found.");
    }

    // Either side can revoke an active connection
    if (connection.requesterOrgId !== orgId && connection.partnerOrgId !== orgId) {
      throw new Error("Unauthorized to revoke this connection.");
    }

    return prisma.organizationConnection.delete({
      where: { id: connectionId },
    });
  }
}

export default new ConnectionService();
