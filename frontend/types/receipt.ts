import { Sale } from "./sale";

export interface AgencySetting {
  id: string;
  agencyName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
}

export interface Receipt {
  id: string;
  saleId: string;
  receiptNumber: string;
  issuedAt: string;
  clientName: string;
  clientNit: string | null;
  clientBusinessName: string | null;
  totalAmount: string;
  paymentMethod: string | null;
  generatedPdfUrl: string | null;
  createdAt: string;
  sale: Sale;
  agency: AgencySetting | null;
}
