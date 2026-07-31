import { Response } from "express";
import PRService from "../services/pr.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { CreatePRInput, UpdatePRInput } from "../types/pr";

class PRController {
  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await PRService.create(req.userId!, req.body as CreatePRInput, req.orgId);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to create PR",
      });
    }
  }

  async getStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const stats = await PRService.getStats(req.userId!, req.orgId);
      return res.json(stats);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to fetch PR stats",
      });
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const query = {
        search: req.query.search as string,
        status: req.query.status as string,
        author: req.query.author as string,
        branch: req.query.branch as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as string,
      };

      const prs = await PRService.getAll(req.userId!, req.orgId, query);
      return res.json(prs);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to fetch PRs",
      });
    }
  }


  async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const pr = await PRService.getById(req.params.id as string, req.userId!, req.orgId);

      return res.json(pr);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "PR not found.",
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await PRService.update(req.params.id as string, req.userId!, req.body as UpdatePRInput);

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to update PR",
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await PRService.delete(req.params.id as string, req.userId!);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to delete PR",
      });
    }
  }

  async merge(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await PRService.merge(req.params.id as string, req.userId!);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to merge PR",
      });
    }
  }

  async close(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await PRService.close(req.params.id as string, req.userId!);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to close PR",
      });
    }
  }

  async reopen(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await PRService.reopen(req.params.id as string, req.userId!);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to reopen PR",
      });
    }
  }
}

export default new PRController();
