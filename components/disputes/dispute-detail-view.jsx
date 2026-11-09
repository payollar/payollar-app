"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DisputeChatTranscript } from "@/components/disputes/dispute-chat-transcript";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  OPEN: "border-amber-200 bg-amber-50 text-amber-700",
  UNDER_REVIEW: "border-sky-200 bg-sky-50 text-sky-700",
  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  CLOSED: "border-slate-200 bg-slate-50 text-slate-600",
};

export function DisputeDetailView({
  dispute,
  chat = null,
  showBookingChat = false,
  backHref = "/creator/disputes",
}) {
  if (!dispute) {
    return (
      <div className={cn(DASHBOARD_CARD_CLASS, "p-8 text-center")}>
        <p className="text-sm font-semibold text-slate-950">Dispute not found</p>
        <Button asChild className="mt-4 rounded-full">
          <Link href={backHref}>Back to disputes</Link>
        </Button>
      </div>
    );
  }

  const other = dispute.isReporter ? dispute.againstUser : dispute.reporter;

  return (
    <div className="space-y-5 text-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button
            asChild
            variant="ghost"
            className="mb-2 h-8 rounded-full px-2 text-slate-500 hover:text-slate-950"
          >
            <Link href={backHref}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            {dispute.subject}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <UiBadge
              variant="outline"
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                STATUS_STYLES[dispute.status]
              )}
            >
              {String(dispute.status).replaceAll("_", " ")}
            </UiBadge>
            <UiBadge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
            >
              {dispute.priority} priority
            </UiBadge>
            <UiBadge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
            >
              {dispute.type}
            </UiBadge>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4",
          showBookingChat && "xl:grid-cols-[1.1fr_0.9fr]"
        )}
      >
        <section className={cn(DASHBOARD_CARD_CLASS, "p-5")}>
          <h2 className="text-sm font-semibold text-slate-950">Case details</h2>
          <p className="mt-3 whitespace-pre-line text-sm text-slate-700">
            {dispute.description}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Other party</p>
              <p className="mt-1 text-sm font-medium text-slate-950">
                {other?.name || other?.email || "Not specified"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Filed</p>
              <p className="mt-1 text-sm font-medium text-slate-950">
                {format(new Date(dispute.createdAt), "PPP p")}
              </p>
            </div>
            {dispute.appointment ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                <p className="text-xs text-slate-500">Linked booking</p>
                <p className="mt-1 text-sm font-medium text-slate-950">
                  {dispute.appointment.status}
                  {dispute.appointment.startTime
                    ? ` · ${format(
                        new Date(dispute.appointment.startTime),
                        "PPP p"
                      )}`
                    : ""}
                </p>
              </div>
            ) : null}
          </div>

          {dispute.resolution ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Resolution
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-emerald-950">
                {dispute.resolution}
              </p>
            </div>
          ) : null}
        </section>

        {showBookingChat ? <DisputeChatTranscript chat={chat} /> : null}
      </div>
    </div>
  );
}
