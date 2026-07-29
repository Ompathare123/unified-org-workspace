import { Response } from "express";
import ReviewService from "../services/review.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { CreateReviewInput, UpdateReviewInput } from "../types/review";

class ReviewController {
  // POST /api/prs/:prId/reviews
  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const review = await ReviewService.create(
        req.params.prId as string,
        req.userId!,
        req.body as CreateReviewInput
      );

      return res.status(201).json(review);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to submit review",
      });
    }
  }

  // GET /api/prs/:prId/reviews
  async getByPR(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const reviews = await ReviewService.getByPR(req.params.prId as string);

      return res.json(reviews);
    } catch (error) {
      return res.status(404).json({
        message: error instanceof Error ? error.message : "Failed to fetch reviews",
      });
    }
  }

  // PUT /api/reviews/:reviewId
  async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const review = await ReviewService.update(
        req.params.reviewId as string,
        req.userId!,
        req.body as UpdateReviewInput
      );

      return res.json(review);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to update review",
      });
    }
  }

  // DELETE /api/reviews/:reviewId
  async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await ReviewService.delete(req.params.reviewId as string, req.userId!);

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to delete review",
      });
    }
  }
}

export default new ReviewController();
