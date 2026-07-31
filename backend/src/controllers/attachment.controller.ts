import { Response } from "express";
import AttachmentService from "../services/attachment.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { CreateAttachmentInput } from "../types/attachment";

class AttachmentController {
  // POST /api/tickets/:ticketId/attachments
  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        throw new Error("No file uploaded");
      }

      const ticketId = req.params.ticketId as string;
      const payload: CreateAttachmentInput = {
        fileName: req.file.originalname,
        fileUrl: `/uploads/tickets/${ticketId}/${req.file.filename}`,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      };

      const attachment = await AttachmentService.create(
        ticketId,
        req.userId!,
        payload
      );

      return res.status(201).json(attachment);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to upload attachment",
      });
    }
  }

  // GET /api/tickets/:ticketId/attachments
  async getByTicket(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const attachments = await AttachmentService.getByTicket(
        req.params.ticketId as string,
        req.userId!
      );

      return res.json(attachments);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Failed to fetch attachments",
      });
    }
  }

  // GET /api/attachments/:attachmentId
  async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const attachment = await AttachmentService.getById(
        req.params.attachmentId as string,
        req.userId!
      );

      return res.json(attachment);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Attachment not found.",
      });
    }
  }

  // DELETE /api/attachments/:attachmentId
  async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await AttachmentService.delete(
        req.params.attachmentId as string,
        req.userId!
      );

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to delete attachment",
      });
    }
  }
}

export default new AttachmentController();
