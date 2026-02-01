import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from './errors.js';
import { createUser } from "../db/queries/users.js";

export async function createNewUser(req: Request, res: Response) {
    type parameters = {
        email: string;
    };
    const params: parameters = req.body;
    
    if (!params.email) {
        throw new BadRequestError("Missing required fields");
    }

    const user = await createUser(req.body);

    if (!user) {
        throw new Error("Could not create user");
    }
    
    respondWithJSON(res, 201, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
}