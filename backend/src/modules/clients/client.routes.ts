import { Router } from "express";
import { asyncHandler } from "../../core/middlewares/async-handler";
import {
  createClientHandler,
  findClientByDocumentHandler,
  getClientByIdHandler,
  listClientsHandler,
} from "./client.controller";

const router = Router();

router.get("/", asyncHandler(listClientsHandler));
router.get("/lookup", asyncHandler(findClientByDocumentHandler));
router.get("/:id", asyncHandler(getClientByIdHandler));
router.post("/", asyncHandler(createClientHandler));

export default router;
