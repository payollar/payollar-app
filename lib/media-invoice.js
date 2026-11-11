import { db } from "@/lib/prisma";
import { sendMediaInvoiceEmail } from "@/lib/email";
import { resolveMediaInvoiceTaxes } from "@/lib/media-invoice-format";
export { formatMediaInvoiceMoney } from "@/lib/media-invoice-format";

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

async function nextInvoiceNumber() {
  const stamp = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const prefix = `MI-${stamp}-`;
  const latest = await db.mediaInvoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
  const next = latest?.invoiceNumber
    ? Number(latest.invoiceNumber.slice(prefix.length)) + 1
    : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

/**
 * Create a paid media invoice after Paystack success (idempotent on paymentReference).
 */
export async function createPaidMediaInvoice({
  paymentReference,
  clientId,
  clientName,
  clientEmail,
  clientPhone = null,
  amount,
  currency = "GHS",
  source,
  title,
  lineItems = [],
  bookingItemIds = [],
  subtotal = null,
  vat = null,
  nhilGetfund = null,
  notes = null,
  paidAt = new Date(),
}) {
  if (!paymentReference || !clientId) {
    throw new Error("paymentReference and clientId are required");
  }

  const account = await db.user.findUnique({
    where: { id: clientId },
    select: { email: true, name: true },
  });
  const receiptName = clientName || account?.name || "";
  // Always deliver / store against the Payollar account email when available.
  const receiptEmail = account?.email || clientEmail || "";

  const existing = await db.mediaInvoice.findUnique({
    where: { paymentReference },
  });
  if (existing) {
    // Retry receipt if a previous attempt failed (e.g. unverified domain).
    try {
      await sendMediaInvoiceEmail({
        ...existing,
        clientName: existing.clientName || receiptName,
        clientEmail: existing.clientEmail || receiptEmail,
      });
    } catch (error) {
      console.error("Media invoice email retry failed:", error);
    }
    return existing;
  }

  const agencyIds = [
    ...new Set(
      lineItems.map((item) => item.agencyId).filter(Boolean)
    ),
  ];
  const agencyId = agencyIds.length === 1 ? agencyIds[0] : null;

  const paidAmount = roundMoney(amount);
  const taxes = resolveMediaInvoiceTaxes({
    amount: paidAmount,
    subtotal,
    vat,
    nhilGetfund,
  });

  const invoice = await db.mediaInvoice.create({
    data: {
      invoiceNumber: await nextInvoiceNumber(),
      clientId,
      agencyId,
      clientName: receiptName,
      clientEmail: receiptEmail,
      clientPhone: clientPhone || null,
      paymentReference,
      currency,
      subtotal: taxes.subtotal,
      vat: taxes.vat,
      nhilGetfund: taxes.nhilGetfund,
      amount: paidAmount,
      status: "PAID",
      source,
      title: title || "Media booking receipt",
      lineItems,
      notes,
      paidAt,
    },
  });

  if (bookingItemIds.length > 0) {
    const bookingUpdate = { mediaInvoiceId: invoice.id };
    if (receiptEmail) bookingUpdate.clientEmail = receiptEmail;
    if (receiptName) bookingUpdate.clientName = receiptName;
    await db.rateCardBookingItem.updateMany({
      where: { id: { in: bookingItemIds } },
      data: bookingUpdate,
    });
  }

  // Email should not block booking confirmation if Resend fails.
  try {
    const emailed = await sendMediaInvoiceEmail(invoice);
    if (!emailed?.success) {
      console.error(
        "Media invoice created but email was not delivered:",
        emailed?.error || "unknown error",
        { invoiceNumber: invoice.invoiceNumber, to: invoice.clientEmail }
      );
    }
  } catch (error) {
    console.error("Media invoice email failed:", error);
  }

  return invoice;
}

export function lineItemFromBooking(booking, agencyName = null) {
  return {
    bookingItemId: booking.id,
    description:
      booking.snapshotDescription ||
      booking.mediaCampaignName ||
      "Media airtime",
    quantity: booking.quantity || 1,
    unitAmount: roundMoney(
      booking.snapshotPrice ??
        (booking.totalAmount != null && booking.quantity
          ? booking.totalAmount / booking.quantity
          : booking.totalAmount) ??
        0
    ),
    total: roundMoney(booking.totalAmount || 0),
    agencyId: booking.agencyId,
    agencyName: agencyName || booking.agency?.agencyName || null,
    rateCardTitle: booking.rateCard?.title || null,
    campaignName: booking.mediaCampaignName || null,
  };
}
