import { Client } from "./client";
import { AuthUser } from "./auth";

export type PaymentMethod = "CASH" | "TRANSFER" | "QR" | "CARD" | "MIXED";
export type SaleStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface SaleItem {
  id: string;
  passengerFirstName: string;
  passengerLastName: string;
  passengerDocType: string | null;
  passengerDocNumber: string | null;
  routeOrigin: string;
  routeDestination: string;
  routeLabel: string | null;
  issueDate: string | null;
  flightDate: string | null;
  ticketNumber: string | null;
  airline: string | null;
  amountClient: string;
  amountKovar: string;
  netAmount: string;
  commissionAmount: string;
  weekNumber: number | null;
  monthNumber: number | null;
  yearNumber: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  saleDate: string;
  status: SaleStatus;
  passengerCount: number;
  subtotalClient: string;
  totalClient: string;
  totalKovar: string;
  totalCommission: string;
  paymentMethod: PaymentMethod | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  client: Client;
  user: AuthUser;
  items?: SaleItem[];
  _count?: {
    items: number;
  };
}

export interface PassengerRecord extends SaleItem {
  sale: Sale;
}

export interface CreateSalePayload {
  clientId?: string;
  newClient?: {
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    phone?: string;
    email?: string;
    nit?: string;
    businessName?: string;
    notes?: string;
  };
  saleDate?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  items: Array<{
    passengerFirstName: string;
    passengerLastName: string;
    passengerDocType?: string;
    passengerDocNumber?: string;
    routeOrigin: string;
    routeDestination: string;
    routeLabel?: string;
    issueDate?: string;
    flightDate?: string;
    ticketNumber?: string;
    airline?: string;
    amountClient: number | string;
    amountKovar: number | string;
    netAmount?: number | string;
    commissionAmount: number | string;
  }>;
}

export interface WeeklyReport {
  week: number;
  year: number;
  salesCount: number;
  passengersCount: number;
  revenue: number;
  kovar: number;
  commission: number;
  salesByAgent: Array<{
    userId: string;
    name: string;
    salesCount: number;
    passengersCount: number;
    revenue: number;
    commission: number;
  }>;
  topDestinations: Array<{
    route: string;
    count: number;
  }>;
  recentSales: Sale[];
}
