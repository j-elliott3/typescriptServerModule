import { db } from "../index.js";
import { asc, eq } from "drizzle-orm";
import { NewRefreshToken, refreshTokens, users } from "../schema.js";

export async function createRefreshToken(refreshToken: NewRefreshToken) {
const [result] = await db
        .insert(refreshTokens)
        .values(refreshToken)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function getRefreshToken(token: string) {
    const [result] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
   
    return result;
}

export async function getUserFromRefreshToken(userId: string) { 
    const [userRows] = await db.select().from(users).where(eq(users.id, userId));
    return userRows;
}

export async function revokeRefreshToken(token: string) {
    return await db.update(refreshTokens)
        .set({revokedAt: new Date()})
        .where(eq(refreshTokens.token, token));
}