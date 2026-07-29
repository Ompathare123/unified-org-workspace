import { Router } from "express";
import VersionController from "../controllers/version.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

// POST /api/prs/:prId/versions  — manually create a version
router.post("/", authenticate, VersionController.create);

// GET  /api/prs/:prId/versions  — list all versions for a PR
router.get("/", authenticate, VersionController.getByPR);

export default router;
