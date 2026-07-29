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
import ReviewController from "./controllers/review.controller";
import VersionController from "./controllers/version.controller";
import { authenticate } from "./middleware/auth.middleware";
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

// PR-scoped review routes: POST /api/prs/:prId/reviews  &  GET /api/prs/:prId/reviews
app.use("/api/prs/:prId/reviews", reviewRoutes);

// Standalone review mutation routes (no prId in path)
// PUT    /api/reviews/:reviewId  — update a review
// DELETE /api/reviews/:reviewId  — delete a review
app.put("/api/reviews/:reviewId", authenticate, ReviewController.update);
app.delete("/api/reviews/:reviewId", authenticate, ReviewController.delete);

// PR-scoped version routes: POST /api/prs/:prId/versions  &  GET /api/prs/:prId/versions
app.use("/api/prs/:prId/versions", versionRoutes);

// Standalone version route (by versionId, not prId)
// GET /api/versions/:versionId  — get single version with PR and org
app.get("/api/versions/:versionId", authenticate, VersionController.getById);

const commentRouter =
  ((commentRoutes as unknown as { default?: Router }).default ??
    commentRoutes) as Router;

app.use("/api", commentRouter);

export default app;
