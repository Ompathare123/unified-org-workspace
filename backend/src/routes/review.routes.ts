import { Router } from "express";
import ReviewController from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { Role } from "@prisma/client";

const router = Router({ mergeParams: true });

// POST   /api/prs/:prId/reviews      — submit a review
router.post("/", authenticate, requireRole(Role.ORG_ADMIN, Role.REVIEWER), ReviewController.create);

// GET    /api/prs/:prId/reviews      — list all reviews for a PR
router.get("/", authenticate, ReviewController.getByPR);

export default router;
