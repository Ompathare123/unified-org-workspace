import prisma from "../config/prisma";
import { CreateVersionInput } from "../types/version";
import AuditService from "./audit.service";

class VersionService {
  // ─────────────────────────────────────────────────────────────────────────
  // Internal helper: compute the next sequential version number for a PR.
  // Returns 1 if no versions exist yet.
  // ─────────────────────────────────────────────────────────────────────────
  async nextVersionNumber(pullRequestId: string): Promise<number> {
    const result = await prisma.pRVersion.aggregate({
      where: { pullRequestId },
      _max: { versionNumber: true },
    });
    return (result._max.versionNumber ?? 0) + 1;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internal helper: create a version record.
  // Used both by the explicit POST endpoint and the auto-versioning hook
  // inside pr.service.ts update().
  // ─────────────────────────────────────────────────────────────────────────
  async createRecord(
    pullRequestId: string,
    createdById: string,
    data: CreateVersionInput
  ) {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: pullRequestId },
      select: { id: true, organizationId: true },
    });

    if (!pr) {
      throw new Error("Pull request not found.");
    }

    const versionNumber = await this.nextVersionNumber(pullRequestId);

    const version = await prisma.pRVersion.create({
      data: {
        pullRequestId,
        createdById,
        versionNumber,
        title: data.title,
        description: data.description,
        diffContent: data.diffContent,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // ── Audit: Version Created ──────────────────────────────────────────
    void AuditService.log({
      organizationId: pr.organizationId,
      userId: createdById,
      action: "VERSION_CREATED",
      entityType: "PRVersion",
      entityId: version.id,
      metadata: { versionNumber, title: data.title },
    });

    return version;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/prs/:prId/versions
  //  - PR must exist.
  //  - versionNumber is sequential (auto-computed).
  //  - Never overwrites previous versions.
  // ─────────────────────────────────────────────────────────────────────────
  async create(
    prId: string,
    userId: string,
    orgId: string,
    data: CreateVersionInput
  ) {
    // Validate PR exists.
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId, organizationId: orgId },
      select: { id: true },
    });

    if (!pr) {
      throw new Error("Pull request not found.");
    }

    return this.createRecord(prId, userId, data);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/prs/:prId/versions
  //  Returns all versions ordered by versionNumber ASC.
  //  Includes creator info and diffContent.
  // ─────────────────────────────────────────────────────────────────────────
  async getByPR(prId: string, orgId: string) {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId, organizationId: orgId },
      select: { id: true },
    });

    if (!pr) {
      throw new Error("Pull request not found.");
    }

    return prisma.pRVersion.findMany({
      where: { pullRequestId: prId },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            },
          },
      },
      orderBy: { versionNumber: "asc" },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/versions/:versionId
  //  Returns one version with creator, pull request, and organization.
  // ─────────────────────────────────────────────────────────────────────────
  async getById(versionId: string, orgId: string) {
    const version = await prisma.pRVersion.findUnique({
      where: { id: versionId },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        pullRequest: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!version) {
      throw new Error("Version not found.");
    }

    return version;
  }
}

export default new VersionService();
