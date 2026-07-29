import { Response } from "express";
import DigestService from "../services/digest.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { DigestQueryParams } from "../types/digest";

class DigestController {
  async getDigest(req: AuthRequest, res: Response) {
    try {
      const query = req.query as DigestQueryParams;
      const digest = await DigestService.generateDigest(req.userId!, query);
      return res.json(digest);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to generate digest",
      });
    }
  }
}

export default new DigestController();
