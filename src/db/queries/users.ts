import { UUID } from "node:crypto";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function createUser(user: NewUser) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function deleteChirps() {
    await db.delete(users);
}