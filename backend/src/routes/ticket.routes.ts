import { Router } from "express";
import TicketController from "../controllers/ticket.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, TicketController.create);

router.get("/", authenticate, TicketController.getAll);

router.get("/:id", authenticate, TicketController.getById);

router.put("/:id", authenticate, TicketController.update);

router.delete("/:id", authenticate, TicketController.delete);

export default router;