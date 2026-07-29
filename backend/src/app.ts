import express = require("express");
import cors = require("cors");
import cookieParser = require("cookie-parser");

import "./config/env";

import authRoutes from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes";
import commentRoutes from "./routes/comment.routes";
import prRoutes from "./routes/pr.routes";
import reviewRoutes from "./routes/review.routes";
import versionRoutes from "./routes/version.routes";
import attachmentRoutes from "./routes/attachment.routes";
import auditRoutes from "./routes/audit.routes";
import ReviewController from "./controllers/review.controller";
import VersionController from "./controllers/version.controller";
import AttachmentController from "./controllers/attachment.controller";
import { authenticate } from "./middleware/auth.middleware";
import { requireRole } from "./middleware/rbac.middleware";
import { Role } from "@prisma/client";
import type { Router } from "express";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Unified Org Workspace API Running 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/prs", prRoutes);

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

// ── Comments (legacy import workaround) ────────────────────────────────────
const commentRouter =
  ((commentRoutes as unknown as { default?: Router }).default ??
    commentRoutes) as Router;

app.use("/api", commentRouter);

export default app;
