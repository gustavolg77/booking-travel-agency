import { DocumentType } from "@prisma/client";
import { AppError } from "../../core/errors/app-error";
import { CreateClientInput, ListClientsFilters } from "./client.types";

function sanitizeText(value?: string) {
  return value?.trim() || undefined;
}

export function validateCreateClientInput(
  input: Partial<CreateClientInput>
): CreateClientInput {
  const firstName = sanitizeText(input.firstName);
  const lastName = sanitizeText(input.lastName);
  const documentNumber = sanitizeText(input.documentNumber);

  if (!firstName || !lastName || !documentNumber) {
    throw new AppError(
      "First name, last name and document number are required",
      400
    );
  }

  return {
    firstName,
    lastName,
    documentType: input.documentType || DocumentType.CI,
    documentNumber,
    phone: sanitizeText(input.phone),
    email: sanitizeText(input.email),
    nit: sanitizeText(input.nit),
    businessName: sanitizeText(input.businessName),
    notes: sanitizeText(input.notes),
  };
}

export function validateListClientsFilters(
  query: Record<string, unknown>
): ListClientsFilters {
  const ranking = query.ranking === "top" ? "top" : "recent";
  const week =
    typeof query.week === "string" && query.week
      ? Number(query.week)
      : undefined;

  return {
    search: typeof query.search === "string" ? query.search.trim() : undefined,
    lastName:
      typeof query.lastName === "string" ? query.lastName.trim() : undefined,
    week: Number.isNaN(week) ? undefined : week,
    ranking,
  };
}
