"use client";

import { LOGISTICS_DEMO_SHIPMENTS } from "@/lib/logistics-demo";
import { LogisticsMasterDetail } from "../../_components/logistics-console";
import { CreatorPageShell } from "./creator-page-shell";

const FILTERS = [
  { id: "all", label: "All kits" },
  { id: "DISPATCHED", label: "Awaiting you" },
  { id: "DRAFT", label: "Upcoming" },
  { id: "RECEIVED_OK", label: "Confirmed" },
  {
    id: "PROBLEM",
    label: "Issues",
    match: (row) => row.status === "PROBLEM",
  },
  {
    id: "RETURN_REQUESTED",
    label: "Returns",
    match: (row) => ["RETURN_REQUESTED", "RETURN_ACKED"].includes(row.status),
  },
];

export function CreatorLogisticsList({ shipments = [] }) {
  const rows = shipments.length > 0 ? shipments : LOGISTICS_DEMO_SHIPMENTS;

  return (
    <CreatorPageShell
      eyebrow="Product logistics"
      title="Tracking kits"
      description="Confirm receipt and keep a shared proof record with the brand."
    >
      <LogisticsMasterDetail
        shipments={rows}
        perspective="creator"
        basePath="/creator/logistics"
        filters={FILTERS}
        emptyTitle="No kits on the way"
        emptyBody="When a brand starts logistics for your hire, it shows up here."
        toolbar={
          <div>
            <p className="text-sm font-semibold text-slate-950">Incoming kits</p>
            <p className="text-xs text-slate-500">
              Select a card to preview · open to confirm
            </p>
          </div>
        }
      />
    </CreatorPageShell>
  );
}
