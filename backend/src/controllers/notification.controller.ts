import { Response } from "express";
import NotificationService from "../services/notification.service";
import { AuthRequest } from "../middleware/auth.middleware";

class NotificationController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const notifications = await NotificationService.getAll(req.userId!);
      return res.json(notifications);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to fetch notifications",
      });
    }
  }

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id as string, req.userId!);
      return res.json(notification);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to mark as read",
      });
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const result = await NotificationService.markAllAsRead(req.userId!);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to mark all as read",
      });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await NotificationService.delete(req.params.id as string, req.userId!);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to delete notification",
      });
    }
  }
}

export default new NotificationController();
