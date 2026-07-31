import express = require("express");
import cors = require("cors");
import cookieParser = require("cookie-parser");
import path from "path";

import "./config/env";

import authRoutes from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes";
import commentRoutes from "./routes/comment.routes";
import prRoutes from "./routes/pr.routes";
import prCommentRoutes from "./routes/pr-comment.routes";
import reviewRoutes from "./routes/review.routes";
import versionRoutes from "./routes/version.routes";
import attachmentRoutes from "./routes/attachment.routes";
import auditRoutes from "./routes/audit.routes";
import connectionRoutes from "./routes/connection.routes";
import shareRoutes from "./routes/share.routes";
import notificationRoutes from "./routes/notification.routes";
import digestRoutes from "./routes/digest.routes";
import orgRoutes from "./routes/org.routes";
import userRoutes from "./routes/user.routes";
import ReviewController from "./controllers/review.controller";
import VersionController from "./controllers/version.controller";
import AttachmentController from "./controllers/attachment.controller";
import { authenticate } from "./middleware/auth.middleware";
import { requireRole } from "./middleware/rbac.middleware";
import { Role } from "@prisma/client";
import type { Router } from "express";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Unified Org Workspace API Running 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orgs", orgRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/tickets/:ticketId/comments", commentRoutes);
app.use("/api/prs", prRoutes);
app.use("/api/prs/:prId/comments", prCommentRoutes);

// ── Reviews ────────────────────────────────────────────────────────────────
// POST   /api/prs/:prId/reviews
// GET    /api/prs/:prId/reviews
app.use("/api/prs/:prId/reviews", reviewRoutes);

// PUT    /api/reviews/:reviewId
// DELETE /api/reviews/:reviewId
app.put("/api/reviews/:reviewId", authenticate, requireRole(Role.ORG_ADMIN, Role.REVIEWER), ReviewController.update);
app.delete("/api/reviews/:reviewId", authenticate, requireRole(Role.ORG_ADMIN, Role.REVIEWER), ReviewController.delete);

// ── Versions ───────────────────────────────────────────────────────────────
// POST /api/prs/:prId/versions
// GET  /api/prs/:prId/versions
app.use("/api/prs/:prId/versions", versionRoutes);

// GET  /api/versions/:versionId
app.get("/api/versions/:versionId", authenticate, VersionController.getById);

// ── Attachments ────────────────────────────────────────────────────────────
// POST /api/tickets/:ticketId/attachments
// GET  /api/tickets/:ticketId/attachments
app.use("/api/tickets/:ticketId/attachments", attachmentRoutes);

// GET    /api/attachments/:attachmentId
// DELETE /api/attachments/:attachmentId
app.get("/api/attachments/:attachmentId", authenticate, AttachmentController.getById);
app.delete("/api/attachments/:attachmentId", authenticate, requireRole(Role.ORG_ADMIN, Role.SUPPORT_AGENT), AttachmentController.delete);

// ── Audit Logs ─────────────────────────────────────────────────────────────
// GET /api/audit-logs
app.use("/api/audit-logs", auditRoutes);

// ── Cross-Org Connections & Sharing ────────────────────────────────────────
app.use("/api/connections", connectionRoutes);
app.use("/api/share", shareRoutes);

// ── Notifications ──────────────────────────────────────────────────────────
app.use("/api/notifications", notificationRoutes);

// ── Progress Digest ────────────────────────────────────────────────────────
app.use("/api/digest", digestRoutes);

// ── Comments ───────────────────────────────────────────────────────────────
app.use("/api", commentRoutes);

export default app;

