"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const STATUS = {
  REQUESTED: { label: "Chat open", className: "bg-[#e8f0ff] text-[#0b3db8]" },
  SCHEDULED: { label: "Booked", className: "bg-amber-50 text-amber-700" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-50 text-rose-600" },
};

const FILTERS = [
  ["all", "All"],
  ["REQUESTED", "Chat open"],
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

export function OrderList({ orders = [], basePath, paymentSuccess, paymentError }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (paymentSuccess === "1") {
      toast.success("Payment successful. This booking is confirmed.");
      router.replace(basePath, { scroll: false });
    } else if (paymentError) {
      toast.error(PAYMENT_ERROR_MESSAGES[paymentError] || "Payment or booking failed.");
      router.replace(basePath, { scroll: false });
    }
  }, [paymentSuccess, paymentError, router, basePath]);

  const shown = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  return (
    <div className="-m-4 min-h-full bg-[#f7f8fc] p-4 text-slate-900 md:-m-6 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#0055ff]">Orders</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Orders</h1>
      <p className="mt-1 text-sm text-slate-500">Open a booking to see the session, brief, timeline, and chat.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === value ? "bg-[#0055ff] text-white" : "bg-white text-slate-600 shadow-sm"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {shown.length === 0 ? (
          <div className="rounded-[22px] bg-white px-5 py-16 text-center text-sm text-slate-400 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <Calendar className="mx-auto mb-2 h-7 w-7 text-slate-300" />
            {orders.length === 0 ? "No orders yet." : "Nothing in this filter."}
          </div>
        ) : (
          shown.map((order) => {
            const status = STATUS[order.status] || { label: order.status, className: "bg-slate-100 text-slate-600" };
            return (
              <Link
                key={order.id}
                href={`${basePath}/${order.id}`}
                className="flex items-center gap-4 rounded-[22px] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f0ff] text-sm font-semibold text-[#0b3db8]">
                  {order.other.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={order.other.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(order.other.name)
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-950">{order.other.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-slate-500">
                    {format(new Date(order.startTime), "d MMM yyyy · h:mm a")}
                    {order.brief ? ` · ${order.brief}` : ""}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
