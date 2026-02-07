import type { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { getBearerToken, makeJWT } from "../auth.js";
import { getRefreshToken, getUserFromRefreshToken, revokeRefreshToken } from "../db/queries/refresh_tokens.js";
import { config } from "../config.js";
import { BadRequestError } from "./errors.js";

export async function handlerRefresh(req: Request, res: Response) {
    const bearerToken = getBearerToken(req);

    const refreshToken = await getRefreshToken(bearerToken);

    if (!refreshToken || refreshToken.expiresAt.getTime() < Date.now() || refreshToken.revokedAt !== null) {
        respondWithError(res, 401, "Invalid refresh token");
        return;
    }

    const user = await getUserFromRefreshToken(refreshToken.userId);
    const JWToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);

    respondWithJSON(res, 200, {
        token: JWToken,
    });
}

export async function handlerRevoke(req: Request, res: Response) {
    const bearerToken = getBearerToken(req);

    const refreshToken = await getRefreshToken(bearerToken);

    if (!refreshToken) {
        res.status(204).send();
        return;
    }

    await revokeRefreshToken(refreshToken.token);

    res.status(204).send();
}