import { PRStatus } from "@prisma/client";
import prisma from "../config/prisma";
import { CreatePRInput, UpdatePRInput } from "../types/pr";
import VersionService from "./version.service";
import AuditService from "./audit.service";

class PRService {
  // ────────────────────────────────────────────────────────────────
  // POST /api/prs
  //  - authorId  = authenticated user (passed in)
  //  - orgId     = user's first membership org (Phase 2 scope)
  //  - status    = DRAFT  (initial state per schema enum)
  //  - persists sourceBranch & targetBranch
  // ────────────────────────────────────────────────────────────────
  async create(userId: string, data: CreatePRInput) {
    const membership = await prisma.membership.findFirst({
      where: { userId },
    });

    if (!membership) {
      throw new Error("User does not belong to any organization.");
    }

    const pr = await prisma.pullRequest.create({
      data: {
        title: data.title,
        description: data.description,
        sourceBranch: data.sourceBranch,
        targetBranch: data.targetBranch,
        organizationId: membership.organizationId,
        authorId: userId,
        status: PRStatus.DRAFT,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        reviews: true,
        versions: true,
      },
    });

    // ── Audit: PR Created ────────────────────────────────────────────────
    void AuditService.log({
      organizationId: membership.organizationId,
      userId,
      action: "PR_CREATED",
      entityType: "PullRequest",
      entityId: pr.id,
      metadata: { title: pr.title },
    });

    return {
      ...pr,
      createdBy: pr.author,
    };
  }

  // ────────────────────────────────────────────────────────────────
  // GET /api/prs
  //  Returns: sourceBranch, targetBranch, createdBy, reviews, versions
  // ────────────────────────────────────────────────────────────────
  async getAll(userId: string) {
    const membership = await prisma.membership.findFirst({
      where: { userId },
    });

    if (!membership) {
      throw new Error("Organization not found.");
    }

    const prs = await prisma.pullRequest.findMany({
      where: {
        organizationId: membership.organizationId,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        reviews: true,
        versions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return prs.map((pr) => ({
      ...pr,
      createdBy: pr.author,
    }));
  }

  // ────────────────────────────────────────────────────────────────
  // GET /api/prs/:id
  //  Returns: createdBy, organization, reviews, versions,
  //           sourceBranch, targetBranch
  // ────────────────────────────────────────────────────────────────
  async getById(prId: string) {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
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
        },
        versions: {
          include: {
            createdBy: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: { versionNumber: "asc" },
        },
      },
    });

    if (!pr) {
      throw new Error("PR not found.");
    }

    return {
      ...pr,
      createdBy: pr.author,
    };
  }

  // ────────────────────────────────────────────────────────────────
  // PUT /api/prs/:id
  //  Allows: title, description, sourceBranch, targetBranch, status
  //  AUTO-VERSIONS: After every successful update, a new PRVersion
  //  snapshot is created automatically. No second API call needed.
  // ────────────────────────────────────────────────────────────────
  async update(prId: string, userId: string, data: UpdatePRInput) {
    const existing = await prisma.pullRequest.findUnique({
      where: { id: prId },
      select: { organizationId: true },
    });
    
    if (!existing) {
      throw new Error("PR not found.");
    }

    const pr = await prisma.pullRequest.update({
      where: { id: prId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.sourceBranch !== undefined && { sourceBranch: data.sourceBranch }),
        ...(data.targetBranch !== undefined && { targetBranch: data.targetBranch }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        reviews: true,
        versions: true,
      },
    });

    // ── Audit: PR Updated ────────────────────────────────────────────────
    void AuditService.log({
      organizationId: pr.organizationId,
      userId,
      action: "PR_UPDATED",
      entityType: "PullRequest",
      entityId: pr.id,
      metadata: { updatedFields: Object.keys(data).filter((k) => data[k as keyof UpdatePRInput] !== undefined) },
    });

    // ── Auto-versioning ──────────────────────────────────────────
    // Snapshot the updated PR state into a PRVersion record.
    // versionNumber is sequential and computed inside VersionService.
    await VersionService.createRecord(prId, userId, {
      title: pr.title,
      description: pr.description,
      diffContent: `Updated to sourceBranch: ${pr.sourceBranch}, targetBranch: ${pr.targetBranch}, status: ${pr.status}`,
    });

    return {
      ...pr,
      createdBy: pr.author,
    };
  }

  // ────────────────────────────────────────────────────────────────
  // DELETE /api/prs/:id
  // ────────────────────────────────────────────────────────────────
  async delete(prId: string, userId: string) {
    const existing = await prisma.pullRequest.findUnique({
      where: { id: prId },
      select: { organizationId: true, title: true },
    });

    if (!existing) {
      throw new Error("PR not found.");
    }

    await prisma.pullRequest.delete({
      where: { id: prId },
    });

    // ── Audit: PR Deleted ────────────────────────────────────────────────
    void AuditService.log({
      organizationId: existing.organizationId,
      userId,
      action: "PR_DELETED",
      entityType: "PullRequest",
      entityId: prId,
      metadata: { title: existing.title },
    });

    return {
      message: "PR deleted successfully.",
    };
  }
}

export default new PRService();
