import type { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { upgradeUserToChirpyRed } from "../db/queries/users.js";
import { NotFoundError } from "./errors.js";

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

    const upgraded = await upgradeUserToChirpyRed(params.data.userId);

    if (!upgraded) {
        throw new NotFoundError("Error upgrading user");
    }
    res.status(204).send();
}