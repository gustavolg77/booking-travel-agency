import { Router } from "express";
import { login } from "./auth.controller";
import { asyncHandler } from "../../core/middlewares/async-handler";

const router = Router();

router.post("/login", asyncHandler(login));

export default router;
