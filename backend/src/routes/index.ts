import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import healthRoutes from "../modules/health/health.routes";

export const publicRouter = Router();

publicRouter.use("/auth", authRoutes);
publicRouter.use("/health", healthRoutes);
