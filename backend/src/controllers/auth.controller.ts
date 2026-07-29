import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const result = await AuthService.register(req.body);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Registration failed",
      });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const result = await AuthService.login(req.body);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Login failed",
      });
    }
  }

  async me(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const user = await AuthService.me(req.userId!);

      return res.json(user);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : "Unauthorized",
      });
    }
  }
}

export default new AuthController();