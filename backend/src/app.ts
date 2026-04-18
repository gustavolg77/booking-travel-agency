import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors";
import { authenticate } from "./middlewares/auth.middlewares";
import { errorHandler } from "./core/middlewares/error-handler";
import { notFoundHandler } from "./core/middlewares/not-found";
import { privateRouter, publicRouter } from "./routes";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", publicRouter);
app.use("/api", authenticate, privateRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
