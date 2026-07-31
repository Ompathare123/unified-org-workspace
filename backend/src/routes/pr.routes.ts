import { Router } from "express";
import PRController from "../controllers/pr.controller";
import VersionController from "../controllers/version.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.post("/", authenticate, requireRole(Role.DEVELOPER, Role.ORG_ADMIN), PRController.create);
router.get("/stats", authenticate, PRController.getStats);
router.get("/", authenticate, PRController.getAll);
router.get("/:id", authenticate, PRController.getById);
router.put("/:id", authenticate, requireRole(Role.DEVELOPER, Role.ORG_ADMIN), PRController.update);
router.delete("/:id", authenticate, requireRole(Role.DEVELOPER, Role.ORG_ADMIN), PRController.delete);
router.post("/:id/merge", authenticate, requireRole(Role.REVIEWER, Role.ORG_ADMIN), PRController.merge);
router.post("/:id/close", authenticate, requireRole(Role.REVIEWER, Role.ORG_ADMIN), PRController.close);
router.post("/:id/reopen", authenticate, requireRole(Role.REVIEWER, Role.ORG_ADMIN), PRController.reopen);

// Versioning routes
router.post("/:id/versions", authenticate, requireRole(Role.DEVELOPER, Role.ORG_ADMIN), VersionController.create);
router.get("/:id/versions", authenticate, VersionController.getByPR);

export default router;
