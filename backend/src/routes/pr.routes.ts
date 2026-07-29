import { Router } from "express";
import PRController from "../controllers/pr.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, PRController.create);
router.get("/", authenticate, PRController.getAll);
router.get("/:id", authenticate, PRController.getById);
router.put("/:id", authenticate, PRController.update);
router.delete("/:id", authenticate, PRController.delete);

export default router;
