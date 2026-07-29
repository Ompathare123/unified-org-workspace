import { PRStatus } from "@prisma/client";
import prisma from "../config/prisma";
import { CreatePRInput, UpdatePRInput } from "../types/pr";

class PRService {
  async create(userId: string, data: CreatePRInput) {
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
      },
    });

    if (!membership) {
      throw new Error("User does not belong to any organization.");
    }

    const pr = await prisma.pullRequest.create({
      data: {
        title: data.title,
        description: data.description,
        organizationId: membership.organizationId,
        authorId: userId,
        status: PRStatus.DRAFT,
      },
      include: {
        author: true,
      },
    });

    return {
      ...pr,
      createdBy: pr.author,
    };
  }

  async getAll(userId: string) {
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
      },
    });

    if (!membership) {
      throw new Error("Organization not found.");
    }

    const prs = await prisma.pullRequest.findMany({
      where: {
        organizationId: membership.organizationId,
      },
      include: {
        author: true,
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

  async getById(prId: string) {
    const pr = await prisma.pullRequest.findUnique({
      where: {
        id: prId,
      },
      include: {
        author: true,
        reviews: true,
        versions: true,
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

  async update(prId: string, data: UpdatePRInput) {
    const pr = await prisma.pullRequest.update({
      where: {
        id: prId,
      },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
      },
      include: {
        author: true,
      },
    });

    return {
      ...pr,
      createdBy: pr.author,
    };
  }

  async delete(prId: string) {
    await prisma.pullRequest.delete({
      where: {
        id: prId,
      },
    });

    return {
      message: "PR deleted successfully.",
    };
  }
}

export default new PRService();
