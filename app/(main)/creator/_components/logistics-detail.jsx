"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  confirmReceived,
  reportLogisticsProblem,
  requestLogisticsReturn,
} from "@/actions/logistics";
import { cn } from "@/lib/utils";
import {
  LogisticsRouteRail,
  LogisticsVerticalTrack,
} from "../../_components/logistics-console";
import {
  LogisticsAuditTrail,
  LogisticsDispatchSummary,
  LogisticsExplainers,
  LogisticsPersonChip,
  LogisticsRecipientPanel,
  LogisticsStatusStrip,
  LogisticsWorkspaceShell,
} from "../../_components/logistics-detail-shared";
import { logisticsDispositionMeta } from "@/lib/logistics-ui";
import { CreatorPageShell, creatorCardClass } from "./creator-page-shell";

export function CreatorLogisticsDetail({ shipment: initial, isDemo = false }) {
  const router = useRouter();
  const [shipment, setShipment] = useState(initial);
  const [receiveNotes, setReceiveNotes] = useState("");
  const [problemNotes, setProblemNotes] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const [showProblem, setShowProblem] = useState(false);
  const [showReturn, setShowReturn] = useState(
    ["RETURN_REQUESTED", "RETURN_ACKED"].includes(initial.status)
  );
  const [pending, startTransition] = useTransition();

  const canConfirm = shipment.status === "DISPATCHED";
  const isReturnable = shipment.disposition === "RETURNABLE";
  const dispositionMeta = logisticsDispositionMeta(shipment.disposition);
  const brandName =
    shipment.client?.name ||
    shipment.application?.campaign?.brand ||
    "Brand";

  const run = (fn, successMessage, demoPatch) => {
    if (isDemo) {
      if (demoPatch) setShipment((prev) => ({ ...prev, ...demoPatch }));
      toast.success(successMessage);
      return;
    }
    startTransition(async () => {
      try {
        const result = await fn();
        if (result?.shipment) setShipment(result.shipment);
        toast.success(successMessage);
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      }
    });
  };

  return (
    <CreatorPageShell
      eyebrow="Product logistics"
      title={shipment.title}
      description="Confirm receipt or report a problem."
      actions={
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/creator/logistics">
            <ArrowLeft className="h-4 w-4" />
            All logistics
          </Link>
        </Button>
      }
    >
      <LogisticsStatusStrip shipment={shipment} labelKey="creatorLabel" />

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <LogisticsWorkspaceShell
          cardClass={cn(creatorCardClass, "h-full")}
          eyebrow="Sender"
          title={brandName}
          person={
            <LogisticsPersonChip name={brandName} role="Brand" tone="dark" />
          }
        >
          <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Product type
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              {dispositionMeta.label}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{dispositionMeta.detail}</p>
          </div>
          <LogisticsDispatchSummary shipment={shipment} />
        </LogisticsWorkspaceShell>

        <LogisticsWorkspaceShell
          cardClass={cn(creatorCardClass, "h-full")}
          eyebrow="Recipient"
          title={canConfirm ? "Did it arrive safely?" : "Your confirmation"}
          person={<LogisticsPersonChip name="You" role="Creator" />}
        >
          {canConfirm ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="receiveNotes">Notes</Label>
                <Textarea
                  id="receiveNotes"
                  value={receiveNotes}
                  onChange={(e) => setReceiveNotes(e.target.value)}
                  rows={2}
                  className="rounded-xl"
                  placeholder="Condition, contents…"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="black"
                  className="h-11 rounded-full"
                  disabled={pending}
                  onClick={() =>
                    run(
                      () => confirmReceived(shipment.id, { receiveNotes }),
                      "Marked as received safely",
                      {
                        status: "RECEIVED_OK",
                        receiveNotes,
                        receivedAt: new Date().toISOString(),
                        problemNotes: "",
                      }
                    )
                  }
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Yes, safely
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                  disabled={pending}
                  onClick={() => setShowProblem(true)}
                >
                  <AlertTriangle className="h-4 w-4" />
                  No / problem
                </Button>
              </div>

              {showProblem ? (
                <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50/40 p-3.5">
                  <Label htmlFor="problemNotes">Describe the problem</Label>
                  <Textarea
                    id="problemNotes"
                    value={problemNotes}
                    onChange={(e) => setProblemNotes(e.target.value)}
                    rows={3}
                    className="rounded-xl bg-white"
                    placeholder="Missing items, damage, never arrived…"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
                    disabled={pending || !problemNotes.trim()}
                    onClick={() =>
                      run(
                        () =>
                          reportLogisticsProblem(shipment.id, { problemNotes }),
                        "Problem reported",
                        {
                          status: "PROBLEM",
                          problemNotes,
                          receivedAt: new Date().toISOString(),
                        }
                      )
                    }
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Submit report
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <LogisticsRecipientPanel shipment={shipment} perspective="creator" />
          )}

          {isReturnable &&
          ["RECEIVED_OK", "PROBLEM", "DISPATCHED"].includes(shipment.status) ? (
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
                        () =>
                          requestLogisticsReturn(shipment.id, { returnNotes }),
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
        </LogisticsWorkspaceShell>
      </div>

      <section className={cn(creatorCardClass, "p-4 sm:p-5")}>
        <h2 className="text-base font-semibold text-slate-950">Tracking</h2>
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
          <LogisticsRouteRail shipment={shipment} perspective="creator" />
        </div>
        <div className="mt-5">
          <LogisticsVerticalTrack shipment={shipment} />
        </div>
      </section>

      <section className={cn(creatorCardClass, "p-4 sm:p-5")}>
        <h2 className="text-base font-semibold text-slate-950">Activity</h2>
        <div className="mt-4">
          <LogisticsAuditTrail events={shipment.events} />
        </div>
      </section>

      <LogisticsExplainers />
    </CreatorPageShell>
  );
}
