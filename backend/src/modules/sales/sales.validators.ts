import { PaymentMethod, SaleStatus } from "@prisma/client";
import { AppError } from "../../core/errors/app-error";
import {
  CreateSaleInput,
  CreateSaleItemInput,
  ListPassengersFilters,
  ListSalesFilters,
  WeeklyReportFilters,
} from "./sales.types";

function requiredText(value: unknown, fieldName: string) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  return text;
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function validateSaleItem(item: Partial<CreateSaleItemInput>) {
  return {
    passengerFirstName: requiredText(item.passengerFirstName, "Passenger first name"),
    passengerLastName: requiredText(item.passengerLastName, "Passenger last name"),
    passengerDocType: item.passengerDocType,
    passengerDocNumber: optionalText(item.passengerDocNumber),
    routeOrigin: requiredText(item.routeOrigin, "Route origin"),
    routeDestination: requiredText(item.routeDestination, "Route destination"),
    routeLabel: optionalText(item.routeLabel),
    issueDate: optionalText(item.issueDate),
    flightDate: optionalText(item.flightDate),
    ticketNumber: optionalText(item.ticketNumber),
    airline: optionalText(item.airline),
    amountClient: item.amountClient ?? 0,
    amountKovar: item.amountKovar ?? 0,
    netAmount: item.netAmount,
    commissionAmount: item.commissionAmount ?? 0,
  };
}

export function validateCreateSaleInput(
  input: Partial<CreateSaleInput>
): CreateSaleInput {
  if (!input.clientId && !input.newClient) {
    throw new AppError("A clientId or newClient payload is required", 400);
  }

  if (!input.items || input.items.length === 0) {
    throw new AppError("At least one sale item is required", 400);
  }

  return {
    clientId: optionalText(input.clientId),
    newClient: input.newClient,
    saleDate: optionalText(input.saleDate),
    status:
      input.status && Object.values(SaleStatus).includes(input.status)
        ? input.status
        : SaleStatus.CONFIRMED,
    paymentMethod:
      input.paymentMethod &&
      Object.values(PaymentMethod).includes(input.paymentMethod)
        ? input.paymentMethod
        : undefined,
    notes: optionalText(input.notes),
    items: input.items.map(validateSaleItem),
  };
}

function parseNumber(value: unknown) {
  if (typeof value !== "string" || !value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function validateListSalesFilters(
  query: Record<string, unknown>
): ListSalesFilters {
  return {
    status:
      typeof query.status === "string" &&
      Object.values(SaleStatus).includes(query.status as SaleStatus)
        ? (query.status as SaleStatus)
        : undefined,
    userId: typeof query.userId === "string" ? query.userId : undefined,
    client: typeof query.client === "string" ? query.client.trim() : undefined,
    year: parseNumber(query.year),
    month: parseNumber(query.month),
    week: parseNumber(query.week),
  };
}

export function validateListPassengersFilters(
  query: Record<string, unknown>
): ListPassengersFilters {
  return {
    userId: typeof query.userId === "string" ? query.userId : undefined,
    year: parseNumber(query.year),
    month: parseNumber(query.month),
    week: parseNumber(query.week),
  };
}

export function validateWeeklyReportFilters(
  query: Record<string, unknown>
): WeeklyReportFilters {
  return {
    userId: typeof query.userId === "string" ? query.userId : undefined,
    year: parseNumber(query.year),
    week: parseNumber(query.week),
  };
}
