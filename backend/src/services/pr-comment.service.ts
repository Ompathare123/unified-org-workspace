import prisma from "../config/prisma";
import AuditService from "./audit.service";

export interface CreatePRCommentInput {
  content: string;
  parentId?: string;
  filePath?: string;
  lineNumber?: number;
}

export interface UpdatePRCommentInput {
  content: string;
}

class PRCommentService {
  async create(pullRequestId: string, userId: string, orgId: string, data: CreatePRCommentInput) {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: pullRequestId, organizationId: orgId },
      select: { id: true, organizationId: true },
    });

    if (!pr) {
      throw new Error("PR not found or unauthorized.");
    }

    const comment = await prisma.pRComment.create({
      data: {
        pullRequestId: pullRequestId,
        userId,
        content: data.content,
        parentId: data.parentId,
        filePath: data.filePath,
        lineNumber: data.lineNumber,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Centralized Audit Logging
    void AuditService.log({
      organizationId: pr.organizationId,
      userId,
      action: "COMMENT_ADDED",
      entityType: "PRComment",
      entityId: comment.id,
      metadata: { prId: pullRequestId, contentSnippet: data.content.slice(0, 50) },
    });

    return comment;
  }

  async getByPR(prId: string, orgId: string, page: number = 1, limit: number = 50) {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: prId, organizationId: orgId },
      select: { organizationId: true },
    });

    if (!pr) {
      throw new Error("Pull Request not found");
    }

    const skip = (page - 1) * limit;

    const [total, comments] = await Promise.all([
      prisma.pRComment.count({ where: { pullRequestId: prId } }),
      prisma.pRComment.findMany({
        where: { pullRequestId: prId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(commentId: string, userId: string, data: UpdatePRCommentInput) {
    const existing = await prisma.pRComment.findUnique({
      where: { id: commentId },
      include: { pullRequest: true },
    });

    if (!existing) {
      throw new Error("Comment not found");
    }

    if (existing.userId !== userId) {
      // Allow org admins to moderate comments
      const membership = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId, organizationId: existing.pullRequest.organizationId } },
      });
      if (!membership || (membership.role !== "ORG_ADMIN" && membership.role !== "PLATFORM_ADMIN")) {
        throw new Error("Unauthorized to edit this comment");
      }
    }

    const comment = await prisma.pRComment.update({
      where: { id: commentId },
      data: {
        content: data.content,
        isEdited: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    void AuditService.log({
      organizationId: existing.pullRequest.organizationId,
      userId,
      action: "COMMENT_EDITED",
      entityType: "PRComment",
      entityId: comment.id,
      metadata: { prId: existing.pullRequestId },
    });

    return comment;
  }

  async delete(commentId: string, userId: string) {
    const existing = await prisma.pRComment.findUnique({
      where: { id: commentId },
      include: { pullRequest: true },
    });

    if (!existing) {
      throw new Error("Comment not found");
    }

    if (existing.userId !== userId) {
      const membership = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId, organizationId: existing.pullRequest.organizationId } },
      });
      if (!membership || (membership.role !== "ORG_ADMIN" && membership.role !== "PLATFORM_ADMIN")) {
        throw new Error("Unauthorized to delete this comment");
      }
    }

    // Soft delete
    const comment = await prisma.pRComment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        content: "This comment was deleted.",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    void AuditService.log({
      organizationId: existing.pullRequest.organizationId,
      userId,
      action: "COMMENT_DELETED",
      entityType: "PRComment",
      entityId: comment.id,
      metadata: { prId: existing.pullRequestId },
    });

    return comment;
  }
}

export default new PRCommentService();
