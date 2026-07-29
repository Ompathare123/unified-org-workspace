import { Response } from "express";

import TicketService from "../services/ticket.service";
import { AuthRequest } from "../middleware/auth.middleware";

class TicketController {
  async create(req: AuthRequest, res: Response) {
    try {
      const ticket = await TicketService.create(
        req.userId!,
        req.body
      );

      return res.status(201).json(ticket);
    } catch (error) {
      return res.status(400).json({
        message: (error as Error).message,
      });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const tickets = await TicketService.getAll(req.userId!);

      return res.json(tickets);
    } catch (error) {
      return res.status(400).json({
        message: (error as Error).message,
      });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const ticketId = req.params.id as string;

      if (!ticketId) {
        throw new Error("Ticket ID is required.");
      }

      const ticket = await TicketService.getById(ticketId);

      return res.json(ticket);
    } catch (error) {
      return res.status(404).json({
        message: (error as Error).message,
      });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const ticketId = req.params.id as string;

      if (!ticketId) {
        throw new Error("Ticket ID is required.");
      }

      const ticket = await TicketService.update(ticketId, req.body);

      return res.json(ticket);
    } catch (error) {
      return res.status(400).json({
        message: (error as Error).message,
      });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const ticketId = req.params.id as string;

      if (!ticketId) {
        throw new Error("Ticket ID is required.");
      }

      const result = await TicketService.delete(ticketId);

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: (error as Error).message,
      });
    }
  }
}

export default new TicketController();