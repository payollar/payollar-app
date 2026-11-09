"use client";

import { useEffect, useState } from "react";
import { getCreatorLogisticsShipments } from "@/actions/logistics";
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

export function CreatorLogisticsList({ shipments: initialShipments = [] }) {
  const [shipments, setShipments] = useState(initialShipments);

  useEffect(() => {
    setShipments(initialShipments);
  }, [initialShipments]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const data = await getCreatorLogisticsShipments();
        if (!active) return;
        setShipments(data?.shipments || []);
      } catch {
        // Keep the last good snapshot on screen.
      }
    };
    const timer = setInterval(refresh, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <CreatorPageShell
      eyebrow="Product logistics"
      title="Tracking kits"
      description="Confirm receipt and keep a shared proof record with the brand. Updates live."
    >
      <LogisticsMasterDetail
        shipments={shipments}
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
