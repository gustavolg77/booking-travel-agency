import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export function signAccessToken(payload: { userId: string; role: string }) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: "8h",
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as {
    userId: string;
    role: string;
  };
}
