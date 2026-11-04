"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  ClipboardList,
  Eye,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { startDeliveryReportFromApplication } from "@/actions/delivery-reports";
import {
  checklistProgress,
  reportStatusMeta,
} from "@/lib/delivery-report-ui";
import { cn } from "@/lib/utils";
import { CreatorPageShell, creatorCardClass } from "./creator-page-shell";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "action", label: "Needs you" },
  { id: "SUBMITTED", label: "In review" },
  { id: "APPROVED", label: "Approved" },
];

export function CreatorDeliveryReports({ reports = [], acceptedApplications = [] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [pendingId, setPendingId] = useState(null);
  const [pending, startTransition] = useTransition();

  const needsReport = useMemo(() => {
    const reported = new Set(reports.map((r) => r.applicationId).filter(Boolean));
    return acceptedApplications.filter((app) => !reported.has(app.id));
  }, [acceptedApplications, reports]);

  const filtered = useMemo(() => {
    if (filter === "all") return reports;
    if (filter === "action") {
      return reports.filter(
        (r) => r.status === "DRAFT" || r.status === "REVISION_REQUESTED"
      );
    }
    return reports.filter((r) => r.status === filter);
  }, [filter, reports]);

  const startFromApplication = (applicationId) => {
    setPendingId(applicationId);
    startTransition(async () => {
      try {
        const result = await startDeliveryReportFromApplication(applicationId);
        router.push(`/creator/reports/${result.reportId}`);
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Could not start report");
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <CreatorPageShell
      eyebrow="Delivery"
      title="Reports"
      description="Confirm deliverables, attach proof, and share post metrics for accepted campaigns."
    >
      {needsReport.length > 0 ? (
        <section className={cn(creatorCardClass, "p-4 sm:p-5")}>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-950">
                Start a delivery report
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {needsReport.length} accepted campaign
                {needsReport.length === 1 ? "" : "s"} waiting for checklist + proof.
              </p>
              <ul className="mt-4 space-y-2">
                {needsReport.map((app) => (
                  <li
                    key={app.id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">
                        {app.campaign?.brand || "Brand"} · {app.campaign?.title || "Campaign"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(app.campaign?.deliverables || []).length
                          ? `${app.campaign.deliverables.length} deliverable${app.campaign.deliverables.length === 1 ? "" : "s"}`
                          : "Standard checklist"}
                      </p>
                    </div>
                    <Button
                      variant="black"
                      size="sm"
                      className="rounded-full"
                      disabled={pending && pendingId === app.id}
                      onClick={() => startFromApplication(app.id)}
                    >
                      {pending && pendingId === app.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Start report
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {reports.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                filter === item.id
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {reports.length === 0 && needsReport.length === 0 ? (
        <div className={cn(creatorCardClass, "flex flex-col items-center px-5 py-14 text-center")}>
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ClipboardList className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-slate-700">No delivery reports yet</p>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            When a brand accepts your campaign application, start a report here to check off
            deliverables and share results.
          </p>
          <Button asChild variant="black" className="mt-5 rounded-full">
            <Link href="/creator/applications">
              View campaigns
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className={cn(creatorCardClass, "px-5 py-10 text-center text-sm text-slate-500")}>
          No reports in this filter.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((report) => {
            const meta = reportStatusMeta(report.status);
            const StatusIcon = meta.icon;
            const progress = checklistProgress(report.checklist);
            const views = report.metrics?.views;

            return (
              <li key={report.id}>
                <Link
                  href={`/creator/reports/${report.id}`}
                  className={cn(
                    creatorCardClass,
                    "block border-0 p-4 transition hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] sm:p-5"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-500">
                        {report.application?.campaign?.brand ||
                          report.client?.name ||
                          "Client"}
                      </p>
                      <h3 className="truncate text-lg font-semibold text-slate-950">
                        {report.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("rounded-full gap-1 font-medium", meta.className)}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {meta.creatorLabel}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {progress.done}/{progress.total} checklist
                        </span>
                        {views != null ? (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Eye className="h-3.5 w-3.5" />
                            {Number(views).toLocaleString()} views
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            report.status === "APPROVED" ? "bg-emerald-500" : "bg-slate-950"
                          )}
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      Updated{" "}
                      {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </CreatorPageShell>
  );
}
