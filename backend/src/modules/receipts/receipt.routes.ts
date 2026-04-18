import { Router } from "express";
import { asyncHandler } from "../../core/middlewares/async-handler";
import {
  createReceiptHandler,
  getReceiptBySaleIdHandler,
} from "./receipt.controller";

const router = Router();

router.post("/", asyncHandler(createReceiptHandler));
router.get("/sale/:saleId", asyncHandler(getReceiptBySaleIdHandler));

export default router;
