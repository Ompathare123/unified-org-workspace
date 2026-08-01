import { PRStatus } from "@prisma/client";
import prisma from "../config/prisma";
import { CreatePRInput, UpdatePRInput } from "../types/pr";
import VersionService from "./version.service";
import AuditService from "./audit.service";

class PRService {
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

  async create(userId: string, data: CreatePRInput, preferredOrgId?: string) {
    const orgId = await this.getUserOrgId(userId, preferredOrgId);

    const pr = await prisma.pullRequest.create({
      data: {
        title: data.title,
        description: data.description,
        sourceBranch: data.sourceBranch,
        targetBranch: data.targetBranch,
        organizationId: orgId,
        authorId: userId,
        status: data.status || PRStatus.DRAFT,
        requiredApprovals: data.requiredApprovals || 1,
        // create pending reviews if reviewers provided
        reviews: data.reviewers && data.reviewers.length > 0 ? {
          create: data.reviewers.map(reviewerId => ({
            reviewerId,
            decision: "PENDING"
          }))
        } : undefined
      },
      include: {
        author: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        reviews: {
          include: {
            reviewer: { select: { id: true, fullName: true, email: true, avatar: true } }
          }
        },
        versions: true,
      },
    });

    void AuditService.log({
      organizationId: orgId,
      userId,
      action: "PR_CREATED",
      entityType: "PullRequest",
      entityId: pr.id,
      metadata: { title: pr.title, status: pr.status },
    });

    return { ...pr, createdBy: pr.author };
  }

  async getStats(userId: string, preferredOrgId?: string) {
    const orgId = await this.getUserOrgId(userId, preferredOrgId);

    const [totalPRs, inReview, waitingApproval, approved, merged] = await Promise.all([
      prisma.pullRequest.count({ where: { organizationId: orgId } }),
      prisma.pullRequest.count({ where: { organizationId: orgId, status: PRStatus.IN_REVIEW } }),
      prisma.pullRequest.count({ where: { organizationId: orgId, status: { in: [PRStatus.IN_REVIEW, PRStatus.DRAFT] } } }),
      prisma.pullRequest.count({ where: { organizationId: orgId, status: PRStatus.APPROVED } }),
      prisma.pullRequest.count({ where: { organizationId: orgId, status: PRStatus.MERGED } })
    ]);

    return {
      totalPRs,
      inReview,
      waitingApproval,
      approved,
      merged
    };
  }

  async getAll(
    userId: string, 
    preferredOrgId?: string, 
    query?: { search?: string, status?: string, author?: string, branch?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string }
  ) {
    const orgId = await this.getUserOrgId(userId, preferredOrgId);

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = { organizationId: orgId };
    
    if (query?.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { id: { contains: query.search, mode: "insensitive" } }
      ];
    }
    if (query?.status && query.status !== "All") {
      whereClause.status = query.status as PRStatus;
    }
    if (query?.author && query.author !== "All") {
      whereClause.authorId = query.author;
    }
    if (query?.branch && query.branch !== "All") {
      whereClause.targetBranch = query.branch;
    }

    let orderByClause: any = { createdAt: "desc" };
    if (query?.sortBy) {
      const dir = query.sortOrder === "asc" ? "asc" : "desc";
      if (query.sortBy === "title") orderByClause = { title: dir };
      else if (query.sortBy === "status") orderByClause = { status: dir };
      else if (query.sortBy === "targetBranch") orderByClause = { targetBranch: dir };
      else if (query.sortBy === "id") orderByClause = { id: dir };
      else if (query.sortBy === "updatedAgo") orderByClause = { updatedAt: dir };
    }

    const [total, prs] = await Promise.all([
      prisma.pullRequest.count({ where: whereClause }),
      prisma.pullRequest.findMany({
        where: whereClause,
        include: {
          author: { select: { id: true, fullName: true, email: true, avatar: true } },
          reviews: { include: { reviewer: { select: { id: true, fullName: true, email: true, avatar: true } } } },
          versions: true,
        },
        orderBy: orderByClause,
        skip,
        take: limit,
      })
    ]);

    return {
      data: prs.map((pr) => ({ ...pr, createdBy: pr.author })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getById(prId: string, userId: string, preferredOrgId?: string) {
    const orgId = await this.getUserOrgId(userId, preferredOrgId);

    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId, organizationId: orgId },
      include: {
        author: { select: { id: true, fullName: true, email: true, avatar: true } },
        organization: { select: { id: true, name: true, slug: true } },
        reviews: {
          include: { reviewer: { select: { id: true, fullName: true, email: true, avatar: true } } },
          orderBy: { createdAt: "asc" },
        },
        versions: {
          include: { createdBy: { select: { id: true, fullName: true, email: true } } },
          orderBy: { versionNumber: "asc" },
        },
      },
    });

    if (!pr) throw new Error("PR not found.");

