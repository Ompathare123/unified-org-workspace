import { Response } from "express";
import PRCommentService from "../services/pr-comment.service";
import { AuthRequest } from "../middleware/auth.middleware";

class PRCommentController {
  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const comment = await PRCommentService.create(req.params.prId as string, req.userId!, req.orgId!, req.body);
      return res.status(201).json(comment);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || "Failed to create PR comment" });
    }
  }

  async getByPR(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const result = await PRCommentService.getByPR(req.params.prId as string, req.orgId!, page, limit);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || "Failed to fetch PR comments" });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const comment = await PRCommentService.update(req.params.id as string, req.userId!, req.body);
      return res.json(comment);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || "Failed to update PR comment" });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const comment = await PRCommentService.delete(req.params.id as string, req.userId!);
      return res.json(comment);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || "Failed to delete PR comment" });
    }
  }
}

export default new PRCommentController();
