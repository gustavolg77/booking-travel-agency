import {
  DocumentType,
  PaymentMethod,
  SaleStatus,
} from "@prisma/client";
import { CreateClientInput } from "../clients/client.types";

export interface CreateSaleItemInput {
  passengerFirstName: string;
  passengerLastName: string;
  passengerDocType?: DocumentType;
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
}

export interface CreateSaleInput {
  clientId?: string;
  newClient?: Partial<CreateClientInput>;
  saleDate?: string;
  status?: SaleStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  items: CreateSaleItemInput[];
}

export interface ListSalesFilters {
  status?: SaleStatus;
  userId?: string;
  year?: number;
  month?: number;
  week?: number;
}

export interface ListPassengersFilters {
  userId?: string;
  year?: number;
  month?: number;
  week?: number;
}
