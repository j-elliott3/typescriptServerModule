import { UUID } from "node:crypto";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function reset() {
    await db.delete(users);
}

export async function getUserByEmail(email: string) {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

    return result;
}

export async function updateUserEmailAndPassword(
    userId: string, 
    newEmail: string, 
    newPasswordHash: string) {
    const [result] = await db.update(users)
            .set({email: newEmail, hashedPassword: newPasswordHash})
            .where(eq(users.id, userId))
            .returning();
    return result;
}

export async function upgradeUserToChirpyRed(id: string) {
    const rows = await db.update(users)
            .set({isChirpyRed: true})
            .where(eq(users.id, id))
            .returning();
    return rows.length > 0;
}