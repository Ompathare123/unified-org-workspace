import express = require("express");
import cors = require("cors");
import cookieParser = require("cookie-parser");

import "./config/env";

import authRoutes from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes";
import commentRoutes from "./routes/comment.routes";
import prRoutes from "./routes/pr.routes";
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
const commentRouter =
  ((commentRoutes as unknown as { default?: Router }).default ??
    commentRoutes) as Router;

app.use("/api", commentRouter);

export default app;
