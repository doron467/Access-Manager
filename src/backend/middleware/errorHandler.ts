import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export function errorHandler( err: unknown, req: Request,res: Response,next: NextFunction) {
    console.error(err);

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            message: err.message,
        });
        return;
    }

    res.status(500).json({
        message: "Internal server error",
    });
}