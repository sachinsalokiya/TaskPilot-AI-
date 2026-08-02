import jwt from "jsonwebtoken";
import { AppError } from "./errors";

const JWT_EXPIRY = "15m";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }
  return secret;
}

export interface JwtPayload {
  userId: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    if (!payload.userId) {
      throw new AppError("Invalid token", 401);
    }
    return payload;
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}
