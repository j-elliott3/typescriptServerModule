import type { Request, Response } from "express";
import { config } from "../config.js";
import { reset } from "../db/queries/users.js";
import { ForbiddenError } from "./errors.js";

export async function handlerReset(req: Request, res: Response) {
    if (config.api.platform !== "dev") {
        console.log(config.api.platform);
        throw new ForbiddenError("Reset is only allowed in dev environment.");
    }
    config.api.fileserverHits = 0;

    await reset();
    res.write("Hits reset to 0");
    res.end();
};