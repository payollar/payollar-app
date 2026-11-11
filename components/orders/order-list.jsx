"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Download, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMediaOrderNumber } from "@/lib/media-invoice-format";

const SOURCE_OPTIONS = [
  { id: "all", label: "All" },
  { id: "CAMPAIGN", label: "Campaign creator" },
  { id: "TALENT", label: "Direct booking" },
  { id: "MEDIA", label: "Media booking" },
];

const PAYMENT_ERROR_MESSAGES = {
  missing_reference: "Payment reference was missing.",
  verification_failed: "Payment verification failed.",
  invalid_metadata: "Invalid booking data.",
  user_not_found: "User or talent not found.",
  slot_no_longer_available: "This time slot is no longer available.",
  booking_failed: "Booking could not be completed.",
};

function normalizeCategory(value) {
  if (value === "CAMPAIGN" || value === "MEDIA" || value === "TALENT") return value;
  return "all";
}

function moneyGhs(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return `GH₵${amount.toLocaleString("en-GH", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function orderHref(order, basePath) {
  if (order.href) return order.href;
  return `${basePath}/${order.id}`;
}

function orderSourceLabel(category) {
  if (category === "CAMPAIGN") return "Campaign creator";
  if (category === "MEDIA") return "Media booking";
  return "Direct booking";
}

function orderIdLabel(order) {
  if (order.category === "MEDIA") {
    const invoiceId =
      order.invoice?.id && !String(order.invoice.id).startsWith("media-amount:")
        ? order.invoice.id
        : null;
    return formatMediaOrderNumber({
      id: order.id,
      invoiceId,
      createdAt: order.createdAt || order.startTime,
    });
  }
  const raw = String(order.id || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  const year = new Date(order.createdAt || order.startTime || Date.now()).getFullYear();
  const tail = raw.slice(-4) || "0000";
  return `ORD-${year}-${tail}`;
}

function orderRefLabel(order) {
  if (order.campaignTitle) {
    return String(order.campaignTitle)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((part) => part.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase())
      .filter(Boolean)
      .join("-")
      .slice(0, 18);
  }
  return null;
}

function fulfillmentMeta(order) {
  if (order.status === "CANCELLED") {
    return { label: "Cancelled", className: "bg-rose-50 text-rose-700 ring-rose-100" };
  }
  if (order.hasOpenInvoice || (order.status === "REQUESTED" && !order.paymentRecorded)) {
    return {
      label: "Awaiting payment",
      className: "bg-orange-50 text-orange-800 ring-orange-100",
    };
  }
  if (order.status === "COMPLETED") {
    return {
      label: order.category === "CAMPAIGN" ? "Published" : "Completed",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    };
  }
  if (order.status === "SCHEDULED") {
    return {
      label: "In production",
      className: "bg-[#eef2ff] text-[#0055ff] ring-[#dbeafe]",
    };
  }
  return {
    label: "In production",
    className: "bg-[#eef2ff] text-[#0055ff] ring-[#dbeafe]",
  };
}

function paymentMeta(order) {
  if (order.hasOpenInvoice) {
    return {
      label: "Pending",
      className: "bg-orange-50 text-orange-800 ring-orange-100",
    };
  }
  if (order.paymentRecorded || order.status === "SCHEDULED" || order.status === "COMPLETED") {
    return {
      label: "Recorded",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    };
  }
  if (order.invoice?.status === "PAID") {
    return {
      label: "Recorded",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    };
  }
  return {
    label: "Pending",
    className: "bg-orange-50 text-orange-800 ring-orange-100",
  };
}

function orderAmount(order) {
  if (order.invoice?.amount != null) return Number(order.invoice.amount);
  if (order.agreedAmount != null) return Number(order.agreedAmount);
  return 0;
}

function partyPrimary(order) {
  return order.other?.name || "Payollar user";
}

function partySecondary(order) {
  if (order.campaignTitle) return order.campaignTitle;
  if (order.category === "MEDIA") {
    return order.other?.specialty || order.brief || "Media order";
  }
  if (order.other?.specialty) return order.other.specialty;
  return order.brief || "Direct booking";
}

function formatOrderDate(order) {
  const raw = order.createdAt || order.startTime;
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PartyAvatar({ order }) {
  const name = partyPrimary(order);
  const imageUrl = order.other?.imageUrl;
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8f0ff] to-[#dbeafe] text-sm font-semibold text-[#0055ff] ring-2 ring-white shadow-sm">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function StatusPill({ label, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        className
      )}
    >
      {label}
    </span>
  );
}

function exportOrdersCsv(orders) {
  const header = [
    "Order ID",
    "Reference",
    "Party",
    "Context",
    "Order source",
    "Amount (GHS)",
    "Fulfillment",
    "Payment",
    "Created",
  ];
  const rows = orders.map((order) => [
    orderIdLabel(order),
    orderRefLabel(order) || "",
    partyPrimary(order),
    partySecondary(order),
    orderSourceLabel(order.category || "TALENT"),
    orderAmount(order),
    fulfillmentMeta(order).label,
    paymentMeta(order).label,
    formatOrderDate(order) || "",
  ]);
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function OrderList({
  orders = [],
  basePath,
  paymentSuccess,
  paymentError,
  showMedia = true,
  initialCategory = "all",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = normalizeCategory(
    searchParams?.get("category") || initialCategory
  );
  const [category, setCategory] = useState(categoryFromUrl);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    if (paymentSuccess === "1") {
      toast.success("Payment successful. This booking is confirmed.");
      router.replace(basePath, { scroll: false });
    } else if (paymentError) {
      toast.error(PAYMENT_ERROR_MESSAGES[paymentError] || "Payment or booking failed.");
      router.replace(basePath, { scroll: false });
    }
  }, [paymentSuccess, paymentError, router, basePath]);

  const sourceOptions = useMemo(
    () =>
      showMedia
        ? SOURCE_OPTIONS
        : SOURCE_OPTIONS.filter((item) => item.id !== "MEDIA"),
    [showMedia]
  );

  const goToCategory = (next) => {
    setCategory(next);
    if (basePath !== "/client/bookings") return;
    if (next === "all") router.push("/client/bookings");
    else router.push(`/client/bookings?category=${next}`);
  };

  const counts = useMemo(() => {
    const next = { all: orders.length, CAMPAIGN: 0, TALENT: 0, MEDIA: 0 };
    for (const order of orders) {
      const key = order.category || "TALENT";
      if (next[key] != null) next[key] += 1;
    }
    return next;
  }, [orders]);

  const filtered = useMemo(() => {
    let rows = orders;
    if (category !== "all") {
      rows = rows.filter((order) => (order.category || "TALENT") === category);
    }
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((order) => {
      const hay = [
        orderIdLabel(order),
        orderRefLabel(order),
        partyPrimary(order),
        partySecondary(order),
        orderSourceLabel(order.category || "TALENT"),
        order.brief,
        order.campaignTitle,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [orders, category, query]);

  const filteredTotal = useMemo(
    () => filtered.reduce((sum, order) => sum + (orderAmount(order) || 0), 0),
    [filtered]
  );

  return (
    <div className="-m-4 min-h-full bg-[linear-gradient(180deg,#eef2ff_0%,#f4f6fb_28%,#f8fafc_100%)] p-4 text-slate-900 md:-m-6 md:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
              All orders
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Source type is a filter, not a separate database or workflow.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            One order ledger
          </span>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/90 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search order, creator or campaign"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#93c5fd] focus:ring-2 focus:ring-[#dbeafe]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full border-[#93c5fd] px-4 text-[#0055ff] hover:bg-[#eef2ff] hover:text-[#0046d4]"
                onClick={() => exportOrdersCsv(filtered)}
                disabled={filtered.length === 0}
              >
                <Download className="mr-1.5 h-4 w-4" />
                Export CSV
              </Button>
              <p className="hidden text-xs text-slate-500 xl:block">
                
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {sourceOptions.map((item) => {
              const active = category === item.id;
              const count = counts[item.id] ?? 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToCategory(item.id)}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition",
                    active
                      ? "border-[#0055ff] bg-[#0055ff] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#93c5fd] hover:bg-[#eef2ff] hover:text-[#0046d4]"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-950">{filtered.length}</span>
              {filtered.length === 1 ? " order" : " orders"}
              {query.trim() || category !== "all" ? (
                <span className="text-slate-400"> matching filters</span>
              ) : null}
            </p>
            {filtered.length > 0 ? (
              <p className="text-sm text-slate-500">
                Shown total{" "}
                <span className="font-semibold tabular-nums text-slate-900">
                  {moneyGhs(filteredTotal) || "GH₵0"}
                </span>
              </p>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff]">
                <Search className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">
                {orders.length === 0 ? "No orders yet" : "No matching orders"}
              </h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                {orders.length === 0
                  ? "Book a talent, hire from a campaign, or buy media — they all land in this ledger."
                  : "Try another search or source filter."}
              </p>
              {(query.trim() || category !== "all") && orders.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    goToCategory("all");
                  }}
                  className="mt-4 text-sm font-semibold text-[#0055ff] hover:underline"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="sticky top-0 z-[1] bg-slate-50/95 backdrop-blur">
                      <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        <th className="whitespace-nowrap px-4 py-3 sm:px-5">Order ID</th>
                        <th className="whitespace-nowrap px-4 py-3">
                          Client / Creator / Campaign
                        </th>
                        <th className="whitespace-nowrap px-4 py-3">Order source</th>
                        <th className="whitespace-nowrap px-4 py-3">Amount</th>
                        <th className="whitespace-nowrap px-4 py-3">Fulfillment</th>
                        <th className="whitespace-nowrap px-4 py-3">Payment</th>
                        <th className="whitespace-nowrap px-4 py-3 sm:pr-5">
                          <span className="sr-only">Action</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map((order) => {
                        const fulfillment = fulfillmentMeta(order);
                        const payment = paymentMeta(order);
                        const ref = orderRefLabel(order);
                        const href = orderHref(order, basePath);
                        const amount = moneyGhs(orderAmount(order));
                        const created = formatOrderDate(order);

                        return (
                          <tr
                            key={order.id}
                            className="group bg-white transition-colors hover:bg-[#faf9ff]"
                          >
                            <td className="px-4 py-4 sm:px-5">
                              <Link href={href} className="block">
                                <p className="font-semibold tabular-nums text-slate-950 group-hover:text-[#0055ff]">
                                  {orderIdLabel(order)}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-400">
                                  {ref || created || "—"}
                                </p>
                              </Link>
                            </td>
                            <td className="px-4 py-4">
                              <Link href={href} className="flex min-w-0 items-center gap-3">
                                <PartyAvatar order={order} />
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-slate-950">
                                    {partyPrimary(order)}
                                  </p>
                                  <p className="mt-0.5 max-w-[16rem] truncate text-xs text-slate-500">
                                    {partySecondary(order)}
                                  </p>
                                </div>
                              </Link>
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex rounded-full bg-[#eef2ff] px-2.5 py-1 text-xs font-medium text-[#0055ff] ring-1 ring-inset ring-[#dbeafe]">
                                {orderSourceLabel(order.category || "TALENT")}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 font-semibold tabular-nums text-slate-950">
                              {amount || (
                                <span className="font-medium text-slate-400">Not set</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <StatusPill {...fulfillment} />
                            </td>
                            <td className="px-4 py-4">
                              <StatusPill {...payment} />
                            </td>
                            <td className="px-4 py-4 sm:pr-5">
                              <Link
                                href={href}
                                className="inline-flex items-center gap-1 rounded-full border border-[#93c5fd] px-3 py-1.5 text-xs font-semibold text-[#0055ff] transition group-hover:bg-[#eef2ff]"
                              >
                                View
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <ul className="divide-y divide-slate-100 md:hidden">
                {filtered.map((order) => {
                  const fulfillment = fulfillmentMeta(order);
                  const payment = paymentMeta(order);
                  const href = orderHref(order, basePath);
                  const amount = moneyGhs(orderAmount(order));
                  const created = formatOrderDate(order);
                  const ref = orderRefLabel(order);

                  return (
                    <li key={order.id}>
                      <Link href={href} className="block space-y-3 px-4 py-4 active:bg-slate-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <PartyAvatar order={order} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-950">
                                {partyPrimary(order)}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {partySecondary(order)}
                              </p>
                            </div>
                          </div>
                          <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-950">
                            {amount || "—"}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-medium text-[#0055ff] ring-1 ring-inset ring-[#dbeafe]">
                            {orderSourceLabel(order.category || "TALENT")}
                          </span>
                          <StatusPill {...fulfillment} />
                          <StatusPill {...payment} />
                        </div>

                        <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                          <span className="font-medium tabular-nums text-slate-500">
                            {orderIdLabel(order)}
                            {ref ? ` · ${ref}` : created ? ` · ${created}` : ""}
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#0055ff]">
                            View
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
