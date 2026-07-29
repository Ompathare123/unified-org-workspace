import { Response } from "express";
import ShareService from "../services/share.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { CreateShareInput } from "../types/share";

class ShareController {
  async shareItem(req: AuthRequest, res: Response) {
    try {
      const share = await ShareService.shareItem(req.userId!, req.body as CreateShareInput);
      return res.status(201).json(share);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to share item",
      });
    }
  }

  async getSharedItems(req: AuthRequest, res: Response) {
    try {
      const items = await ShareService.getSharedItems(req.userId!);
      return res.json(items);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to fetch shared items",
      });
    }
  }

  async revokeShare(req: AuthRequest, res: Response) {
    try {
      const result = await ShareService.revokeShare(req.params.id as string, req.userId!);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to revoke share",
      });
    }
  }
}

export default new ShareController();
