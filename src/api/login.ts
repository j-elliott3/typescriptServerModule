import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError, UnauthorizedError } from './errors.js';
import { getUserByEmail } from "../db/queries/users.js";
import { hashPassword, checkPasswordHash, getBearerToken, makeJWT } from "../auth.js";
import { config } from "../config.js";

type Params = {
    password: string;
    email: string;
    expiresInSeconds?: number;
};

export async function handlerLogin(req: Request, res: Response) {
    const params: Params = req.body;

    let expiresIn = config.jwt.defaultDuration;
    if (params.expiresInSeconds) {
        if (params.expiresInSeconds < expiresIn) {
            expiresIn = params.expiresInSeconds;
        }
    }

    const user = await getUserByEmail(params.email);
    const isValid = await checkPasswordHash(params.password, user.hashedPassword);

    if (!user || !isValid) {
        throw new UnauthorizedError("incorrect email or password");
    }

    const JWToken = makeJWT(user.id, expiresIn, config.jwt.secret);

    respondWithJSON(res, 200, {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
        token: JWToken,
    });
}