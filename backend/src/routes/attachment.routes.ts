import { Router } from "express";
import AttachmentController from "../controllers/attachment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { Role } from "@prisma/client";
import multer from "multer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ticketId = req.params.ticketId as string;
    // Store in backend/uploads/tickets/{ticketId}
    const dir = path.join(__dirname, "../../uploads/tickets", ticketId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".txt", ".log", ".csv", ".docx", ".xlsx", ".zip"];
    const disallowedExts = [".exe", ".bat", ".sh"];
    
    if (disallowedExts.includes(ext)) {
      return cb(new Error("Executable files are not allowed"));
    }
    if (!allowedExts.includes(ext)) {
      return cb(new Error("File type not supported"));
    }
    cb(null, true);
  }
});

const router = Router({ mergeParams: true });

// POST /api/tickets/:ticketId/attachments  — upload an attachment
router.post("/", authenticate, requireRole(Role.ORG_ADMIN, Role.SUPPORT_AGENT), upload.single("file"), AttachmentController.create);

// GET  /api/tickets/:ticketId/attachments  — list attachments for a ticket
router.get("/", authenticate, AttachmentController.getByTicket);

export default router;
