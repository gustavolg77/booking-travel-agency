import { Request, Response } from "express";
import { AuthRequest } from "../../shared/types/auth-request";
import {
  createSale,
  getSaleById,
  listPassengers,
  listSales,
} from "./sales.service";
import {
  validateCreateSaleInput,
  validateListPassengersFilters,
  validateListSalesFilters,
} from "./sales.validators";

export async function createSaleHandler(req: AuthRequest, res: Response) {
  const payload = validateCreateSaleInput(req.body);
  const sale = await createSale(payload, req.user!.userId);

  return res.status(201).json(sale);
}

export async function listSalesHandler(req: Request, res: Response) {
  const filters = validateListSalesFilters(req.query as Record<string, unknown>);
  const sales = await listSales(filters);

  return res.status(200).json(sales);
}

export async function getSaleByIdHandler(req: Request, res: Response) {
  const saleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const sale = await getSaleById(saleId);
  return res.status(200).json(sale);
}

export async function listPassengersHandler(req: Request, res: Response) {
  const filters = validateListPassengersFilters(
    req.query as Record<string, unknown>
  );
  const passengers = await listPassengers(filters);

  return res.status(200).json(passengers);
}
