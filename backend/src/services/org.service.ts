import prisma from "../config/prisma";
import { Role, InvitationStatus } from "@prisma/client";
import AuditService from "./audit.service";
import crypto from "crypto";

export class OrgService {
  // ── MEMBERS ──────────────────────────────────────────────────────────────
  async listMembers(organizationId: string) {
    return prisma.membership.findMany({
      where: { organizationId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
      orderBy: { joinedAt: "asc" },
    });
  }

  async removeMember(organizationId: string, userIdToRemove: string, requestingUserId: string) {
    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: userIdToRemove, organizationId } },
      include: { user: true }
    });

    if (!membership) {
      throw new Error("Member not found in organization.");
    }

    // Check if removing the last admin/owner
    if (membership.role === Role.ORG_ADMIN) {
      const adminCount = await prisma.membership.count({
        where: { organizationId, role: Role.ORG_ADMIN }
      });
      if (adminCount <= 1) {
        throw new Error("Cannot remove the last organization admin. Please transfer ownership first.");
      }
    }

    await prisma.membership.delete({
      where: { id: membership.id }
    });

    void AuditService.log({
      organizationId,
      userId: requestingUserId,
      action: "MEMBER_REMOVED",
      entityType: "Membership",
      entityId: membership.id,
      metadata: { removedUserId: userIdToRemove, email: membership.user.email, role: membership.role }
    });
  }

  async updateMemberRole(organizationId: string, userIdToUpdate: string, newRole: Role, requestingUserId: string) {
    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: userIdToUpdate, organizationId } },
      include: { user: true }
    });

    if (!membership) throw new Error("Member not found.");

    if (membership.role === Role.ORG_ADMIN && newRole !== Role.ORG_ADMIN) {
      const adminCount = await prisma.membership.count({
        where: { organizationId, role: Role.ORG_ADMIN }
      });
      if (adminCount <= 1) {
        throw new Error("Cannot demote the last organization admin. Please transfer ownership first.");
      }
    }

    const updated = await prisma.membership.update({
      where: { id: membership.id },
      data: { role: newRole }
    });

    void AuditService.log({
      organizationId,
      userId: requestingUserId,
      action: "MEMBERSHIP_ROLE_UPDATED",
      entityType: "Membership",
      entityId: membership.id,
      metadata: { updatedUserId: userIdToUpdate, email: membership.user.email, oldRole: membership.role, newRole }
    });

    return updated;
  }

  async leaveOrg(organizationId: string, userId: string) {
    return this.removeMember(organizationId, userId, userId);
  }

  async transferOwnership(organizationId: string, fromUserId: string, toUserId: string) {
    const fromMembership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: fromUserId, organizationId } }
    });
    if (!fromMembership || fromMembership.role !== Role.ORG_ADMIN) {
      throw new Error("Only an organization admin can transfer ownership.");
    }

    const toMembership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: toUserId, organizationId } },
      include: { user: true }
    });
    if (!toMembership) {
      throw new Error("Target user is not a member of the organization.");
    }

    await prisma.$transaction([
      prisma.membership.update({
        where: { id: toMembership.id },
        data: { role: Role.ORG_ADMIN }
      }),
      prisma.membership.update({
        where: { id: fromMembership.id },
        data: { role: Role.SUPPORT_AGENT }
      })
    ]);

    void AuditService.log({
      organizationId,
      userId: fromUserId,
      action: "OWNERSHIP_TRANSFERRED",
      entityType: "Organization",
      entityId: organizationId,
      metadata: { newOwnerId: toUserId, newOwnerEmail: toMembership.user.email }
    });
  }

  // ── INVITATIONS ──────────────────────────────────────────────────────────
  async listInvitations(organizationId: string) {
    const invitations = await prisma.invitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    // Auto-expire
    const now = new Date();
    const result = [];
    for (const inv of invitations) {
      if (inv.status === InvitationStatus.PENDING && inv.expiresAt < now) {
        const expired = await prisma.invitation.update({
          where: { id: inv.id },
          data: { status: InvitationStatus.EXPIRED }
        });
        result.push(expired);
      } else {
        result.push(inv);
      }
    }
    return result;
  }

  async inviteMember(organizationId: string, email: string, role: Role, requestingUserId: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already a member
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      const existingMembership = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId: existingUser.id, organizationId } }
      });
      if (existingMembership) {
        throw new Error("User is already a member of this organization.");
      }
    }

    // Check if pending invite exists
    const existingInvite = await prisma.invitation.findFirst({
      where: { email: normalizedEmail, organizationId, status: InvitationStatus.PENDING }
    });
    if (existingInvite) {
      if (existingInvite.expiresAt > new Date()) {
        throw new Error("A pending invitation already exists for this email.");
      } else {
        await prisma.invitation.update({ where: { id: existingInvite.id }, data: { status: InvitationStatus.EXPIRED } });
      }
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        email: normalizedEmail,
        role,
        organizationId,
        invitedById: requestingUserId,
        status: InvitationStatus.PENDING,
        inviteToken,
        expiresAt
      }
    });

    void AuditService.log({
      organizationId,
      userId: requestingUserId,
      action: "INVITATION_SENT",
      entityType: "Invitation",
      entityId: invitation.id,
      metadata: { invitedEmail: normalizedEmail, role, expiresAt: expiresAt.toISOString() }
    });

    return invitation;
  }

  async cancelInvitation(organizationId: string, invitationId: string, requestingUserId: string) {
    const invite = await prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invite || invite.organizationId !== organizationId) {
      throw new Error("Invitation not found.");
    }
    if (invite.status !== InvitationStatus.PENDING) {
      throw new Error("Can only cancel pending invitations.");
    }

    const cancelled = await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.CANCELLED }
    });

    void AuditService.log({
      organizationId,
      userId: requestingUserId,
      action: "INVITATION_CANCELLED",
      entityType: "Invitation",
      entityId: invitationId,
      metadata: { invitedEmail: invite.email }
    });

    return cancelled;
  }

  async resendInvitation(organizationId: string, invitationId: string, requestingUserId: string) {
    const invite = await prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invite || invite.organizationId !== organizationId) {
      throw new Error("Invitation not found.");
    }
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const resent = await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.PENDING, expiresAt }
    });

    void AuditService.log({
      organizationId,
      userId: requestingUserId,
      action: "INVITATION_RESENT",
      entityType: "Invitation",
      entityId: invitationId,
      metadata: { invitedEmail: invite.email, expiresAt: expiresAt.toISOString() }
    });

    return resent;
  }
}

export default new OrgService();
