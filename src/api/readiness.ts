import type { Request, Response } from "express";

export async function handlerReadiness(req: Request, res: Response) {
    res
    .set("Content-Type", "text/plain; charset=utf-8")
    .send("OK");
};