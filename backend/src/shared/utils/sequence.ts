import { Prisma, PrismaClient } from "@prisma/client";
import { formatDateKey, getDateRangeForDay } from "./date";

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

export async function generateSaleNumber(
  prisma: PrismaExecutor,
  saleDate: Date
) {
  const { start, end } = getDateRangeForDay(saleDate);
  const totalForDay = await prisma.sale.count({
    where: {
      saleDate: {
        gte: start,
        lte: end,
      },
    },
  });

  return `SALE-${formatDateKey(saleDate)}-${String(totalForDay + 1).padStart(4, "0")}`;
}

export async function generateReceiptNumber(
  prisma: PrismaExecutor,
  issuedAt: Date
) {
  const { start, end } = getDateRangeForDay(issuedAt);
  const totalForDay = await prisma.receipt.count({
    where: {
      issuedAt: {
        gte: start,
        lte: end,
      },
    },
  });

  return `REC-${formatDateKey(issuedAt)}-${String(totalForDay + 1).padStart(4, "0")}`;
}
