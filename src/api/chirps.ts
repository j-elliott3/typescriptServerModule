import type { Request, Response } from "express";

import { respondWithJSON, respondWithError } from "./json.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "./errors.js"
import { createChirp, getChirps, getChirpById } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

function cleanChirp(body: string): string {
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    let cleanedBody: string[] = [];
    const splitBody = body.split(" ");

    for (let word of splitBody) {
        if (badWords.includes(word.toLowerCase())) {
            word = "****";
            cleanedBody.push(word);
        } else {
            cleanedBody.push(word);
        }
    }
    return cleanedBody.join(" ");
}

export async function handlerCreateChirp(req: Request, res: Response) {
    type Parameters = {
        body: string;
    };

    const params = req.body as Parameters;

    if (!params.body) {
        throw new BadRequestError("Missing required fields")
    }

    const token = getBearerToken(req);
    const validatedId = validateJWT(token, config.jwt.secret);
    if (!validatedId) {
        throw new UnauthorizedError("Invalid JWT");
    }

    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    params.body = cleanChirp(params.body);

    const chirp = await createChirp({ body: params.body, userId: validatedId });

    if (!chirp) {
        throw new Error("Could not create chirp");
    }

    respondWithJSON(res, 201, {
        id: chirp.id,
        createdAt: chirp.createdAt,
        updatedAt: chirp.updatedAt,
        body: chirp.body,
        userId: chirp.userId,
    });
}

export async function getAllChirps(req: Request, res: Response) {
    const chirps = await getChirps();

    if (!chirps) {
        throw new Error("Could not get chirps");
    }

    respondWithJSON(res, 200, chirps);
}

export async function getSingleChirpById(req: Request, res: Response) {
    const { chirpId } = req.params as { chirpId: string };
    
    const chirp = await getChirpById(chirpId);
    
    if (!chirp) {
        throw new NotFoundError("Chirp not found");
    }

    respondWithJSON(res, 200, chirp);
}