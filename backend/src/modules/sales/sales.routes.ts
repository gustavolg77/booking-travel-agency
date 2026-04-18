import { Router } from "express";
import { asyncHandler } from "../../core/middlewares/async-handler";
import {
  createSaleHandler,
  getSaleByIdHandler,
  getWeeklyReportHandler,
  listPassengersHandler,
  listSalesHandler,
} from "./sales.controller";

const router = Router();

router.get("/", asyncHandler(listSalesHandler));
router.get("/weekly-report", asyncHandler(getWeeklyReportHandler));
router.get("/passengers", asyncHandler(listPassengersHandler));
router.get("/:id", asyncHandler(getSaleByIdHandler));
router.post("/", asyncHandler(createSaleHandler));

export default router;
