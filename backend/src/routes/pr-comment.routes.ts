import { Router } from "express";
import PRCommentController from "../controllers/pr-comment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.post("/", authenticate, PRCommentController.create);
router.get("/", authenticate, PRCommentController.getByPR);
router.put("/:id", authenticate, PRCommentController.update);
router.delete("/:id", authenticate, PRCommentController.delete);

export default router;
