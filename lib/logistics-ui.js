import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Package,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";

export const LOGISTICS_STATUS = {
  DRAFT: {
    label: "Awaiting dispatch",
    clientLabel: "Draft dispatch",
    creatorLabel: "Waiting on brand",
    className: "border-slate-200 bg-slate-100 text-slate-700",
    icon: Package,
  },
  DISPATCHED: {
    label: "Dispatched",
    clientLabel: "In transit",
    creatorLabel: "Awaiting your confirmation",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Truck,
  },
  RECEIVED_OK: {
    label: "Received safely",
    clientLabel: "Confirmed safe",
    creatorLabel: "Received safely",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: PackageCheck,
  },
  PROBLEM: {
    label: "Delivery issue",
    clientLabel: "Open delivery issue",
    creatorLabel: "Problem reported",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: AlertTriangle,
  },
  RETURN_REQUESTED: {
    label: "Return requested",
    clientLabel: "Return pending ack",
    creatorLabel: "Return requested",
    className: "border-orange-200 bg-orange-50 text-orange-800",
    icon: RotateCcw,
  },
  RETURN_ACKED: {
    label: "Return acknowledged",
    clientLabel: "Return acknowledged",
    creatorLabel: "Return acknowledged",
    className: "border-sky-200 bg-sky-50 text-sky-800",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Closed",
    clientLabel: "Closed",
    creatorLabel: "Closed",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: Clock3,
  },
};

export function logisticsStatusMeta(status) {
  return LOGISTICS_STATUS[status] || LOGISTICS_STATUS.DRAFT;
}

/** Progress along brand → creator for list route rails (0–100). */
export function logisticsProgress(shipment) {
  const status = shipment?.status || "DRAFT";
  if (status === "DRAFT") return { pct: 8, stage: "upcoming" };
  if (status === "DISPATCHED") return { pct: 55, stage: "transit" };
  if (status === "PROBLEM") return { pct: 70, stage: "issue" };
  if (status === "RETURN_REQUESTED") return { pct: 78, stage: "return" };
  if (status === "RETURN_ACKED" || status === "CLOSED") return { pct: 100, stage: "done" };
  if (status === "RECEIVED_OK") return { pct: 100, stage: "done" };
  return { pct: 20, stage: "upcoming" };
}

export function logisticsEndpoints(shipment, perspective = "client") {
  const brand =
    shipment?.application?.campaign?.brand ||
    shipment?.client?.name ||
    (shipment?.appointmentId ? "Client" : "Brand");
  const creator = shipment?.creator?.name || "Creator";
  if (perspective === "creator") {
    return { from: brand, to: "You" };
  }
  return { from: "You", to: creator };
}

export function logisticsShortId(id) {
  if (!id) return "—";
  return `#${String(id).toUpperCase().slice(0, 8)}`;
}

export function logisticsDispositionMeta(disposition) {
  if (disposition === "RETURNABLE") {
    return {
      id: "RETURNABLE",
      label: "Returnable",
      shortLabel: "Must return",
      detail: "Brand expects this kit back",
      className: "border-orange-200 bg-orange-50 text-orange-800",
    };
  }
  return {
    id: "GIFT",
    label: "Gift",
    shortLabel: "Gift · keep it",
    detail: "Creator keeps the kit — no return expected",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
}

export function logisticsTimeline(shipment) {
  const isGift = shipment?.disposition !== "RETURNABLE";
  const steps = [
    {
      id: "dispatch",
      label: "Brand dispatch",
      done: Boolean(shipment?.dispatchedAt) || ["DISPATCHED", "RECEIVED_OK", "PROBLEM", "RETURN_REQUESTED", "RETURN_ACKED", "CLOSED"].includes(shipment?.status),
      detail: shipment?.dispatchedAt
        ? "Recorded"
        : "Not recorded yet",
    },
    {
      id: "courier",
      label: "Courier handoff",
      done: Boolean(shipment?.dispatchedAt),
      detail: shipment?.courier
        ? `Handled externally · ${[shipment.courier, shipment.riderNumber]
            .filter(Boolean)
            .join(" · ")}`
        : "Handled externally",
    },
    {
      id: "verify",
      label: "Creator verification",
      done: ["RECEIVED_OK", "PROBLEM", "RETURN_REQUESTED", "RETURN_ACKED", "CLOSED"].includes(
        shipment?.status
      ),
      detail:
        shipment?.status === "RECEIVED_OK" || shipment?.status === "RETURN_REQUESTED" || shipment?.status === "RETURN_ACKED" || shipment?.status === "CLOSED"
          ? "Confirmed"
          : shipment?.status === "PROBLEM"
            ? "Problem reported"
            : shipment?.status === "DISPATCHED"
              ? "Awaiting creator"
              : "Not started",
    },
    {
      id: "return",
      label: "Return verification",
      done: isGift
        ? true
        : ["RETURN_ACKED", "CLOSED"].includes(shipment?.status) && Boolean(shipment?.returnAckedAt),
      detail: isGift
        ? "Not required · gift"
        : shipment?.status === "RETURN_ACKED" || shipment?.returnAckedAt
          ? "Acknowledged"
          : shipment?.status === "RETURN_REQUESTED"
            ? "Awaiting brand"
            : "Expected back",
    },
  ];
  return steps;
}

export function parseLogisticsEvents(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((event) => ({
      id: String(event?.id || ""),
      at: event?.at || null,
      actorId: event?.actorId || null,
      actorRole: event?.actorRole || null,
      type: event?.type || "NOTE",
      message: String(event?.message || "").trim(),
      meta: event?.meta && typeof event.meta === "object" ? event.meta : null,
    }))
    .filter((event) => event.message);
}
