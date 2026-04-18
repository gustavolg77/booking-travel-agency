import { Request, Response } from "express";
import {
  createClient,
  findClientByDocument,
  getClientById,
  listClients,
} from "./client.service";
import {
  validateCreateClientInput,
  validateListClientsFilters,
} from "./client.validators";

export async function createClientHandler(req: Request, res: Response) {
  const payload = validateCreateClientInput(req.body);
  const client = await createClient(payload);

  return res.status(201).json(client);
}

export async function listClientsHandler(req: Request, res: Response) {
  const filters = validateListClientsFilters(
    req.query as Record<string, unknown>
  );
  const clients = await listClients(filters);

  return res.status(200).json(clients);
}

export async function findClientByDocumentHandler(
  req: Request,
  res: Response
) {
  const documentType = String(req.query.documentType || "CI");
  const documentNumber = String(req.query.documentNumber || "").trim();

  const client = await findClientByDocument(documentType, documentNumber);

  return res.status(200).json(client);
}

export async function getClientByIdHandler(req: Request, res: Response) {
  const clientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const client = await getClientById(clientId);
  return res.status(200).json(client);
}
