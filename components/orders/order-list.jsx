"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { CreatorPageShell } from "@/app/(main)/creator/_components/creator-page-shell";

const STATUS = {
  REQUESTED: { label: "Chat open", className: "bg-[#e8f0ff] text-[#0b3db8]" },
  SCHEDULED: { label: "Booked", className: "bg-amber-50 text-amber-700" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-50 text-rose-600" },
};

const PAYMENT_ERROR_MESSAGES = {
  missing_reference: "Payment reference was missing.",
  verification_failed: "Payment verification failed.",
  invalid_metadata: "Invalid booking data.",
  user_not_found: "User or talent not found.",
  slot_no_longer_available: "This time slot is no longer available.",
  booking_failed: "Booking could not be completed.",
};

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
    <CreatorPageShell
      eyebrow="Orders"
      title="Orders"
      description="Sessions between you and the other person on a booking."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["REQUESTED", "Chat open"],
          ["SCHEDULED", "Booked"],
          ["COMPLETED", "Completed"],
          ["CANCELLED", "Cancelled"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === value ? "bg-[#0055ff] text-white" : "bg-white text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        {shown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="px-5 py-3 font-medium">With</th>
                  <th className="px-3 py-3 font-medium">Session</th>
                  <th className="px-3 py-3 font-medium">Brief</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {shown.map((order) => {
                  const status = STATUS[order.status] || {
                    label: order.status,
                    className: "bg-slate-100 text-slate-600",
                  };
                  return (
                    <tr key={order.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{order.other.name}</p>
                        {order.other.specialty ? (
                          <p className="text-xs text-slate-400">{order.other.specialty}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {format(new Date(order.startTime), "d MMM yyyy · h:mm a")}
                      </td>
                      <td className="max-w-[240px] truncate px-3 py-3 text-slate-500">
                        {order.brief || "No brief"}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`${basePath}/${order.id}`} className="font-medium text-[#0055ff] hover:text-[#003ecc]">
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-14 text-center text-sm text-slate-400">
            <Calendar className="mx-auto mb-2 h-7 w-7 text-slate-300" />
            {orders.length === 0 ? "No orders yet." : "Nothing in this filter."}
          </div>
        )}
      </section>
    </CreatorPageShell>
  );
}
