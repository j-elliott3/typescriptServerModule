import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";

export function middlewareLogResponse(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        if (res.statusCode >= 400) {
            console.log(`[NON-OK] ${req.method} ${req.path} - Status: ${res.statusCode}`);
        }
    })
    next();
};

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits += 1;
    next();
};

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  console.log(err);
  respondWithError(res, 500, "Something went wrong on our end");
}

type Handler = (req: Request, res: Response) => void | Promise<void>;

export function errorWrapper(handler: Handler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res)).catch(next);
  }
}