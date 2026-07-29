import { Response } from "express";
import PRService from "../services/pr.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { CreatePRInput, UpdatePRInput } from "../types/pr";

class PRController {
  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await PRService.create(req.userId!, req.body as CreatePRInput);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to create PR",
      });
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const prs = await PRService.getAll(req.userId!);

      return res.json(prs);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to fetch PRs",
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const pr = await PRService.getById(req.params.id as string);

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
      const result = await PRService.delete(req.params.id as string);

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to delete PR",
      });
    }
  }
}

export default new PRController();
