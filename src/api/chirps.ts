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
    type parameters = {
        body: string;
    };

    let body = "";

    req.on("data", (chunk) => {
        body += chunk;
    });

    let params: parameters;
    req.on("end", () => {
        try {
            params = JSON.parse(body);
        } catch (err) {
            respondWithError(res, 400, "Invalid JSON");
            return;
        }
        const maxChirpLength = 140;
        if (params.body.length > maxChirpLength) {
            respondWithError(res, 400, "Chirp is too long");
            return;
        }

        const cleanedBody = cleanChirp(params.body);

        respondWithJSON(res, 200, {
            cleanedBody: cleanedBody,
        });
    });
}