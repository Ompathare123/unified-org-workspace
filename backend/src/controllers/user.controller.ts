import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import UserService from "../services/user.service";

class UserController {
  async listMyInvitations(req: AuthRequest, res: Response) {
    try {
      const invitations = await UserService.listMyInvitations(req.userId!);
      res.json(invitations);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to list invitations" });
    }
  }

  async acceptInvitation(req: AuthRequest, res: Response) {
    try {
      const result = await UserService.acceptInvitation(req.userId!, req.params.id as string);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to accept invitation" });
    }
  }

  async declineInvitation(req: AuthRequest, res: Response) {
    try {
      const result = await UserService.declineInvitation(req.userId!, req.params.id as string);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to decline invitation" });
    }
  }
}

export default new UserController();
