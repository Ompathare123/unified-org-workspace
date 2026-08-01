import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { Role } from "@prisma/client";
import OrgController from "../controllers/org.controller";

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// ── MEMBER MANAGEMENT ────────────────────────────────────
router.get("/members", OrgController.listMembers);
router.delete("/members/:userId", requireRole(Role.ORG_ADMIN), OrgController.removeMember);
router.put("/members/:userId/role", requireRole(Role.ORG_ADMIN), OrgController.updateMemberRole);

// ── SELF-SERVICE ──────────────────────────────────────────────────────────
router.post("/leave", OrgController.leaveOrg);
router.post("/transfer-ownership", requireRole(Role.ORG_ADMIN), OrgController.transferOwnership);

// ── INVITATIONS (Org Admin only) ──────────────────────────────────────────
router.get("/invitations", requireRole(Role.ORG_ADMIN), OrgController.listInvitations);
router.post("/invitations", requireRole(Role.ORG_ADMIN), OrgController.inviteMember);
router.post("/invitations/:id/resend", requireRole(Role.ORG_ADMIN), OrgController.resendInvitation);
router.delete("/invitations/:id", requireRole(Role.ORG_ADMIN), OrgController.cancelInvitation);

export default router;
