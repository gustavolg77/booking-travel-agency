import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./modules/health/health.routes";
import authRoutes from "./modules/auth/auth.routes";
import { authenticate } from "./middlewares/auth.middlewares";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes); // público

app.use(authenticate); // 🔒 todo lo que sigue es privado

app.use("/api/health", healthRoutes);

export default app;