import { Router } from "express";
import DigestController from "../controllers/digest.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// GET /api/digest
router.get("/", authenticate, DigestController.getDigest);

export default router;
