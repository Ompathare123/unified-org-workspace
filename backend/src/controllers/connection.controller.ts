import { Response } from "express";
import ConnectionService from "../services/connection.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { CreateConnectionInput } from "../types/connection";

class ConnectionController {
  async requestConnection(req: AuthRequest, res: Response) {
    try {
      const { partnerOrgId } = req.body as CreateConnectionInput;
      const connection = await ConnectionService.requestConnection(req.userId!, partnerOrgId);
      return res.status(201).json(connection);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to request connection",
      });
    }
  }

  async acceptConnection(req: AuthRequest, res: Response) {
    try {
      const connection = await ConnectionService.acceptConnection(req.params.id as string, req.userId!);
      return res.json(connection);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to accept connection",
      });
    }
  }

  async rejectConnection(req: AuthRequest, res: Response) {
    try {
      const connection = await ConnectionService.rejectConnection(req.params.id as string, req.userId!);
      return res.json(connection);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to reject connection",
      });
    }
  }

  async revokeConnection(req: AuthRequest, res: Response) {
    try {
      const result = await ConnectionService.revokeConnection(req.params.id as string, req.userId!);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to revoke connection",
      });
    }
  }
}

export default new ConnectionController();
