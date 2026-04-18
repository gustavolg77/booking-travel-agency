import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { AppError } from "../../core/errors/app-error";
import { CreateClientInput, ListClientsFilters } from "./client.types";

const clientSummaryInclude = {
  _count: {
    select: {
      sales: true,
    },
  },
  sales: {
    select: {
      id: true,
      saleNumber: true,
      saleDate: true,
      totalClient: true,
      status: true,
      passengerCount: true,
    },
    orderBy: {
      saleDate: "desc" as const,
    },
    take: 1,
  },
} satisfies Prisma.ClientInclude;

export async function createClient(input: CreateClientInput) {
  const existingClient = await prisma.client.findFirst({
    where: {
      documentType: input.documentType,
      documentNumber: input.documentNumber,
    },
  });

  if (existingClient) {
    throw new AppError("A client with this document already exists", 409);
  }

  return prisma.client.create({
    data: input,
  });
}

export async function listClients(filters: ListClientsFilters) {
  const where: Prisma.ClientWhereInput = {
    ...(filters.search
      ? {
          OR: [
            { firstName: { contains: filters.search, mode: "insensitive" } },
            { lastName: { contains: filters.search, mode: "insensitive" } },
            { documentNumber: { contains: filters.search, mode: "insensitive" } },
            { nit: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.lastName
      ? {
          lastName: {
            contains: filters.lastName,
            mode: "insensitive",
          },
        }
      : {}),
    ...(filters.week
      ? {
          sales: {
            some: {
              items: {
                some: {
                  weekNumber: filters.week,
                },
              },
            },
          },
        }
      : {}),
  };

  const clients = await prisma.client.findMany({
    where,
    include: clientSummaryInclude,
    orderBy:
      filters.ranking === "top"
        ? {
            sales: {
              _count: "desc",
            },
          }
        : {
            createdAt: "desc",
          },
  });

  return clients.map((client) => ({
    ...client,
    salesCount: client._count.sales,
    latestSale: client.sales[0] || null,
  }));
}

export async function findClientByDocument(
  documentType: string,
  documentNumber: string
) {
  const client = await prisma.client.findFirst({
    where: {
      documentType: documentType as never,
      documentNumber,
    },
    include: clientSummaryInclude,
  });

  if (!client) {
    throw new AppError("Client not found", 404);
  }

  return {
    ...client,
    salesCount: client._count.sales,
    latestSale: client.sales[0] || null,
  };
}

export async function getClientById(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      sales: {
        select: {
          id: true,
          saleNumber: true,
          saleDate: true,
          status: true,
          totalClient: true,
          paymentMethod: true,
          passengerCount: true,
          items: {
            select: {
              id: true,
              passengerFirstName: true,
              passengerLastName: true,
              routeOrigin: true,
              routeDestination: true,
              flightDate: true,
              ticketNumber: true,
            },
          },
        },
        orderBy: {
          saleDate: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          sales: true,
        },
      },
    },
  });

  if (!client) {
    throw new AppError("Client not found", 404);
  }

  return {
    ...client,
    salesCount: client._count.sales,
    latestSale: client.sales[0] || null,
  };
}
