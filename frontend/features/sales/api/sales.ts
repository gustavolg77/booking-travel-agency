import { apiFetch } from "@/lib/api";
import { toQueryString } from "@/lib/query-string";
import {
  CreateSalePayload,
  PassengerRecord,
  Sale,
  WeeklyReport,
} from "@/types/sale";

export function listSales(filters: {
  status?: string;
  userId?: string;
  client?: string;
  year?: number;
  month?: number;
  week?: number;
}) {
  return apiFetch<Sale[]>(`/api/sales${toQueryString(filters)}`);
}

export function createSale(payload: CreateSalePayload) {
  return apiFetch<Sale>("/api/sales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listPassengers(filters: {
  userId?: string;
  year?: number;
  month?: number;
  week?: number;
}) {
  return apiFetch<PassengerRecord[]>(
    `/api/sales/passengers${toQueryString(filters)}`
  );
}

export function getSaleById(id: string) {
  return apiFetch<Sale>(`/api/sales/${id}`);
}

export function getWeeklyReport(filters: {
  userId?: string;
  year?: number;
  week?: number;
}) {
  return apiFetch<WeeklyReport>(
    `/api/sales/weekly-report${toQueryString(filters)}`
  );
}
