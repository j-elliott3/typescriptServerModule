import type { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerReset(req: Request, res: Response) {
    config.fileserverHits = 0;
    res.sendStatus(200);
};