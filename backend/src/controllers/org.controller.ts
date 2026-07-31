import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import OrgService from "../services/org.service";
import { Role } from "@prisma/client";

class OrgController {
  // ── MEMBERS ──────────────────────────────────────────────────────────────
  async listMembers(req: AuthRequest, res: Response) {
    try {
      const members = await OrgService.listMembers(req.orgId!);
      res.json(members);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to list members" });
    }
  }

  async removeMember(req: AuthRequest, res: Response) {
    try {
      await OrgService.removeMember(req.orgId!, req.params.userId as string, req.userId!);
      res.json({ success: true, message: "Member removed successfully" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to remove member" });
    }
  }

  async updateMemberRole(req: AuthRequest, res: Response) {
    try {
      const { role } = req.body;
      const updated = await OrgService.updateMemberRole(req.orgId!, req.params.userId as string, role as Role, req.userId!);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update member role" });
    }
  }

  async leaveOrg(req: AuthRequest, res: Response) {
    try {
      await OrgService.leaveOrg(req.orgId!, req.userId!);
      res.json({ success: true, message: "Left organization successfully" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to leave organization" });
    }
  }

  async transferOwnership(req: AuthRequest, res: Response) {
    try {
      const { toUserId } = req.body;
      await OrgService.transferOwnership(req.orgId!, req.userId!, toUserId);
      res.json({ success: true, message: "Ownership transferred successfully" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to transfer ownership" });
    }
  }

  // ── INVITATIONS ──────────────────────────────────────────────────────────
  async listInvitations(req: AuthRequest, res: Response) {
    try {
      const invitations = await OrgService.listInvitations(req.orgId!);
      res.json(invitations);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to list invitations" });
    }
  }

  async inviteMember(req: AuthRequest, res: Response) {
    try {
      const { email, role } = req.body;
      if (!email || !role) throw new Error("Email and role are required.");
      
      const invitation = await OrgService.inviteMember(req.orgId!, email, role as Role, req.userId!);
      res.json(invitation);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to invite member" });
    }
  }

  async resendInvitation(req: AuthRequest, res: Response) {
    try {
      const resent = await OrgService.resendInvitation(req.orgId!, req.params.id as string, req.userId!);
      res.json(resent);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to resend invitation" });
    }
  }

  async cancelInvitation(req: AuthRequest, res: Response) {
    try {
      const cancelled = await OrgService.cancelInvitation(req.orgId!, req.params.id as string, req.userId!);
      res.json(cancelled);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to cancel invitation" });
    }
  }
}

export default new OrgController();
