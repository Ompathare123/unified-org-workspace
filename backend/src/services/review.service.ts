import { PRStatus, ReviewDecision } from "@prisma/client";
import prisma from "../config/prisma";
import { CreateReviewInput, UpdateReviewInput } from "../types/review";

class ReviewService {
  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * After every review insert or update, recompute the PR's aggregate status.
   *
   * Rules (from assignment):
   *  - Any CHANGES_REQUESTED  → PR becomes REJECTED immediately.
   *  - approvedCount >= requiredApprovals (and no CHANGES_REQUESTED) → PR becomes APPROVED.
   *  - Otherwise leave PR status unchanged.
   */
  private async syncPRStatus(pullRequestId: string): Promise<void> {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: pullRequestId },
      select: { requiredApprovals: true, status: true },
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
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/prs/:prId/reviews
  // ─────────────────────────────────────────────────────────────────────────
  async create(
    prId: string,
    reviewerId: string,
    data: CreateReviewInput
  ) {
    // 1. Verify PR exists.
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId },
      select: { id: true, authorId: true },
    });

    if (!pr) {
      throw new Error("Pull request not found.");
    }

    // 2. Prevent duplicate reviews from the same reviewer on the same PR.
    const existing = await prisma.pRReview.findFirst({
      where: {
        pullRequestId: prId,
        reviewerId,
      },
    });

    if (existing) {
      throw new Error(
        "You have already submitted a review for this pull request. Use PUT to update it."
      );
    }

    // 3. Create the review.
    const review = await prisma.pRReview.create({
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

    // 4. Sync PR status based on aggregate review decisions.
    await this.syncPRStatus(prId);

    return review;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/prs/:prId/reviews
  // ─────────────────────────────────────────────────────────────────────────
  async getByPR(prId: string) {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId },
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
  async update(reviewId: string, data: UpdateReviewInput) {
    // Verify review exists and grab pullRequestId for status sync.
    const existing = await prisma.pRReview.findUnique({
      where: { id: reviewId },
      select: { id: true, pullRequestId: true },
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

    // Re-sync PR status after update.
    await this.syncPRStatus(existing.pullRequestId);

    return review;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE /api/reviews/:reviewId
  // ─────────────────────────────────────────────────────────────────────────
  async delete(reviewId: string) {
    const existing = await prisma.pRReview.findUnique({
      where: { id: reviewId },
      select: { id: true, pullRequestId: true },
    });

    if (!existing) {
      throw new Error("Review not found.");
    }

    await prisma.pRReview.delete({
      where: { id: reviewId },
    });

    // Re-sync PR status after deletion (a deletion may un-reject the PR).
    await this.syncPRStatus(existing.pullRequestId);

    return { message: "Review deleted successfully." };
  }
}

export default new ReviewService();
