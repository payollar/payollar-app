"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  FileText,
  Link2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";

const TYPE_LABELS = {
  BOOKING_SUMMARY: "Booking summary",
  PERFORMANCE: "Performance",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUAL: "Annual",
  CUSTOM: "Custom",
};

const TYPE_STYLES = {
  BOOKING_SUMMARY: "bg-slate-100 text-slate-700",
  PERFORMANCE: "bg-[#e8f0ff] text-[#0b3db8]",
  MONTHLY: "bg-violet-50 text-violet-700",
  QUARTERLY: "bg-amber-50 text-amber-800",
  ANNUAL: "bg-emerald-50 text-emerald-700",
  CUSTOM: "bg-rose-50 text-rose-700",
};

function formatType(type) {
  return TYPE_LABELS[type] || String(type || "").replace(/_/g, " ");
}

function ReportCard({ report }) {
  const [open, setOpen] = useState(false);
  const period =
    report.startDate && report.endDate
      ? `${format(new Date(report.startDate), "d MMM yyyy")} – ${format(
          new Date(report.endDate),
          "d MMM yyyy"
        )}`
      : null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-[#f7f8fc]/80 transition hover:border-slate-200 hover:bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950 shadow-sm ring-1 ring-slate-100">
          <FileText className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-slate-950">
              {report.title}
            </h4>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                TYPE_STYLES[report.reportType] || TYPE_STYLES.CUSTOM
              )}
            >
              {formatType(report.reportType)}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {period ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {period}
              </span>
            ) : null}
            {report.bookingId ? (
              <span className="inline-flex items-center gap-1 text-slate-950">
                <Link2 className="h-3.5 w-3.5" />
                Linked to booking
              </span>
            ) : (
              <span>General report</span>
            )}
            {report.createdAt ? (
              <span>
                Created {format(new Date(report.createdAt), "d MMM yyyy")}
              </span>
            ) : null}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "mt-2 h-4 w-4 shrink-0 text-slate-400 transition",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? (
        <div className="border-t border-slate-100 px-4 py-3.5">
          {report.content?.trim() ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {report.content}
            </p>
          ) : (
            <p className="text-sm text-slate-400">No notes added for this report.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function ReportsList({ reports = [], onCreateClick }) {
  const counts = useMemo(() => {
    const byType = {};
    let linked = 0;
    for (const report of reports) {
      byType[report.reportType] = (byType[report.reportType] || 0) + 1;
      if (report.bookingId) linked += 1;
    }
    return { total: reports.length, linked, byType };
  }, [reports]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-xs text-slate-500">Total</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-slate-950">
            {counts.total}
          </p>
        </div>
        <div className="rounded-2xl border border-white bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-xs text-slate-500">Linked</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-slate-950">
            {counts.linked}
          </p>
        </div>
        <div className="rounded-2xl border border-white bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-xs text-slate-500">Types</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-slate-950">
            {Object.keys(counts.byType).length}
          </p>
        </div>
      </div>

      <div className={cn(DASHBOARD_CARD_CLASS, "overflow-hidden")}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
              <BarChart3 className="h-4 w-4 text-slate-950" />
              Recent reports
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Open a report to read notes and metrics
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {reports.length === 0 ? (
            <div className="flex min-h-[14rem] flex-col items-center justify-center rounded-2xl bg-[#f7f8fc] px-6 py-10 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100">
                <FileText className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-slate-800">No reports yet</p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Create a report to share results with clients. Link a booking when
                you can.
              </p>
              {onCreateClick ? (
                <Button
                  type="button"
                  onClick={onCreateClick}
                  className="mt-4 h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create report
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2.5">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
