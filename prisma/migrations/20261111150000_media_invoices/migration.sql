-- CreateEnum
CREATE TYPE "MediaInvoiceStatus" AS ENUM ('PAID', 'VOID');

-- CreateTable
CREATE TABLE "MediaInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "agencyId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "paymentReference" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "subtotal" DOUBLE PRECISION,
    "vat" DOUBLE PRECISION,
    "nhilGetfund" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "MediaInvoiceStatus" NOT NULL DEFAULT 'PAID',
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lineItems" JSONB NOT NULL,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaInvoice_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "RateCardBookingItem" ADD COLUMN "mediaInvoiceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MediaInvoice_invoiceNumber_key" ON "MediaInvoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MediaInvoice_paymentReference_key" ON "MediaInvoice"("paymentReference");

-- CreateIndex
CREATE INDEX "MediaInvoice_clientId_createdAt_idx" ON "MediaInvoice"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "MediaInvoice_agencyId_createdAt_idx" ON "MediaInvoice"("agencyId", "createdAt");

-- CreateIndex
CREATE INDEX "MediaInvoice_status_createdAt_idx" ON "MediaInvoice"("status", "createdAt");

-- CreateIndex
CREATE INDEX "RateCardBookingItem_mediaInvoiceId_idx" ON "RateCardBookingItem"("mediaInvoiceId");

-- AddForeignKey
ALTER TABLE "RateCardBookingItem" ADD CONSTRAINT "RateCardBookingItem_mediaInvoiceId_fkey" FOREIGN KEY ("mediaInvoiceId") REFERENCES "MediaInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaInvoice" ADD CONSTRAINT "MediaInvoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaInvoice" ADD CONSTRAINT "MediaInvoice_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "MediaAgency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
