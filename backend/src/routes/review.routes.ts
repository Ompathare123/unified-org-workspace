import { Router } from "express";
import ReviewController from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

// POST   /api/prs/:prId/reviews      — submit a review
router.post("/", authenticate, ReviewController.create);

// GET    /api/prs/:prId/reviews      — list all reviews for a PR
router.get("/", authenticate, ReviewController.getByPR);

export default router;
