import { Request, Response } from "express";
import { createReceiptFromSale, getReceiptBySaleId } from "./receipt.service";
import { validateCreateReceiptInput } from "./receipt.validators";

export async function createReceiptHandler(req: Request, res: Response) {
  const payload = validateCreateReceiptInput(req.body);
  const receipt = await createReceiptFromSale(payload.saleId);

  return res.status(201).json(receipt);
}

export async function getReceiptBySaleIdHandler(req: Request, res: Response) {
  const saleId = Array.isArray(req.params.saleId)
    ? req.params.saleId[0]
    : req.params.saleId;
  const receipt = await getReceiptBySaleId(saleId);
  return res.status(200).json(receipt);
}
