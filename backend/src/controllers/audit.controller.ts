import { Request, Response } from "express";
import AuditService from "../services/audit.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { AuditLogFilters } from "../types/audit";

class AuditController {
  // GET /api/audit-logs
  async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const filters: AuditLogFilters = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        userId: req.query.userId as string | undefined,
        entityType: req.query.entityType as string | undefined,
        action: req.query.action as string | undefined,
      };

      const logs = await AuditService.getAll(req.userId!, filters);

      return res.json(logs);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to fetch audit logs",
      });
    }
  }

  // GET /api/audit-logs/export  — must be declared BEFORE /:id route
  async exportCsv(req: AuthRequest, res: Response): Promise<void> {
    try {
      const csv = await AuditService.exportCsv(req.userId!);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=audit-logs.csv"
      );
      res.status(200).send(csv);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to export audit logs",
      });
    }
  }

  // GET /api/audit-logs/:id
  async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const log = await AuditService.getById(
        req.params.id as string,
        req.userId!
      );

      return res.json(log);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Audit log not found.",
      });
    }
  }
}

export default new AuditController();
