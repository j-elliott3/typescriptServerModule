import { db } from "../index.js";
import { asc, eq } from "drizzle-orm";
import { NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function getChirps() {
    return db.select().from(chirps).orderBy(asc(chirps.createdAt));
}

export async function getChirpById(id: string) {
    const rows = await db.select().from(chirps).where(eq(chirps.id, id));

    const chirp = rows[0];
    return chirp;
}

export async function deleteChirp(id: string) {
  const rows = await db.delete(chirps).where(eq(chirps.id, id)).returning();
  return rows.length > 0;
}