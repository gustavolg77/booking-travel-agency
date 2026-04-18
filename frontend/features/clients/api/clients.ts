import { apiFetch } from "@/lib/api";
import { toQueryString } from "@/lib/query-string";
import { ClientDetail, ClientListItem } from "@/types/client";

export function listClients(filters: {
  search?: string;
  lastName?: string;
  week?: number;
  ranking?: "recent" | "top";
}) {
  return apiFetch<ClientListItem[]>(
    `/api/clients${toQueryString(filters)}`
  );
}

export function getClientById(id: string) {
  return apiFetch<ClientDetail>(`/api/clients/${id}`);
}

export function lookupClientByDocument(documentType: string, documentNumber: string) {
  return apiFetch<ClientListItem>(
    `/api/clients/lookup${toQueryString({ documentType, documentNumber })}`
  );
}
