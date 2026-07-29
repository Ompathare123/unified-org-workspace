import { Router } from "express";

import CommentController from "../controllers/comment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/tickets/:ticketId/comments",
  authenticate,
  CommentController.create
);

router.get(
  "/tickets/:ticketId/comments",
  authenticate,
  CommentController.getAll
);

router.put(
  "/comments/:commentId",
  authenticate,
  CommentController.update
);

router.delete(
  "/comments/:commentId",
  authenticate,
  CommentController.delete
);

export default router;