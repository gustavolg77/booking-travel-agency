import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./modules/health/health.routes";
import authRoutes from "./modules/auth/auth.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);

export default app;
