import { Response, NextFunction } from "express";
import { AppError } from "../core/errors/app-error";
import { AuthRequest } from "../shared/types/auth-request";
import { verifyAccessToken } from "../shared/utils/jwt";

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError("Invalid token", 401));
  }
}
