import type { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { upgradeUserToChirpyRed } from "../db/queries/users.js";
import { NotFoundError, UnauthorizedError } from "./errors.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";

type parameters = {
    event: string;
    data: {
        userId: string;
    };
};

export async function handlerWebhooks(req: Request, res: Response) {
    const params: parameters = req.body;
    if (params.event !== "user.upgraded") {
        res.status(204).send();
        return;
    }

    const APIKey = getAPIKey(req);
    if (APIKey !== config.polka.polkaKey) {
        throw new UnauthorizedError("Given API Key does not match");
    }

    const upgraded = await upgradeUserToChirpyRed(params.data.userId);

    if (!upgraded) {
        throw new NotFoundError("Error upgrading user");
    }
    res.status(204).send();
}