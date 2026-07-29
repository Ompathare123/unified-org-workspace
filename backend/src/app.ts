import express = require("express");
import cors = require("cors");
import cookieParser = require("cookie-parser");

import "./config/env";

import authRoutes from "./routes/auth.routes";

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

export default app;