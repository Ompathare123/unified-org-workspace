import { Router } from "express";
import TicketController from "../controllers/ticket.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.post("/", authenticate, requireRole(Role.ORG_ADMIN, Role.SUPPORT_AGENT), TicketController.create);

router.get("/", authenticate, TicketController.getAll);

router.get("/:id", authenticate, TicketController.getById);

router.put("/:id", authenticate, requireRole(Role.ORG_ADMIN, Role.SUPPORT_AGENT), TicketController.update);

router.delete("/:id", authenticate, requireRole(Role.ORG_ADMIN, Role.SUPPORT_AGENT), TicketController.delete);

export default router;