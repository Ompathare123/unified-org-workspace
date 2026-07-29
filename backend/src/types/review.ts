import { ReviewDecision } from "@prisma/client";

export interface CreateReviewInput {
  /**
   * APPROVED  — counts toward requiredApprovals; auto-merges PR when threshold is met.
   * CHANGES_REQUESTED — immediately marks the PR as REJECTED.
   */
  decision: ReviewDecision;
  comment?: string;
}

export interface UpdateReviewInput {
  decision?: ReviewDecision;
  comment?: string;
}
