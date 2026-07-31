import { Response } from "express";
import VersionService from "../services/version.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { CreateVersionInput } from "../types/version";

class VersionController {
  // POST /api/prs/:prId/versions
  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const version = await VersionService.create(
        req.params.prId as string,
        req.userId!,
        req.orgId!,
        req.body as CreateVersionInput
      );

      return res.status(201).json(version);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to create version",
      });
    }
  }

  // GET /api/prs/:prId/versions
  async getByPR(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const versions = await VersionService.getByPR(req.params.prId as string, req.orgId!);

      return res.json(versions);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Failed to fetch versions",
      });
    }
  }

  // GET /api/versions/:versionId
  async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const version = await VersionService.getById(req.params.versionId as string, req.orgId!);

      return res.json(version);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Version not found.",
      });
    }
  }
}

export default new VersionController();
