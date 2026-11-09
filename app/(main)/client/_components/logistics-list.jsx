"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getAcceptedHiresForLogistics,
  getClientLogisticsShipments,
  startLogisticsFromApplication,
} from "@/actions/logistics";
import { LogisticsMasterDetail } from "../../_components/logistics-console";
import { ClientPageShell } from "./client-page-shell";

const FILTERS = [
  { id: "all", label: "All kits" },
  { id: "DISPATCHED", label: "In transit" },
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

export function ClientLogisticsList({
  shipments: initialShipments = [],
  acceptedHires: initialHires = [],
}) {
  const router = useRouter();
  const [shipments, setShipments] = useState(initialShipments);
  const [acceptedHires, setAcceptedHires] = useState(initialHires);
  const [startingId, setStartingId] = useState(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setShipments(initialShipments);
    setAcceptedHires(initialHires);
  }, [initialShipments, initialHires]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const [shipmentsData, hiresData] = await Promise.all([
          getClientLogisticsShipments(),
          getAcceptedHiresForLogistics(),
        ]);
        if (!active) return;
        setShipments(shipmentsData?.shipments || []);
        setAcceptedHires(hiresData?.acceptedHires || []);
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

  const hires = acceptedHires.filter((hire) => !hire.shipmentId).slice(0, 5);

  const startHire = (applicationId) => {
    setStartingId(applicationId);
    startTransition(async () => {
      try {
        const result = await startLogisticsFromApplication(applicationId);
        if (!result?.shipmentId) {
          toast.error("Could not start logistics");
          return;
        }
        toast.success(
          result.existing ? "Opening logistics record" : "Logistics record created"
        );
        router.push(`/client/logistics/${result.shipmentId}`);
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Could not start logistics");
      } finally {
        setStartingId(null);
      }
    });
  };

  return (
    <ClientPageShell
      eyebrow="Product logistics"
      title="Tracking kits"
      description="Record dispatch, receipt, issues, and returns. Updates live as both sides act."
    >
      <LogisticsMasterDetail
        shipments={shipments}
        perspective="client"
        basePath="/client/logistics"
        filters={FILTERS}
        emptyTitle="No kits yet"
        emptyBody="Accept a campaign hire, then start a shipment from here."
        toolbar={
          <div>
            <p className="text-sm font-semibold text-slate-950">Your kits</p>
            <p className="text-xs text-slate-500">
              Select a card to preview · open for full workspace
            </p>
          </div>
        }
        listFooter={
          hires.length > 0 ? (
            <div className="space-y-2">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Ready to ship
              </p>
              {hires.map((hire) => (
                <div
                  key={hire.applicationId}
                  className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900">
                      {hire.creatorName}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {hire.campaignTitle}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="black"
                    className="rounded-full"
                    disabled={pending && startingId === hire.applicationId}
                    onClick={() => startHire(hire.applicationId)}
                  >
                    {pending && startingId === hire.applicationId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    Add kit
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Button asChild variant="black" className="w-full rounded-full">
              <Link href="/client/campaigns">
                <Plus className="h-4 w-4" />
                Start from a campaign hire
              </Link>
            </Button>
          )
        }
      />
    </ClientPageShell>
  );
}
