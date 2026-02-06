import { hash, verify } from "argon2";
import jwt, { JwtPayload }  from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "./api/errors.js";
import type { Request } from "express";
import crypto from "node:crypto";

export async function hashPassword(password: string) {
   const hashedValue = await hash(password);

   return hashedValue;
}

export async function checkPasswordHash(password: string, hash: string) {
    if (!password) return false;
    try {
        return await verify(hash, password);
    } catch {
        return false;
    } 
}

const TOKEN_ISSUER = "chirpy";
type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string)  {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn;
    
    const token = jwt.sign(
        {
            iss: TOKEN_ISSUER,
            sub: userID,
            iat: issuedAt,
            exp: expiresAt,
        } satisfies payload,
        secret,
        { algorithm: "HS256"},
    );
    
    return token;
}

export function validateJWT(tokenString: string, secret: string) {
    let decoded: payload;
    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (e) {
        throw new UnauthorizedError("Invalid token");
    }

    if (decoded.iss !== TOKEN_ISSUER) {
        throw new UnauthorizedError("Invalid issuer");
    }

    if (!decoded.sub) {
        throw new UnauthorizedError("No user ID in token");
    }

    return decoded.sub;
}

export function getBearerToken(req: Request): string {
    let authHeader = req.get("Authorization");

    if (!authHeader) {
        throw new BadRequestError("Missing Authorization header");
    }

    return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string) {
  const splitAuth = header.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
    throw new BadRequestError("Malformed authorization header");
  }
  return splitAuth[1];
}

export function makeRefreshToken() {
 const bytes = crypto.randomBytes(256);

 return bytes.toString("hex");
}