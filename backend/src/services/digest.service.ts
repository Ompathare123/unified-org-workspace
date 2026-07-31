import prisma from "../config/prisma";
import { DigestQueryParams, DigestResult } from "../types/digest";
import { TicketStatus, PRStatus, ReviewDecision } from "@prisma/client";

class DigestService {
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


  async generateDigest(userId: string, query: DigestQueryParams, preferredOrgId?: string): Promise<DigestResult> {
    const orgId = await this.getUserOrgId(userId, preferredOrgId);


    const dateFilter: any = {};
    if (query.startDate) {
      dateFilter.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      dateFilter.lte = new Date(query.endDate);
    }

    const whereDate = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
    
    // Tickets Created
    const ticketsCreated = await prisma.ticket.count({
      where: { organizationId: orgId, ...whereDate },
    });

    // Tickets Resolved
    const ticketsResolved = await prisma.ticket.count({
      where: { 
        organizationId: orgId, 
        status: TicketStatus.RESOLVED,
        // Using updatedAt for resolved tickets if we assume it reflects resolution time
        ...(Object.keys(dateFilter).length > 0 ? { updatedAt: dateFilter } : {})
      },
    });

    // PRs Created
    const prsCreated = await prisma.pullRequest.count({
      where: { organizationId: orgId, ...whereDate },
    });

    // PRs Approved
    const prsApproved = await prisma.pullRequest.count({
      where: {
        organizationId: orgId,
        status: PRStatus.APPROVED,
        ...(Object.keys(dateFilter).length > 0 ? { updatedAt: dateFilter } : {})
      },
    });

    // Reviews Completed (in this org)
    // Reviews belong to PRs which belong to Orgs
    const reviewsCompleted = await prisma.pRReview.count({
      where: {
        pullRequest: { organizationId: orgId },
        decision: { in: [ReviewDecision.APPROVED, ReviewDecision.CHANGES_REQUESTED] },
        ...whereDate,
      },
    });

    // Attachments Uploaded (in this org)
    const attachmentsUploaded = await prisma.ticketAttachment.count({
      where: {
        ticket: { organizationId: orgId },
        ...whereDate,
      },
    });

    // Audit Events
    const auditEvents = await prisma.auditLog.count({
      where: { organizationId: orgId, ...whereDate },
    });

    // Notifications Generated
    const notificationsGenerated = await prisma.notification.count({
      where: { organizationId: orgId, ...whereDate },
    });

    const summaryLines = [
      `Over the selected period:`,
      `- ${ticketsCreated} tickets were created`,
      `- ${ticketsResolved} tickets resolved`,
      `- ${prsCreated} pull requests created`,
      `- ${prsApproved} pull requests approved`,
      `- ${reviewsCompleted} reviews completed`,
      `- ${attachmentsUploaded} attachments uploaded`,
      `- ${auditEvents} audit events recorded`,
      `- ${notificationsGenerated} notifications generated`,
    ];

    return {
      summary: summaryLines.join("\n"),
      stats: {
        ticketsCreated,
        ticketsResolved,
        prsCreated,
        prsApproved,
        reviewsCompleted,
        attachmentsUploaded,
        auditEvents,
        notificationsGenerated,
      },
    };
  }
}

export default new DigestService();
