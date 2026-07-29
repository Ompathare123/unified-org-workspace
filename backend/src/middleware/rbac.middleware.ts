import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthRequest } from "./auth.middleware";
import prisma from "../config/prisma";

export const requireRole = (...roles: Role[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const memberships = await prisma.membership.findMany({
        where: { userId },
      });

      if (memberships.length === 0) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Check if user has ANY of the required roles in ANY of their memberships
      // In a real app, we'd check the role against the specific organization context of the request.
      // For this unified assignment phase, checking if they have the role globally across their orgs is sufficient.
      const hasRole = memberships.some((m) => roles.includes(m.role as Role));

      if (!hasRole) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
