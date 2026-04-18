-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'QR', 'CARD', 'MIXED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CI', 'PASSPORT', 'NIT', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL DEFAULT 'CI',
    "documentNumber" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "nit" TEXT,
    "businessName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "saleNumber" TEXT NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SaleStatus" NOT NULL DEFAULT 'DRAFT',
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passengerCount" INTEGER NOT NULL DEFAULT 0,
    "subtotalClient" DECIMAL(12,2) NOT NULL,
    "totalClient" DECIMAL(12,2) NOT NULL,
    "totalKovar" DECIMAL(12,2) NOT NULL,
    "totalCommission" DECIMAL(12,2) NOT NULL,
    "paymentMethod" "PaymentMethod",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "passengerFirstName" TEXT NOT NULL,
    "passengerLastName" TEXT NOT NULL,
    "passengerDocType" "DocumentType",
    "passengerDocNumber" TEXT,
    "routeOrigin" TEXT NOT NULL,
    "routeDestination" TEXT NOT NULL,
    "routeLabel" TEXT,
    "issueDate" TIMESTAMP(3),
    "flightDate" TIMESTAMP(3),
    "ticketNumber" TEXT,
    "airline" TEXT,
    "amountClient" DECIMAL(12,2) NOT NULL,
    "amountKovar" DECIMAL(12,2) NOT NULL,
    "netAmount" DECIMAL(12,2) NOT NULL,
    "commissionAmount" DECIMAL(12,2) NOT NULL,
    "weekNumber" INTEGER,
    "monthNumber" INTEGER,
    "yearNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientName" TEXT NOT NULL,
    "clientNit" TEXT,
    "clientBusinessName" TEXT,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" "PaymentMethod",
    "generatedPdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nit" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "cuf" TEXT,
    "generatedPdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencySetting" (
    "id" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencySetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Client_lastName_idx" ON "Client"("lastName");

-- CreateIndex
CREATE INDEX "Client_nit_idx" ON "Client"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "Client_documentType_documentNumber_key" ON "Client"("documentType", "documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_saleNumber_key" ON "Sale"("saleNumber");

-- CreateIndex
CREATE INDEX "Sale_saleDate_idx" ON "Sale"("saleDate");

-- CreateIndex
CREATE INDEX "Sale_status_idx" ON "Sale"("status");

-- CreateIndex
CREATE INDEX "Sale_clientId_idx" ON "Sale"("clientId");

-- CreateIndex
CREATE INDEX "Sale_userId_idx" ON "Sale"("userId");

-- CreateIndex
CREATE INDEX "Sale_saleDate_userId_idx" ON "Sale"("saleDate", "userId");

-- CreateIndex
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");

-- CreateIndex
CREATE INDEX "SaleItem_flightDate_idx" ON "SaleItem"("flightDate");

-- CreateIndex
CREATE INDEX "SaleItem_issueDate_idx" ON "SaleItem"("issueDate");

-- CreateIndex
CREATE INDEX "SaleItem_ticketNumber_idx" ON "SaleItem"("ticketNumber");

-- CreateIndex
CREATE INDEX "SaleItem_passengerLastName_idx" ON "SaleItem"("passengerLastName");

-- CreateIndex
CREATE INDEX "SaleItem_yearNumber_monthNumber_weekNumber_idx" ON "SaleItem"("yearNumber", "monthNumber", "weekNumber");

-- CreateIndex
CREATE INDEX "SaleItem_routeOrigin_routeDestination_idx" ON "SaleItem"("routeOrigin", "routeDestination");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_saleId_key" ON "Receipt"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");

-- CreateIndex
CREATE INDEX "Receipt_issuedAt_idx" ON "Receipt"("issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_saleId_key" ON "Invoice"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_issuedAt_idx" ON "Invoice"("issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_nit_idx" ON "Invoice"("nit");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
