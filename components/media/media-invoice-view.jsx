"use client";

import Image from "next/image";
import { format } from "date-fns";
import { CheckCircle2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMediaInvoiceMoney } from "@/lib/media-invoice-format";
import { cn } from "@/lib/utils";

function asLineItems(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function MediaInvoiceView({
  invoice,
  onClose,
  className,
  compact = false,
}) {
  if (!invoice) return null;

  const lineItems = asLineItems(invoice.lineItems);
  const currency = invoice.currency || "GHS";
  const agencyLabel =
    invoice.agency?.agencyName ||
    [...new Set(lineItems.map((item) => item.agencyName).filter(Boolean))].join(
      ", "
    ) ||
    "Media station";
  const paidAt = new Date(invoice.paidAt || invoice.createdAt);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]",
        className
      )}
    >
      {/* Toolbar — hidden when printing */}
      <div className="flex items-center justify-end gap-2 border-b border-slate-100 bg-[#f7f8fc] px-4 py-2.5 print:hidden">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handlePrint}
          className="rounded-full border-slate-200"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download
        </Button>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-500 hover:bg-white hover:text-slate-950"
            aria-label="Close invoice"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className={cn("p-5 sm:p-7", compact && "p-4 sm:p-5")}>
        {/* Brand header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 items-center rounded-xl bg-slate-950 px-3">
              <Image
                src="/icons/Payollar-logo.png"
                alt="Payollar"
                width={132}
                height={36}
                className="h-7 w-auto object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Payollar</p>
              <p className="text-xs text-slate-500">Media booking receipt</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Invoice
            </p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-slate-950">
              {invoice.invoiceNumber}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Paid
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Billed to
            </p>
            <p className="mt-1.5 text-sm font-semibold text-slate-950">
              {invoice.clientName || "Client"}
            </p>
            <p className="text-sm text-slate-500">{invoice.clientEmail}</p>
            {invoice.clientPhone ? (
              <p className="text-sm text-slate-500">{invoice.clientPhone}</p>
            ) : null}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Station / agency
            </p>
            <p className="mt-1.5 text-sm font-semibold text-slate-950">
              {agencyLabel}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {invoice.title}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Payment details
            </p>
            <p className="mt-1.5 text-sm font-semibold text-slate-950">
              {format(paidAt, "MMM d, yyyy")}
            </p>
            <p className="text-xs text-slate-500">{format(paidAt, "h:mm a")}</p>
            <p className="mt-1 break-all text-xs text-slate-400">
              Ref · {invoice.paymentReference}
            </p>
          </div>
        </div>

        {/* Amount highlight */}
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-slate-950 px-5 py-4 text-white">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Amount paid
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {formatMediaInvoiceMoney(invoice.amount, currency)}
            </p>
          </div>
          <p className="text-xs text-slate-400">Settled via Paystack</p>
        </div>

        {/* Line items */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7f8fc] text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold text-right">Qty</th>
                <th className="hidden px-4 py-3 font-semibold text-right sm:table-cell">
                  Unit
                </th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-4 text-sm text-slate-500"
                  >
                    Media booking payment
                  </td>
                </tr>
              ) : (
                lineItems.map((item, index) => (
                  <tr
                    key={item.bookingItemId || `${item.description}-${index}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-900">
                        {item.description}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {[item.agencyName, item.rateCardTitle, item.campaignName]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-600">
                      {item.quantity || 1}
                    </td>
                    <td className="hidden px-4 py-3.5 text-right tabular-nums text-slate-500 sm:table-cell">
                      {formatMediaInvoiceMoney(
                        item.unitAmount ??
                          (item.total || 0) / Math.max(1, item.quantity || 1),
                        currency
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-slate-950">
                      {formatMediaInvoiceMoney(item.total, currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 ml-auto w-full max-w-sm space-y-2 rounded-2xl bg-[#f7f8fc] px-4 py-4 text-sm">
          {invoice.subtotal != null ? (
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="tabular-nums">
                {formatMediaInvoiceMoney(invoice.subtotal, currency)}
              </span>
            </div>
          ) : null}
          {invoice.vat != null && Number(invoice.vat) > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>VAT</span>
              <span className="tabular-nums">
                {formatMediaInvoiceMoney(invoice.vat, currency)}
              </span>
            </div>
          ) : null}
          {invoice.nhilGetfund != null && Number(invoice.nhilGetfund) > 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>NHIL / GETFund</span>
              <span className="tabular-nums">
                {formatMediaInvoiceMoney(invoice.nhilGetfund, currency)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-semibold text-slate-950">
            <span>Total paid</span>
            <span className="tabular-nums text-[#0055ff]">
              {formatMediaInvoiceMoney(invoice.amount, currency)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 items-center rounded-lg bg-slate-950 px-2">
              <Image
                src="/icons/Payollar-logo.png"
                alt=""
                width={88}
                height={24}
                className="h-4 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-500">
              Issued by Payollar · support@payollar.com
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Keep this receipt for your records
          </p>
        </div>
      </div>
    </div>
  );
}
