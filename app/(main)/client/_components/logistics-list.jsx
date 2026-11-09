"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getLogisticsStartSources,
  getClientLogisticsShipments,
  startLogisticsFromApplication,
  startLogisticsFromAppointment,
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

function sourceKey(source) {
  return source.appointmentId
    ? `booking:${source.appointmentId}`
    : `hire:${source.applicationId}`;
}

export function ClientLogisticsList({
  shipments: initialShipments = [],
  sources: initialSources = [],
  acceptedHires: initialHires = [],
}) {
  const router = useRouter();
  const [shipments, setShipments] = useState(initialShipments);
  const [sources, setSources] = useState(
    initialSources.length
      ? initialSources
      : (initialHires || []).filter((hire) => !hire.shipmentId)
  );
  const [startingId, setStartingId] = useState(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setShipments(initialShipments);
    setSources(
      initialSources.length
        ? initialSources
        : (initialHires || []).filter((hire) => !hire.shipmentId)
    );
  }, [initialShipments, initialSources, initialHires]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const [shipmentsData, sourcesData] = await Promise.all([
          getClientLogisticsShipments(),
          getLogisticsStartSources(),
        ]);
        if (!active) return;
        setShipments(shipmentsData?.shipments || []);
        setSources(sourcesData?.sources || []);
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

  const readySources = sources.filter((row) => !row.shipmentId).slice(0, 8);

  const startSource = (source) => {
    const key = sourceKey(source);
    setStartingId(key);
    startTransition(async () => {
      try {
        const result =
          source.kind === "TALENT_BOOKING" || source.appointmentId
            ? await startLogisticsFromAppointment(source.appointmentId)
            : await startLogisticsFromApplication(source.applicationId);
        if (!result?.shipmentId) {
          toast.error("Could not start logistics");
          return;
        }
        toast.success(
          result.existing ? "Opening logistics record" : "Kit created for this booking"
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
      description="Send kits for talent bookings or campaign hires. Record dispatch, receipt, issues, and returns."
    >
      <LogisticsMasterDetail
        shipments={shipments}
        perspective="client"
        basePath="/client/logistics"
        filters={FILTERS}
        emptyTitle="No kits yet"
        emptyBody="Start a kit from a talent booking or an accepted campaign hire."
        toolbar={
          <div>
            <p className="text-sm font-semibold text-slate-950">Your kits</p>
            <p className="text-xs text-slate-500">
              Select a card to preview · open for full workspace
            </p>
          </div>
        }
        listFooter={
          readySources.length > 0 ? (
            <div className="space-y-2">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Ready to ship
              </p>
              {readySources.map((source) => {
                const key = sourceKey(source);
                const isBooking =
                  source.kind === "TALENT_BOOKING" || Boolean(source.appointmentId);
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {source.creatorName}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {source.subtitle ||
                          source.campaignTitle ||
                          (isBooking ? "Talent booking" : "Campaign hire")}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="black"
                      className="rounded-full"
                      disabled={pending && startingId === key}
                      onClick={() => startSource(source)}
                    >
                      {pending && startingId === key ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      Add kit
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <Button asChild variant="black" className="w-full rounded-full">
                <Link href="/talents">
                  <Plus className="h-4 w-4" />
                  Start from a talent booking
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link href="/client/campaigns">Or from a campaign hire</Link>
              </Button>
            </div>
          )
        }
      />
    </ClientPageShell>
  );
}
