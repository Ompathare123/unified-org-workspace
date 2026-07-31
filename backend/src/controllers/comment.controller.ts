import { Request, Response } from "express";
import CommentService from "../services/comment.service";
import { AuthRequest } from "../middleware/auth.middleware";


type TicketParams = {
  ticketId: string;
};

type CommentParams = {
  commentId: string;
};

class CommentController {
  async create(
    req: AuthRequest & Request<TicketParams>,
    res: Response
  ) {
    try {
      const ticketId = req.params.ticketId;
      const userId = req.userId;

      if (!userId) {
        throw new Error("Unauthorized");
      }

      const comment = await CommentService.create(
        ticketId,
        userId,
        req.body
      );

      return res.status(201).json(comment);
    } catch (error) {
      return res.status(400).json({
        message: (error as Error).message,
      });
    }
  }

  async getAll(
    req: AuthRequest & Request<TicketParams>,
    res: Response
  ) {
    try {
      const comments = await CommentService.getAll(
        req.params.ticketId,
        req.userId!
      );

      return res.json(comments);
    } catch (error) {
      return res.status(400).json({
        message: (error as Error).message,
      });
    }
  }

  async update(
    req: AuthRequest & Request<CommentParams>,
    res: Response
  ) {
    try {
      const comment = await CommentService.update(
        req.params.commentId,
        req.userId!,
        req.body
      );

      return res.json(comment);
    } catch (error) {
      return res.status(400).json({
        message: (error as Error).message,
      });
    }
  }

  async delete(
    req: AuthRequest & Request<CommentParams>,
    res: Response
  ) {
    try {
      const result = await CommentService.delete(
        req.params.commentId,
        req.userId!
      );

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: (error as Error).message,
      });
    }
  }
}

export default new CommentController();