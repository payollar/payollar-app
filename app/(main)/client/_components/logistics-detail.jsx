"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Loader2,
  RotateCcw,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  acknowledgeLogisticsReturn,
  recordDispatch,
  requestLogisticsReturn,
  updateLogisticsDisposition,
} from "@/actions/logistics";
import { cn } from "@/lib/utils";
import {
  LogisticsRouteRail,
  LogisticsVerticalTrack,
} from "../../_components/logistics-console";
import {
  LogisticsAuditTrail,
  LogisticsDispositionPicker,
  LogisticsExplainers,
  LogisticsPersonChip,
  LogisticsRecipientPanel,
  LogisticsStatusStrip,
  LogisticsWorkspaceShell,
} from "../../_components/logistics-detail-shared";
import { logisticsDispositionMeta } from "@/lib/logistics-ui";
import { ClientPageShell, clientCardClass } from "./client-page-shell";

export function ClientLogisticsDetail({ shipment: initial, isDemo = false }) {
  const router = useRouter();
  const [shipment, setShipment] = useState(initial);
  const [courier, setCourier] = useState(initial.courier || "");
  const [riderNumber, setRiderNumber] = useState(initial.riderNumber || "");
  const [trackingRef, setTrackingRef] = useState(initial.trackingRef || "");
  const [dispatchNotes, setDispatchNotes] = useState(initial.dispatchNotes || "");
  const [disposition, setDisposition] = useState(
    initial.disposition === "RETURNABLE" ? "RETURNABLE" : "GIFT"
  );
  const [returnAckNotes, setReturnAckNotes] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const [showReturn, setShowReturn] = useState(
    ["RETURN_REQUESTED", "RETURN_ACKED"].includes(initial.status)
  );
  const [pending, startTransition] = useTransition();

  const canEditDispatch = ["DRAFT", "DISPATCHED"].includes(shipment.status);
  const isReturnable = disposition === "RETURNABLE";
  const canRequestReturn =
    isReturnable &&
    ["RECEIVED_OK", "PROBLEM", "DISPATCHED"].includes(shipment.status);
  const dispositionMeta = logisticsDispositionMeta(disposition);

  const run = (fn, successMessage, demoPatch) => {
    if (isDemo) {
      if (demoPatch) {
        setShipment((prev) => ({ ...prev, ...demoPatch }));
        if (demoPatch.disposition) setDisposition(demoPatch.disposition);
      }
      toast.success(successMessage);
      return;
    }
    startTransition(async () => {
      try {
        const result = await fn();
        if (result?.shipment) {
          setShipment(result.shipment);
          setCourier(result.shipment.courier || "");
          setRiderNumber(result.shipment.riderNumber || "");
          setTrackingRef(result.shipment.trackingRef || "");
          setDispatchNotes(result.shipment.dispatchNotes || "");
          if (result.shipment.disposition) {
            setDisposition(
              result.shipment.disposition === "RETURNABLE" ? "RETURNABLE" : "GIFT"
            );
          }
        }
        toast.success(successMessage);
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      }
    });
  };

  return (
    <ClientPageShell
      eyebrow="Product logistics"
      title={shipment.title}
      description="Record dispatch and review creator confirmation."
      actions={
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/client/logistics">
            <ArrowLeft className="h-4 w-4" />
            All logistics
          </Link>
        </Button>
      }
    >
      <LogisticsStatusStrip shipment={shipment} />

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <LogisticsWorkspaceShell
          cardClass={cn(clientCardClass, "h-full")}
          eyebrow="Sender"
          title={`Ship to ${shipment.creator?.name || "creator"}`}
          person={
            <LogisticsPersonChip
              name={shipment.client?.name || "Brand"}
              role="Brand"
              tone="dark"
            />
          }
        >
          {canEditDispatch ? (
            <div className="space-y-4">
              <LogisticsDispositionPicker
                value={disposition}
                disabled={pending}
                onChange={(next) => {
                  setDisposition(next);
                  if (isDemo) {
                    setShipment((prev) => ({ ...prev, disposition: next }));
                    return;
                  }
                  startTransition(async () => {
                    try {
                      const result = await updateLogisticsDisposition(
                        shipment.id,
                        next
                      );
                      if (result?.shipment) setShipment(result.shipment);
                    } catch (error) {
                      toast.error(error.message || "Could not update product type");
                      setDisposition(
                        shipment.disposition === "RETURNABLE"
                          ? "RETURNABLE"
                          : "GIFT"
                      );
                    }
                  });
                }}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="courier">Courier</Label>
                  <Input
                    id="courier"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    placeholder="e.g. Local delivery"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="riderNumber">Rider number</Label>
                  <Input
                    id="riderNumber"
                    value={riderNumber}
                    onChange={(e) => setRiderNumber(e.target.value)}
                    placeholder="Phone or rider ID"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trackingRef">Reference</Label>
                <Input
                  id="trackingRef"
                  value={trackingRef}
                  onChange={(e) => setTrackingRef(e.target.value)}
                  placeholder="Optional tracking or package code"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dispatchNotes">Notes</Label>
                <Textarea
                  id="dispatchNotes"
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  rows={3}
                  className="rounded-xl"
                  placeholder="Kit contents, drop-off notes…"
                />
              </div>
              <Button
                type="button"
                variant="black"
                className="h-11 w-full rounded-full"
                disabled={pending}
                onClick={() =>
                  run(
                    () =>
                      recordDispatch(shipment.id, {
                        courier,
                        riderNumber,
                        trackingRef,
                        dispatchNotes,
                        disposition,
                      }),
                    shipment.dispatchedAt ? "Dispatch updated" : "Dispatch recorded",
                    {
                      courier,
                      riderNumber,
                      trackingRef,
                      dispatchNotes,
                      disposition,
                      status: "DISPATCHED",
                      dispatchedAt: shipment.dispatchedAt || new Date().toISOString(),
                    }
                  )
                }
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Truck className="h-4 w-4" />
                )}
                {shipment.dispatchedAt ? "Update dispatch" : "Record dispatch"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Product type
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {dispositionMeta.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{dispositionMeta.detail}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-3.5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Courier
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {shipment.courier || "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3.5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Rider number
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {shipment.riderNumber || "—"}
                  </p>
                </div>
                {shipment.trackingRef ? (
                  <div className="rounded-2xl bg-slate-50 px-3.5 py-3 sm:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Reference
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {shipment.trackingRef}
                    </p>
                  </div>
                ) : null}
              </div>
              {shipment.dispatchNotes ? (
                <div className="rounded-2xl bg-slate-50 px-3.5 py-3 text-sm text-slate-700">
                  {shipment.dispatchNotes}
                </div>
              ) : null}
            </div>
          )}

          {canRequestReturn ? (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowReturn((v) => !v)}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                  <RotateCcw className="h-4 w-4" />
                  Request return
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-slate-400 transition",
                    showReturn && "rotate-180"
                  )}
                />
              </button>
              {showReturn ? (
                <div className="mt-3 space-y-3">
                  <Textarea
                    id="returnNotes"
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    rows={2}
                    className="rounded-xl"
                    placeholder="Reason for return"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={pending || shipment.status === "RETURN_REQUESTED"}
                    onClick={() =>
                      run(
                        () => requestLogisticsReturn(shipment.id, { returnNotes }),
                        "Return requested",
                        {
                          status: "RETURN_REQUESTED",
                          returnNotes,
                          returnRequestedAt: new Date().toISOString(),
                        }
                      )
                    }
                  >
                    <RotateCcw className="h-4 w-4" />
                    Submit return
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {shipment.status === "RETURN_REQUESTED" ? (
            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
              <Label htmlFor="returnAckNotes">Acknowledge return</Label>
              <Textarea
                id="returnAckNotes"
                value={returnAckNotes}
                onChange={(e) => setReturnAckNotes(e.target.value)}
                rows={2}
                className="rounded-xl"
              />
              <Button
                type="button"
                variant="black"
                className="rounded-full"
                disabled={pending}
                onClick={() =>
                  run(
                    () =>
                      acknowledgeLogisticsReturn(shipment.id, { returnAckNotes }),
                    "Return acknowledged",
                    {
                      status: "RETURN_ACKED",
                      returnAckNotes,
                      returnAckedAt: new Date().toISOString(),
                    }
                  )
                }
              >
                <CheckCircle2 className="h-4 w-4" />
                Acknowledge return
              </Button>
            </div>
          ) : null}
        </LogisticsWorkspaceShell>

        <LogisticsWorkspaceShell
          cardClass={cn(clientCardClass, "h-full")}
          eyebrow="Recipient"
          title={
            shipment.status === "DISPATCHED"
              ? "Confirmation pending"
              : shipment.status === "RECEIVED_OK"
                ? "Confirmed safe"
                : shipment.status === "PROBLEM"
                  ? "Issue reported"
                  : "Creator confirmation"
          }
          person={
            <LogisticsPersonChip
              name={shipment.creator?.name || "Creator"}
              role="Creator"
            />
          }
        >
          <LogisticsRecipientPanel shipment={shipment} perspective="client" />
        </LogisticsWorkspaceShell>
      </div>

      <section className={cn(clientCardClass, "p-4 sm:p-5")}>
        <h2 className="text-base font-semibold text-slate-950">Tracking</h2>
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
          <LogisticsRouteRail shipment={shipment} perspective="client" />
        </div>
        <div className="mt-5">
          <LogisticsVerticalTrack shipment={shipment} />
        </div>
      </section>

      <section className={cn(clientCardClass, "p-4 sm:p-5")}>
        <h2 className="text-base font-semibold text-slate-950">Activity</h2>
        <div className="mt-4">
          <LogisticsAuditTrail events={shipment.events} />
        </div>
      </section>

      <LogisticsExplainers />
    </ClientPageShell>
  );
}
