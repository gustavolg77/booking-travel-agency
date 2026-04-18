import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { AppError } from "../../core/errors/app-error";
import { AuthRequest } from "../../shared/types/auth-request";
import { getDateParts } from "../../shared/utils/date";
import { toMoneyValue, toNumber } from "../../shared/utils/money";
import { generateSaleNumber } from "../../shared/utils/sequence";
import { validateCreateClientInput } from "../clients/client.validators";
import {
  CreateSaleInput,
  CreateSaleItemInput,
  ListPassengersFilters,
  ListSalesFilters,
} from "./sales.types";

function buildSaleWhere(filters: ListSalesFilters): Prisma.SaleWhereInput {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.year || filters.month || filters.week
      ? {
          items: {
            some: {
              ...(filters.year ? { yearNumber: filters.year } : {}),
              ...(filters.month ? { monthNumber: filters.month } : {}),
              ...(filters.week ? { weekNumber: filters.week } : {}),
            },
          },
        }
      : {}),
  };
}

function buildPassengerWhere(
  filters: ListPassengersFilters
): Prisma.SaleItemWhereInput {
  return {
    ...(filters.userId
      ? {
          sale: {
            userId: filters.userId,
          },
        }
      : {}),
    ...(filters.year ? { yearNumber: filters.year } : {}),
    ...(filters.month ? { monthNumber: filters.month } : {}),
    ...(filters.week ? { weekNumber: filters.week } : {}),
  };
}

function normalizeSaleItem(item: CreateSaleItemInput, fallbackDate: Date) {
  const issueDate = item.issueDate ? new Date(item.issueDate) : undefined;
  const flightDate = item.flightDate ? new Date(item.flightDate) : undefined;
  const referenceDate = flightDate || issueDate || fallbackDate;
  const { weekNumber, monthNumber, yearNumber } = getDateParts(referenceDate);
  const amountClient = toNumber(item.amountClient);
  const amountKovar = toNumber(item.amountKovar);
  const commissionAmount = toNumber(item.commissionAmount);
  const netAmount =
    item.netAmount !== undefined
      ? toNumber(item.netAmount)
      : amountClient - commissionAmount;

  return {
    passengerFirstName: item.passengerFirstName,
    passengerLastName: item.passengerLastName,
    passengerDocType: item.passengerDocType,
    passengerDocNumber: item.passengerDocNumber,
    routeOrigin: item.routeOrigin,
    routeDestination: item.routeDestination,
    routeLabel: item.routeLabel || `${item.routeOrigin} - ${item.routeDestination}`,
    issueDate,
    flightDate,
    ticketNumber: item.ticketNumber,
    airline: item.airline,
    amountClient: toMoneyValue(amountClient),
    amountKovar: toMoneyValue(amountKovar),
    netAmount: toMoneyValue(netAmount),
    commissionAmount: toMoneyValue(commissionAmount),
    weekNumber,
    monthNumber,
    yearNumber,
  };
}

async function resolveClient(
  tx: Prisma.TransactionClient,
  input: CreateSaleInput
) {
  if (input.clientId) {
    const existingClient = await tx.client.findUnique({
      where: { id: input.clientId },
    });

    if (!existingClient) {
      throw new AppError("Client not found", 404);
    }

    return existingClient;
  }

  const clientPayload = validateCreateClientInput(input.newClient || {});

  const duplicatedClient = await tx.client.findFirst({
    where: {
      documentType: clientPayload.documentType,
      documentNumber: clientPayload.documentNumber,
    },
  });

  if (duplicatedClient) {
    return duplicatedClient;
  }

  return tx.client.create({
    data: clientPayload,
  });
}

export async function createSale(
  input: CreateSaleInput,
  authUserId: string
) {
  const saleDate = input.saleDate ? new Date(input.saleDate) : new Date();

  const user = await prisma.user.findUnique({
    where: { id: authUserId },
  });

  if (!user || !user.isActive) {
    throw new AppError("Authenticated user is invalid", 401);
  }

  return prisma.$transaction(async (tx) => {
    const client = await resolveClient(tx, input);
    const saleNumber = await generateSaleNumber(tx, saleDate);
    const normalizedItems = input.items.map((item) =>
      normalizeSaleItem(item, saleDate)
    );

    const subtotalClient = normalizedItems.reduce(
      (acc, item) => acc + toNumber(item.amountClient),
      0
    );
    const totalKovar = normalizedItems.reduce(
      (acc, item) => acc + toNumber(item.amountKovar),
      0
    );
    const totalCommission = normalizedItems.reduce(
      (acc, item) => acc + toNumber(item.commissionAmount),
      0
    );

    const sale = await tx.sale.create({
      data: {
        saleNumber,
        saleDate,
        status: input.status,
        clientId: client.id,
        userId: user.id,
        passengerCount: normalizedItems.length,
        subtotalClient: toMoneyValue(subtotalClient),
        totalClient: toMoneyValue(subtotalClient),
        totalKovar: toMoneyValue(totalKovar),
        totalCommission: toMoneyValue(totalCommission),
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        items: {
          create: normalizedItems,
        },
      },
      include: {
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        items: true,
      },
    });

    return sale;
  });
}

export async function listSales(filters: ListSalesFilters) {
  return prisma.sale.findMany({
    where: buildSaleWhere(filters),
    include: {
      client: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      saleDate: "desc",
    },
  });
}

export async function getSaleById(id: string) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      client: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      items: true,
      receipt: true,
      invoice: true,
    },
  });

  if (!sale) {
    throw new AppError("Sale not found", 404);
  }

  return sale;
}

export async function listPassengers(filters: ListPassengersFilters) {
  return prisma.saleItem.findMany({
    where: buildPassengerWhere(filters),
    include: {
      sale: {
        include: {
          client: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        issueDate: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}
