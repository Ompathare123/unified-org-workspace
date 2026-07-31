import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import UserController from "../controllers/user.controller";

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// ── MY INVITATIONS ────────────────────────────────────────────────────────
router.get("/invitations", UserController.listMyInvitations);
router.post("/invitations/:id/accept", UserController.acceptInvitation);
router.post("/invitations/:id/decline", UserController.declineInvitation);

export default router;
