import prisma from "../../config/prisma";
import { AppError } from "../../core/errors/app-error";
import { toMoneyValue } from "../../shared/utils/money";
import { generateReceiptNumber } from "../../shared/utils/sequence";

export async function getReceiptBySaleId(saleId: string) {
  const receipt = await prisma.receipt.findUnique({
    where: { saleId },
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
          items: true,
        },
      },
    },
  });

  if (!receipt) {
    throw new AppError("Receipt not found", 404);
  }

  const agency = await prisma.agencySetting.findFirst();

  return {
    ...receipt,
    agency,
  };
}

export async function createReceiptFromSale(saleId: string) {
  const existingReceipt = await prisma.receipt.findUnique({
    where: { saleId },
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
          items: true,
        },
      },
    },
  });

  if (existingReceipt) {
    const agency = await prisma.agencySetting.findFirst();

    return {
      ...existingReceipt,
      agency,
    };
  }

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
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

    if (!sale) {
      throw new AppError("Sale not found", 404);
    }

    const issuedAt = new Date();
    const receiptNumber = await generateReceiptNumber(tx, issuedAt);

    const receipt = await tx.receipt.create({
      data: {
        saleId: sale.id,
        receiptNumber,
        issuedAt,
        clientName: `${sale.client.firstName} ${sale.client.lastName}`,
        clientNit: sale.client.nit,
        clientBusinessName: sale.client.businessName,
        totalAmount: toMoneyValue(Number(sale.totalClient)),
        paymentMethod: sale.paymentMethod,
      },
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
            items: true,
          },
        },
      },
    });

    const agency = await tx.agencySetting.findFirst();

    return {
      ...receipt,
      agency,
    };
  });
}
