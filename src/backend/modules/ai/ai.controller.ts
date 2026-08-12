import type { RequestHandler } from "express";
import { logger } from "../../utils/logger.js";
import * as aiService from "./ai.service.js";

export const reviewRequest: RequestHandler = async (req, res, next) => {
    
  try {
    if (!req.user) {
      logger.warn("ai_review_unauthenticated");
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const { requestId } = req.params;

    if (typeof requestId !== "string") {
      res.status(400).json({
        message: "Invalid request id",
      });
      return;
    }

    const review = await aiService.reviewRequest(
      requestId,
      req.user.id
    );

    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};