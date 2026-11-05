"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  ChevronRight,
  Clapperboard,
  Clock3,
  Megaphone,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS = {
  REQUESTED: { label: "Chat open", className: "bg-slate-100 text-slate-700" },
  SCHEDULED: { label: "Booked", className: "bg-amber-50 text-amber-800" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-800" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-50 text-rose-700" },
};

const MEDIA_STATUS = {
  REQUESTED: { label: "Pending", className: "bg-slate-100 text-slate-700" },
  SCHEDULED: { label: "Confirmed", className: "bg-amber-50 text-amber-800" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-800" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-50 text-rose-700" },
};

const CATEGORIES = [
  { id: "all", label: "All orders", short: "All", href: "/client/bookings" },
  {
    id: "CAMPAIGN",
    label: "Campaign orders",
    short: "Campaign",
    icon: Megaphone,
    href: "/client/bookings?category=CAMPAIGN",
  },
  {
    id: "MEDIA",
    label: "Media orders",
    short: "Media",
    icon: Clapperboard,
    href: "/client/bookings?category=MEDIA",
  },
  {
    id: "TALENT",
    label: "Talent orders",
    short: "Talent",
    icon: Users,
    href: "/client/bookings?category=TALENT",
  },
];

function normalizeCategory(value) {
  if (value === "CAMPAIGN" || value === "MEDIA" || value === "TALENT") return value;
  return "all";
}

const FILTERS = [
  ["all", "All"],
  ["REQUESTED", "Open"],
  ["SCHEDULED", "Booked"],
  ["COMPLETED", "Completed"],
  ["CANCELLED", "Cancelled"],
];

const PAYMENT_ERROR_MESSAGES = {
  missing_reference: "Payment reference was missing.",
  verification_failed: "Payment verification failed.",
  invalid_metadata: "Invalid booking data.",
  user_not_found: "User or talent not found.",
  slot_no_longer_available: "This time slot is no longer available.",
  booking_failed: "Booking could not be completed.",
};

function initials(name) {
  return (
    String(name || "P")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P"
  );
}

