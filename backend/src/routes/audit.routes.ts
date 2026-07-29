import { Router } from "express";
import AuditController from "../controllers/audit.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { Role } from "@prisma/client";

const router = Router();

// GET /api/audit-logs/export  ← MUST come before /:id to avoid route shadowing
router.get("/export", authenticate, requireRole(Role.ORG_ADMIN, Role.REVIEWER), AuditController.exportCsv);

// GET /api/audit-logs
router.get("/", authenticate, AuditController.getAll);

// GET /api/audit-logs/:id
router.get("/:id", authenticate, AuditController.getById);

export default router;
