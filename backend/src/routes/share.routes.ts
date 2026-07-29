import { Router } from "express";
import ShareController from "../controllers/share.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Only ORG_ADMIN can manage shares
const requireAdmin = requireRole(Role.ORG_ADMIN);

// POST /api/share
router.post("/", authenticate, requireAdmin, ShareController.shareItem);

// GET /api/share
// Allows any authenticated member of the org to view what has been shared with their org
router.get("/", authenticate, ShareController.getSharedItems);

// DELETE /api/share/:id
router.delete("/:id", authenticate, requireAdmin, ShareController.revokeShare);

export default router;