function moneyGhs(value) {
  return `GH₵ ${Number(value || 0).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function categoryMeta(category) {
  if (category === "CAMPAIGN") {
    return {
      label: "Campaign order",
      className: "bg-slate-950 text-white",
    };
  }
  if (category === "MEDIA") {
    return {
      label: "Media order",
      className: "bg-sky-50 text-sky-800 ring-1 ring-sky-100",
    };
  }
  return {
    label: "Talent order",
    className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80",
  };
}

function orderHref(order, basePath) {
  if (order.href) return order.href;
  return `${basePath}/${order.id}`;
}

function briefPreview(order, isMedia) {
  if (isMedia) {
    return [order.other.name, order.brief].filter(Boolean).join(" · ");
  }
  if (order.invoice) {
    return `${order.invoice.title || "Invoice"} · ${moneyGhs(order.invoice.amount)}`;
  }
  if (order.brief) return order.brief;
  if (order.agreedAmount != null) return moneyGhs(order.agreedAmount);
  return "Open for session details and chat";
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
  const [filter, setFilter] = useState("all");

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

  const goToCategory = (next) => {
    setCategory(next);
    setFilter("all");
    const href =
      CATEGORIES.find((item) => item.id === next)?.href ||
      (basePath === "/client/bookings"
        ? next === "all"
          ? "/client/bookings"
          : `/client/bookings?category=${next}`
        : basePath);
    if (basePath === "/client/bookings") {
      router.push(href);
    }
  };

  const categories = useMemo(() => {
    const rows = showMedia
      ? CATEGORIES
      : CATEGORIES.filter((item) => item.id !== "MEDIA");
    return rows.map((item) => ({
      ...item,
      count:
        item.id === "all"
          ? orders.length
          : orders.filter((order) => (order.category || "TALENT") === item.id).length,
    }));
  }, [orders, showMedia]);

  const categoryOrders = useMemo(() => {
    if (category === "all") return orders;
    return orders.filter((order) => (order.category || "TALENT") === category);
  }, [orders, category]);

  const statusFilters = useMemo(() => {
    return FILTERS.map(([value, label]) => ({
      value,
      label,
      count:
        value === "all"
          ? categoryOrders.length
          : categoryOrders.filter((order) => order.status === value).length,
    }));
  }, [categoryOrders]);

  const shown = useMemo(() => {
    if (filter === "all") return categoryOrders;
    return categoryOrders.filter((order) => order.status === filter);
  }, [categoryOrders, filter]);

  const dueCount = useMemo(
    () => orders.filter((order) => order.hasOpenInvoice).length,
    [orders]
  );

  const activeCategoryLabel =
    CATEGORIES.find((item) => item.id === category)?.label || "orders";

  return (
    <div className="-m-4 min-h-full bg-[#f4f6fb] p-4 text-slate-900 md:-m-6 md:p-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-950">
              Orders
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
              Your orders
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Track campaign orders, media orders, and talent orders — pay invoices and open chats
              from here.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
            <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200/70">
              {orders.length} total
            </span>
            {dueCount > 0 ? (
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800 ring-1 ring-amber-100">
                {dueCount} invoice{dueCount === 1 ? "" : "s"} due
              </span>
            ) : null}
          </div>
        </div>

        {dueCount > 0 ? (
          <button
            type="button"
            onClick={() => {
              goToCategory("all");
              setFilter("REQUESTED");
            }}
            className="flex w-full items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-left transition hover:bg-amber-50"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
              <Wallet className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-amber-950">
                {dueCount} order{dueCount === 1 ? "" : "s"} waiting for payment
              </span>
              <span className="mt-0.5 block text-xs text-amber-800/80">
                Open an order with an invoice due to pay and confirm the booking.
              </span>
            </span>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-amber-700/70" />
          </button>
        ) : null}

        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-1 sm:min-w-0 sm:flex-wrap">
              {categories.map((item) => {
                const Icon = item.icon;
                const active = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goToCategory(item.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                      active
                        ? "bg-slate-950 text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    )}
                  >
                    {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-80" /> : null}
                    <span className="sm:hidden">{item.short}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                        active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((item) => {
              const active = filter === item.value;
              const empty = item.value !== "all" && item.count === 0;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  disabled={empty}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-slate-950 text-white"
                      : empty
                        ? "cursor-not-allowed bg-white/60 text-slate-300"
                        : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/70 hover:text-slate-950"
                  )}
                >
                  {item.label}
                  <span className={cn("tabular-nums", active ? "text-white/70" : "text-slate-400")}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2.5">
          {shown.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-14 text-center shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Calendar className="h-5 w-5" />
              </span>
              <h2 className="text-base font-semibold text-slate-900">
                {orders.length === 0 ? "No orders yet" : "Nothing here"}
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                {orders.length === 0
                  ? "Book a talent, apply campaign hires, or buy media — they all show up here."
                  : `No ${activeCategoryLabel.toLowerCase()} match this status. Try another filter.`}
              </p>
            </div>
          ) : (
            shown.map((order) => {
              const isMedia = order.category === "MEDIA";
              const statusMap = isMedia ? MEDIA_STATUS : STATUS;
              const status =
                statusMap[order.status] || {
                  label: order.status,
                  className: "bg-slate-100 text-slate-600",
                };
              const cat = categoryMeta(order.category || "TALENT");
              const title = isMedia
                ? order.other.specialty || order.other.name
                : order.other.name;
              const preview = briefPreview(order, isMedia);
              const when = format(new Date(order.startTime), "d MMM yyyy · h:mm a");

              return (
                <Link
                  key={order.id}
                  href={orderHref(order, basePath)}
                  className="group flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)] sm:gap-4 sm:p-4"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700 ring-1 ring-slate-200/80">
                    {order.other.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={order.other.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(title)
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-base font-semibold text-slate-950">
                        {title}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          cat.className
                        )}
                      >
                        {cat.label}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          status.className
                        )}
                      >
                        {status.label}
                      </span>
                      {order.hasOpenInvoice ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-100">
                          <Receipt className="h-3 w-3" />
                          Invoice due
                        </span>
                      ) : null}
                    </span>

                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        {when}
                      </span>
                      <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" />
                      <span className="min-w-0 truncate">{preview}</span>
                    </span>
                  </span>

                  <span className="flex shrink-0 flex-col items-end justify-center gap-2 self-center">
                    {order.hasOpenInvoice ? (
                      <span className="inline-flex items-center rounded-full bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white transition group-hover:bg-slate-800">
                        Pay now
                      </span>
                    ) : (
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-1 ring-slate-200/80 transition group-hover:bg-slate-100 group-hover:text-slate-700">
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    )}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
