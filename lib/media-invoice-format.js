export const MEDIA_VAT_RATE = 0.15;
export const MEDIA_NHIL_GETFUND_RATE = 0.05;

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function formatMediaInvoiceMoney(value, currency = "GHS") {
  const amount = Number(value) || 0;
  if (currency === "GHS") {
    return `GH₵ ${amount.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${currency} ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Stable order number shared by Media → Invoices and Client → Orders.
 * Prefer the paid invoice id so both surfaces show the same ORD-… value.
 */
export function formatMediaOrderNumber({
  id,
  invoiceId,
  createdAt,
  paymentReference,
} = {}) {
  const normalized = invoiceId
    ? `media:invoice:${invoiceId}`
    : String(id || paymentReference || "");
  const raw = normalized
    .replace(/^media:/i, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  const year = new Date(createdAt || Date.now()).getFullYear();
  const tail = raw.slice(-4) || "0000";
  return `ORD-${year}-${tail}`;
}

/**
 * Prefer stored tax fields; otherwise derive Ghana media taxes
 * (VAT 15% + NHIL/GETFund 5%) from the paid total.
 */
export function resolveMediaInvoiceTaxes(invoice) {
  const amount = roundMoney(invoice?.amount);
  let subtotal =
    invoice?.subtotal != null ? roundMoney(invoice.subtotal) : null;
  let vat = invoice?.vat != null ? roundMoney(invoice.vat) : null;
  let nhilGetfund =
    invoice?.nhilGetfund != null ? roundMoney(invoice.nhilGetfund) : null;

  const taxSum = (vat || 0) + (nhilGetfund || 0);
  const needsDerive =
    amount > 0 && (subtotal == null || taxSum <= 0 || subtotal <= 0);

  if (needsDerive) {
    const factor = 1 + MEDIA_VAT_RATE + MEDIA_NHIL_GETFUND_RATE;
    subtotal = roundMoney(amount / factor);
    vat = roundMoney(subtotal * MEDIA_VAT_RATE);
    nhilGetfund = roundMoney(amount - subtotal - vat);
  }

  return {
    subtotal: subtotal ?? 0,
    vat: vat ?? 0,
    nhilGetfund: nhilGetfund ?? 0,
    amount,
  };
}
