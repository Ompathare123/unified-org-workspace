import { PRStatus, ReviewDecision } from "@prisma/client";
import prisma from "../config/prisma";
import { CreateReviewInput, UpdateReviewInput } from "../types/review";
import AuditService from "./audit.service";
import NotificationService from "./notification.service";

class ReviewService {
  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  private async syncPRStatus(pullRequestId: string): Promise<void> {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: pullRequestId },
      select: { requiredApprovals: true, status: true, authorId: true, organizationId: true, title: true },
    });

    if (!pr) return;

    const reviews = await prisma.pRReview.findMany({
      where: { pullRequestId },
      select: { decision: true },
    });

    const hasRejection = reviews.some(
      (r) => r.decision === ReviewDecision.CHANGES_REQUESTED
    );

    const approvedCount = reviews.filter(
      (r) => r.decision === ReviewDecision.APPROVED
    ).length;

    let newStatus: PRStatus | null = null;

    if (hasRejection) {
      newStatus = PRStatus.REJECTED;
    } else if (approvedCount >= pr.requiredApprovals) {
      newStatus = PRStatus.APPROVED;
    }

    if (newStatus && pr.status !== newStatus) {
      await prisma.pullRequest.update({
        where: { id: pullRequestId },
        data: { status: newStatus },
      });

      if (newStatus === PRStatus.APPROVED) {
        void NotificationService.send({
          organizationId: pr.organizationId,
          userId: pr.authorId,
          type: "SYSTEM",
          title: "PR Approved",
          message: `Your PR has been approved: ${pr.title}`,
          metadata: { pullRequestId },
        });
      } else if (newStatus === PRStatus.REJECTED) {
        void NotificationService.send({
          organizationId: pr.organizationId,
          userId: pr.authorId,
          type: "SYSTEM",
          title: "PR Changes Requested",
          message: `Changes requested on your PR: ${pr.title}`,
          metadata: { pullRequestId },
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/prs/:prId/reviews
  // ─────────────────────────────────────────────────────────────────────────
  async create(
    prId: string,
    reviewerId: string,
    orgId: string,
    data: CreateReviewInput
  ) {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId, organizationId: orgId },
      select: { id: true, authorId: true, organizationId: true },
    });

    if (!pr) {
      throw new Error("Pull request not found or unauthorized.");
    }

    if (pr.authorId === reviewerId && data.decision === "APPROVED") {
      throw new Error("Cannot approve your own pull request.");
    }

    const existing = await prisma.pRReview.findFirst({
      where: {
        pullRequestId: prId,
        reviewerId,
      },
    });

    let review;
    
    if (existing) {
      review = await prisma.pRReview.update({
        where: { id: existing.id },
        data: {
          decision: data.decision,
          comment: data.comment,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
        },
      });
    } else {
      review = await prisma.pRReview.create({
        data: {
          pullRequestId: prId,
          reviewerId,
          decision: data.decision,
          comment: data.comment,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
        },
      });
    }

    await this.syncPRStatus(prId);

    // ── Audit: Review Submitted ──────────────────────────────────────────
    void AuditService.log({
      organizationId: pr.organizationId,
      userId: reviewerId,
      action: "REVIEW_SUBMITTED",
      entityType: "PRReview",
      entityId: review.id,
      metadata: { decision: data.decision },
    });

    // ── Notification: PR Assigned (Review Requested) ──────────────────────
    void NotificationService.send({
      organizationId: pr.organizationId,
      userId: reviewerId,
      type: "REVIEW_REQUEST",
      title: "Review Requested",
      message: `You have been requested to review a PR.`,
      metadata: { pullRequestId: prId },
    });

    return review;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/prs/:prId/reviews
  // ─────────────────────────────────────────────────────────────────────────
  async getByPR(prId: string, orgId: string) {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId, organizationId: orgId },
      select: { id: true },
    });

    if (!pr) {
      throw new Error("Pull request not found.");
    }

    return prisma.pRReview.findMany({
      where: { pullRequestId: prId },
      include: {
        reviewer: {
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
  // PUT /api/reviews/:reviewId
  // ─────────────────────────────────────────────────────────────────────────
  async update(reviewId: string, userId: string, data: UpdateReviewInput) {
    const existing = await prisma.pRReview.findUnique({
      where: { id: reviewId },
      select: { id: true, pullRequestId: true, pullRequest: { select: { organizationId: true } } },
    });

    if (!existing) {
      throw new Error("Review not found.");
    }

    const review = await prisma.pRReview.update({
      where: { id: reviewId },
      data: {
        ...(data.decision !== undefined && { decision: data.decision }),
        ...(data.comment !== undefined && { comment: data.comment }),
      },
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    await this.syncPRStatus(existing.pullRequestId);

    // ── Audit: Review Updated ──────────────────────────────────────────
    void AuditService.log({
      organizationId: existing.pullRequest.organizationId,
      userId,
      action: "REVIEW_UPDATED",
      entityType: "PRReview",
      entityId: reviewId,
      metadata: { updatedFields: Object.keys(data).filter((k) => data[k as keyof UpdateReviewInput] !== undefined) },
    });

    return review;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE /api/reviews/:reviewId
  // ─────────────────────────────────────────────────────────────────────────
  async delete(reviewId: string, userId: string) {
    const existing = await prisma.pRReview.findUnique({
      where: { id: reviewId },
      select: { id: true, pullRequestId: true, pullRequest: { select: { organizationId: true } } },
    });

    if (!existing) {
      throw new Error("Review not found.");
    }

    await prisma.pRReview.delete({
      where: { id: reviewId },
    });

    await this.syncPRStatus(existing.pullRequestId);

    // ── Audit: Review Deleted ──────────────────────────────────────────
    void AuditService.log({
      organizationId: existing.pullRequest.organizationId,
      userId,
      action: "REVIEW_DELETED",
      entityType: "PRReview",
      entityId: reviewId,
    });

    return { message: "Review deleted successfully." };
  }
}

export default new ReviewService();
