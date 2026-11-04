-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "agreedAmount" DOUBLE PRECISION;

-- CreateEnum
CREATE TYPE "BookingMessageKind" AS ENUM ('TEXT', 'INVOICE');

-- CreateEnum
CREATE TYPE "BookingInvoiceStatus" AS ENUM ('SENT', 'PAID', 'CANCELLED', 'SUPERSEDED');

-- AlterTable
ALTER TABLE "BookingMessage" ADD COLUMN "kind" "BookingMessageKind" NOT NULL DEFAULT 'TEXT';

-- CreateTable
CREATE TABLE "BookingInvoice" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "lineItems" JSONB,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "status" "BookingInvoiceStatus" NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingInvoice_messageId_key" ON "BookingInvoice"("messageId");

-- CreateIndex
CREATE INDEX "BookingInvoice_appointmentId_status_createdAt_idx" ON "BookingInvoice"("appointmentId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "BookingInvoice_conversationId_createdAt_idx" ON "BookingInvoice"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "BookingInvoice" ADD CONSTRAINT "BookingInvoice_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingInvoice" ADD CONSTRAINT "BookingInvoice_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "BookingConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingInvoice" ADD CONSTRAINT "BookingInvoice_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "BookingMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingInvoice" ADD CONSTRAINT "BookingInvoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
