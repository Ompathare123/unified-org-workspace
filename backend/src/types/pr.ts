import { PRStatus } from "@prisma/client";

export interface CreatePRInput {
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
}

export interface UpdatePRInput {
  title?: string;
  description?: string;
  sourceBranch?: string;
  targetBranch?: string;
  status?: PRStatus;
}
