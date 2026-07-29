import { Router } from "express";
import AttachmentController from "../controllers/attachment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

// POST /api/tickets/:ticketId/attachments  — upload an attachment
router.post("/", authenticate, AttachmentController.create);

// GET  /api/tickets/:ticketId/attachments  — list attachments for a ticket
router.get("/", authenticate, AttachmentController.getByTicket);

export default router;
