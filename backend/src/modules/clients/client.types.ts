import { DocumentType } from "@prisma/client";

export interface CreateClientInput {
  firstName: string;
  lastName: string;
  documentType?: DocumentType;
  documentNumber: string;
  phone?: string;
  email?: string;
  nit?: string;
  businessName?: string;
  notes?: string;
}

export interface ListClientsFilters {
  search?: string;
  lastName?: string;
  week?: number;
  ranking?: "recent" | "top";
}
