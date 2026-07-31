import { PRStatus } from "@prisma/client";

export interface CreatePRInput {
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  requiredApprovals?: number;
  reviewers?: string[];
  status?: PRStatus; // allow starting in draft or open
}

export interface UpdatePRInput {
  title?: string;
  description?: string;
  sourceBranch?: string;
  targetBranch?: string;
  status?: PRStatus;
  requiredApprovals?: number;
}
