import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from './errors.js';
import { createUser } from "../db/queries/users.js";
import { hashPassword } from "../auth.js";

export async function createNewUser(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
    };
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
    });
}