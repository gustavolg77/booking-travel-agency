import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import healthRoutes from "../modules/health/health.routes";
import clientRoutes from "../modules/clients/client.routes";
import salesRoutes from "../modules/sales/sales.routes";
import receiptRoutes from "../modules/receipts/receipt.routes";

export const publicRouter = Router();
export const privateRouter = Router();

publicRouter.use("/auth", authRoutes);
publicRouter.use("/health", healthRoutes);

privateRouter.use("/clients", clientRoutes);
privateRouter.use("/sales", salesRoutes);
privateRouter.use("/receipts", receiptRoutes);
