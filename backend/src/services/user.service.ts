import prisma from "../config/prisma";
import { InvitationStatus } from "@prisma/client";
import AuditService from "./audit.service";

export class UserService {
  async listMyInvitations(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const invitations = await prisma.invitation.findMany({
      where: { email: user.email, status: InvitationStatus.PENDING },
      include: {
        organization: { select: { name: true, slug: true } },
        invitedBy: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const active = [];
    for (const inv of invitations) {
      if (inv.expiresAt < now) {
        await prisma.invitation.update({ where: { id: inv.id }, data: { status: InvitationStatus.EXPIRED } });
      } else {
        active.push(inv);
      }
    }

    return active;
  }

  async acceptInvitation(userId: string, invitationId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const invite = await prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invite) throw new Error("Invitation not found");
    if (invite.email !== user.email) throw new Error("Not authorized to accept this invitation");
    if (invite.status !== InvitationStatus.PENDING) throw new Error("Invitation is no longer pending");
    if (invite.expiresAt < new Date()) {
      await prisma.invitation.update({ where: { id: invite.id }, data: { status: InvitationStatus.EXPIRED } });
      throw new Error("Invitation has expired");
    }

    // Accept it and create membership
    const updated = await prisma.$transaction(async (tx) => {
      await tx.invitation.update({
        where: { id: invitationId },
        data: { status: InvitationStatus.ACCEPTED },
      });

      const membership = await tx.membership.create({
        data: {
          userId,
          organizationId: invite.organizationId,
          role: invite.role,
        },
      });
      return membership;
    });

    void AuditService.log({
      organizationId: invite.organizationId,
      userId,
      action: "INVITATION_ACCEPTED",
      entityType: "Invitation",
      entityId: invitationId,
      metadata: { role: invite.role }
    });

    void AuditService.log({
      organizationId: invite.organizationId,
      userId,
      action: "MEMBERSHIP_CREATED",
      entityType: "Membership",
      entityId: updated.id,
      metadata: { role: invite.role }
    });

    return { success: true, organizationId: invite.organizationId };
  }

  async declineInvitation(userId: string, invitationId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const invite = await prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invite) throw new Error("Invitation not found");
    if (invite.email !== user.email) throw new Error("Not authorized to decline this invitation");
    if (invite.status !== InvitationStatus.PENDING) throw new Error("Invitation is no longer pending");

    const declined = await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.DECLINED },
    });

    void AuditService.log({
      organizationId: invite.organizationId,
      userId,
      action: "INVITATION_DECLINED",
      entityType: "Invitation",
      entityId: invitationId,
      metadata: { role: invite.role }
    });

    return declined;
  }
}

export default new UserService();
