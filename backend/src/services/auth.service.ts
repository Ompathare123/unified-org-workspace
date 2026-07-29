import { Role } from "@prisma/client";
import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import AuditService from "./audit.service";

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  organizationName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

class AuthService {
  async register(data: RegisterInput) {
    const { fullName, email, password, organizationName } = data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error("Email already exists.");
    }

    // Create slug from organization name
    const baseSlug = organizationName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (
      await prisma.organization.findUnique({
        where: { slug },
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    const passwordHash = await hashPassword(password);

    // Transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug,
        },
      });

      const user = await tx.user.create({
        data: {
          fullName,
          email,
          passwordHash,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: Role.ORG_ADMIN,
        },
      });

      return {
        user,
        organization,
      };
    });

    const token = generateToken(result.user.id);
    const { passwordHash: _registerPasswordHash, ...safeUser } = result.user;

    return {
      message: "Registration successful.",
      token,
      user: safeUser,
      organization: result.organization,
    };
  }

  async login(data: LoginInput) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isPasswordCorrect = await comparePassword(
      password,
      user.passwordHash
    );

    if (!isPasswordCorrect) {
      throw new Error("Invalid email or password.");
    }

    const memberships = await prisma.membership.findMany({
      where: {
        userId: user.id,
      },
      include: {
        organization: true,
      },
    });

    const token = generateToken(user.id);
    const { passwordHash, ...safeUser } = user;

    // ── Audit: User Login ──────────────────────────────────────────────────
    // Log against the first membership org (same pattern as other services).
    if (memberships.length > 0) {
      void AuditService.log({
        organizationId: memberships[0].organizationId,
        userId: user.id,
        action: "USER_LOGIN",
        entityType: "User",
        entityId: user.id,
        metadata: { email: user.email },
      });
    }

    return {
      message: "Login successful.",
      token,
      user: safeUser,
      organizations: memberships.map((m: any) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role,
      })),
    };
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const { passwordHash, ...safeUser } = user;

    return safeUser;
  }
}

export default new AuthService();