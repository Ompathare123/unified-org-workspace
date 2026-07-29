import { Router } from "express";
import ConnectionController from "../controllers/connection.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Only ORG_ADMIN or PLATFORM_ADMIN can manage connections
const requireAdmin = requireRole(Role.ORG_ADMIN, Role.PLATFORM_ADMIN);

// POST /api/connections/request
router.post("/request", authenticate, requireAdmin, ConnectionController.requestConnection);

// POST /api/connections/:id/accept
router.post("/:id/accept", authenticate, requireAdmin, ConnectionController.acceptConnection);

// POST /api/connections/:id/reject
router.post("/:id/reject", authenticate, requireAdmin, ConnectionController.rejectConnection);

// DELETE /api/connections/:id
router.delete("/:id", authenticate, requireAdmin, ConnectionController.revokeConnection);

export default router;
