import { Router } from "express";
import { healthCheck } from "./health.controller";
import { asyncHandler } from "../../core/middlewares/async-handler";

const router = Router();

router.get("/", asyncHandler(healthCheck));

export default router;
