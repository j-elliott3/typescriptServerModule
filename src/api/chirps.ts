import type { Request, Response } from "express";

import { respondWithJSON, respondWithError } from "./json.js";


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

export async function handlerValidateChirp(req: Request, res: Response) {
    type Parameters = {
        body: string;
    };

    const params = req.body as Parameters;

    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new Error("Chirp is too long");
    }

    const cleanedBody = cleanChirp(params.body);

    respondWithJSON(res, 200, {
        cleanedBody: cleanedBody,
    });
}