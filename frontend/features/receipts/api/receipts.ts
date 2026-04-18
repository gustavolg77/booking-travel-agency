import { apiFetch } from "@/lib/api";
import { Receipt } from "@/types/receipt";

export function createReceipt(saleId: string) {
  return apiFetch<Receipt>("/api/receipts", {
    method: "POST",
    body: JSON.stringify({ saleId }),
  });
}

export function getReceiptBySaleId(saleId: string) {
  return apiFetch<Receipt>(`/api/receipts/sale/${saleId}`);
}