    return { ...pr, createdBy: pr.author };
  }

  private async verifyRBAC(prId: string, userId: string, action?: string): Promise<any> {
    const orgId = await this.getUserOrgId(userId);

    const existing = await prisma.pullRequest.findUnique({
      where: { id: prId, organizationId: orgId },
      select: { organizationId: true, authorId: true, title: true, status: true, requiredApprovals: true, reviews: true },
    });
    
    if (!existing) throw new Error("PR not found or unauthorized.");

    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: existing.organizationId } }
    });

    if (!membership) throw new Error("Unauthorized to access this PR.");

    if (action === "merge") {
      if (membership.role !== "REVIEWER" && membership.role !== "ORG_ADMIN" && membership.role !== "PLATFORM_ADMIN") {
        throw new Error("Unauthorized to merge this PR. Requires REVIEWER or ORG_ADMIN role.");
      }
    } else if (existing.authorId !== userId) {
      if (membership.role !== "ORG_ADMIN" && membership.role !== "PLATFORM_ADMIN") {
        throw new Error("Unauthorized to modify this PR.");
      }
    }
    
    return existing;
  }

  async update(prId: string, userId: string, data: UpdatePRInput) {
    const existing = await this.verifyRBAC(prId, userId);

    const pr = await prisma.pullRequest.update({
      where: { id: prId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.sourceBranch !== undefined && { sourceBranch: data.sourceBranch }),
        ...(data.targetBranch !== undefined && { targetBranch: data.targetBranch }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.requiredApprovals !== undefined && { requiredApprovals: data.requiredApprovals }),
      },
      include: {
        author: { select: { id: true, fullName: true, email: true, avatar: true } },
        reviews: true,
        versions: true,
      },
    });

    void AuditService.log({
      organizationId: pr.organizationId,
      userId,
      action: "PR_UPDATED",
      entityType: "PullRequest",
      entityId: pr.id,
      metadata: { updatedFields: Object.keys(data).filter((k) => data[k as keyof UpdatePRInput] !== undefined) },
    });

    await VersionService.createRecord(prId, userId, {
      title: pr.title,
      description: pr.description,
      diffContent: `Updated properties of PR`,
    });

    return { ...pr, createdBy: pr.author };
  }

  async delete(prId: string, userId: string) {
    const existing = await this.verifyRBAC(prId, userId);

    await prisma.pullRequest.delete({ where: { id: prId } });

    void AuditService.log({
      organizationId: existing.organizationId,
      userId,
      action: "PR_DELETED",
      entityType: "PullRequest",
      entityId: prId,
      metadata: { title: existing.title },
    });

    return { message: "PR deleted successfully." };
  }

  async merge(prId: string, userId: string) {
    const existing = await this.verifyRBAC(prId, userId, "merge");

    if (existing.status === PRStatus.MERGED) {
      throw new Error("PR is already merged.");
    }
    if (existing.status !== PRStatus.DRAFT && existing.status !== PRStatus.IN_REVIEW && existing.status !== PRStatus.APPROVED) {
      throw new Error("PR is closed or in an invalid state for merging.");
    }

    const approvedCount = existing.reviews.filter((r: any) => r.decision === "APPROVED").length;
    const changesRequested = existing.reviews.filter((r: any) => r.decision === "CHANGES_REQUESTED").length > 0;

    if (approvedCount < existing.requiredApprovals) {
      throw new Error(`Cannot merge. Requires ${existing.requiredApprovals} approvals, but only has ${approvedCount}.`);
    }

    if (changesRequested) {
      throw new Error("Cannot merge. Changes have been requested.");
    }

    const pr = await prisma.pullRequest.update({
      where: { id: prId },
      data: { status: PRStatus.MERGED }
    });

    void AuditService.log({
      organizationId: existing.organizationId,
      userId,
      action: "PR_MERGED",
      entityType: "PullRequest",
      entityId: prId,
      metadata: { title: existing.title, mergedAt: new Date().toISOString() },
    });

    return { ...pr, message: "PR merged successfully." };
  }

  async close(prId: string, userId: string) {
    const existing = await this.verifyRBAC(prId, userId);

    if (existing.status === PRStatus.MERGED) {
      throw new Error("Cannot close a merged PR.");
    }

    const pr = await prisma.pullRequest.update({
      where: { id: prId },
      data: { status: PRStatus.REJECTED }
    });

    void AuditService.log({
      organizationId: existing.organizationId,
      userId,
      action: "PR_CLOSED",
      entityType: "PullRequest",
      entityId: prId,
      metadata: { title: existing.title },
    });

    return pr;
  }

  async reopen(prId: string, userId: string) {
    const existing = await this.verifyRBAC(prId, userId);

    if (existing.status !== PRStatus.REJECTED) {
      throw new Error("Can only reopen closed PRs.");
    }

    const pr = await prisma.pullRequest.update({
      where: { id: prId },
      data: { status: PRStatus.IN_REVIEW }
    });

    void AuditService.log({
      organizationId: existing.organizationId,
      userId,
      action: "PR_REOPENED",
      entityType: "PullRequest",
      entityId: prId,
      metadata: { title: existing.title },
    });

    return pr;
  }
}

export default new PRService();
