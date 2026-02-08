import type { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError } from './errors.js';
import { createUser, updateUserEmailAndPassword } from "../db/queries/users.js";
import { getRefreshToken, getUserFromRefreshToken } from "../db/queries/refresh_tokens.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { config } from "../config.js";

type parameters = {
        email: string;
        password: string;
    };

export async function createNewUser(req: Request, res: Response) {
    const params: parameters = req.body;
    
    if (!params.email || !params.password) {
        throw new BadRequestError("Missing required fields");
    }

    const hashedPassword = await hashPassword(params.password);
    const newUserInput = {
        email: params.email,
        hashedPassword: hashedPassword,
    };

    const user = await createUser(newUserInput);

    if (!user) {
        throw new Error("Could not create user");
    }
    
    respondWithJSON(res, 201, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isChirpyRed: user.isChirpyRed,
    });
}

export async function updateUserLoginInfo(req: Request, res: Response) {
    const token = getBearerToken(req);
    
    if (!token) {
        respondWithError(res, 401, "Invalid access token");
        return;
    }

    const userId = validateJWT(token, config.jwt.secret);
    const params: parameters = req.body;
    const hashedPassword = await hashPassword(params.password);

    const updatedUser = await updateUserEmailAndPassword(userId, params.email, hashedPassword);

    respondWithJSON(res, 200, {
        id: updatedUser.id,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        isChirpyRed: updatedUser.isChirpyRed,
    })
}