import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
} from "./errors.js";

export function middlewareLogResponse(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        if (res.statusCode >= 400) {
            console.log(`[NON-OK] ${req.method} ${req.path} - Status: ${res.statusCode}`);
        }
    })
    next();
};

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.api.fileserverHits += 1;
    next();
};

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
    let statusCode = 500;
    let message = "Something went wrong on our end";
    if (err instanceof BadRequestError) {
        statusCode = 400;
        message = err.message;
    }
    if (err instanceof UnauthorizedError) {
        statusCode = 401;
        message = err.message;
    }
    if (err instanceof ForbiddenError) {
        statusCode = 403;
        message = err.message;
    }
    if (err instanceof NotFoundError) {
        statusCode = 404;
        message = err.message;
    }

    if (statusCode >= 500) {
        console.log(err.message);
    }

    respondWithError(res, statusCode, message);
}

type Handler = (req: Request, res: Response) => void | Promise<void>;

export function errorWrapper(handler: Handler) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(handler(req, res)).catch(next);
    }
}