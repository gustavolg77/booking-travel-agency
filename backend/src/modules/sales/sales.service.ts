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
  WeeklyReportFilters,
} from "./sales.types";

function buildSaleWhere(filters: ListSalesFilters): Prisma.SaleWhereInput {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.client
      ? {
          client: {
            OR: [
              { firstName: { contains: filters.client, mode: "insensitive" } },
              { lastName: { contains: filters.client, mode: "insensitive" } },
              {
                documentNumber: {
                  contains: filters.client,
                  mode: "insensitive",
                },
              },
            ],
          },
        }
      : {}),
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

export async function getWeeklyReport(filters: WeeklyReportFilters) {
  const now = new Date();
  const selectedYear = filters.year || now.getFullYear();
  const selectedWeek = filters.week || getDateParts(now).weekNumber;

  const sales = await prisma.sale.findMany({
    where: {
      ...(filters.userId ? { userId: filters.userId } : {}),
      items: {
        some: {
          yearNumber: selectedYear,
          weekNumber: selectedWeek,
        },
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
    orderBy: {
      saleDate: "desc",
    },
  });

  const salesCount = sales.length;
  const passengersCount = sales.reduce(
    (acc, sale) => acc + sale.passengerCount,
    0
  );
  const revenue = sales.reduce((acc, sale) => acc + Number(sale.totalClient), 0);
  const kovar = sales.reduce((acc, sale) => acc + Number(sale.totalKovar), 0);
  const commission = sales.reduce(
    (acc, sale) => acc + Number(sale.totalCommission),
    0
  );

  const byAgent = new Map<
    string,
    {
      userId: string;
      name: string;
      salesCount: number;
      passengersCount: number;
      revenue: number;
      commission: number;
    }
  >();

  const topDestinations = new Map<string, number>();

  sales.forEach((sale) => {
    const currentAgent = byAgent.get(sale.user.id) || {
      userId: sale.user.id,
      name: sale.user.name,
      salesCount: 0,
      passengersCount: 0,
      revenue: 0,
      commission: 0,
    };

    currentAgent.salesCount += 1;
    currentAgent.passengersCount += sale.passengerCount;
    currentAgent.revenue += Number(sale.totalClient);
    currentAgent.commission += Number(sale.totalCommission);
    byAgent.set(sale.user.id, currentAgent);

    sale.items.forEach((item) => {
      const route = `${item.routeOrigin} → ${item.routeDestination}`;
      topDestinations.set(route, (topDestinations.get(route) || 0) + 1);
    });
  });

  return {
    week: selectedWeek,
    year: selectedYear,
    salesCount,
    passengersCount,
    revenue,
    kovar,
    commission,
    salesByAgent: Array.from(byAgent.values()).sort(
      (a, b) => b.revenue - a.revenue
    ),
    topDestinations: Array.from(topDestinations.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    recentSales: sales.slice(0, 8),
  };
}
