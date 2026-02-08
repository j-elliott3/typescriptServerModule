import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError, UnauthorizedError } from './errors.js';
import { getUserByEmail } from "../db/queries/users.js";
import { hashPassword, checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken } from "../auth.js";
import { config } from "../config.js";
import { createRefreshToken } from "../db/queries/refresh_tokens.js";

type Params = {
    password: string;
    email: string;
};

export async function handlerLogin(req: Request, res: Response) {
    const params: Params = req.body;

    const user = await getUserByEmail(params.email);
    const isValid = await checkPasswordHash(params.password, user.hashedPassword);
    if (!user || !isValid) {
        throw new UnauthorizedError("incorrect email or password");
    }

    const JWToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);
    const refreshToken = makeRefreshToken();
    const now = new Date();
    const newRefreshTokenInput = {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(now.getTime() + (60 * 60 * 24 * 60 * 1000)), // 60 days
    };
    const newRefreshTokenResult = await createRefreshToken(newRefreshTokenInput);


    respondWithJSON(res, 200, {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
        isChirpyRed: user.isChirpyRed,
        token: JWToken,
        refreshToken: newRefreshTokenResult.token,
    });
}