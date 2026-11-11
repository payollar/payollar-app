export function statusMeta(status) {
  if (status === "PENDING") {
    return {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }
  if (status === "CONFIRMED") {
    return {
      label: "Confirmed",
      className: "border-slate-200 bg-slate-100 text-slate-700",
    };
  }
  if (status === "COMPLETED") {
    return {
      label: "Completed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    };
  }
  if (status === "CANCELLED") {
    return {
      label: "Cancelled",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }
  return {
    label: status,
    className: "border-slate-200 bg-slate-50 text-slate-700",
  };
}

export function money(value) {
  return `₵${Number(value).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Negotiate only for unpaid pending quotes — hide once paid/confirmed. */
export function canNegotiate(booking) {
  if (booking.status !== "PENDING") return false;
  if (booking.mediaInvoice) return false;
  if (booking.totalAmount == null || Number(booking.totalAmount) <= 0) {
    return false;
  }
  return true;
}

export function initials(name) {
  return String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
