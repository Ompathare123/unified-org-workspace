import { Router } from "express";
import VersionController from "../controllers/version.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { Role } from "@prisma/client";

const router = Router({ mergeParams: true });

// POST /api/prs/:prId/versions  — manually create a version
router.post("/", authenticate, requireRole(Role.ORG_ADMIN, Role.REVIEWER), VersionController.create);

// GET  /api/prs/:prId/versions  — list all versions for a PR
router.get("/", authenticate, VersionController.getByPR);

export default router;
