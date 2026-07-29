import { Router } from "express";
import NotificationController from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// GET /api/notifications
router.get("/", authenticate, NotificationController.getAll);

// PATCH /api/notifications/read-all
router.patch("/read-all", authenticate, NotificationController.markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch("/:id/read", authenticate, NotificationController.markAsRead);

// DELETE /api/notifications/:id
router.delete("/:id", authenticate, NotificationController.delete);

export default router;
