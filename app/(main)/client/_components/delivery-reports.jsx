"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Clapperboard,
  ClipboardList,
  Clock3,
  Eye,
  FileText,
  Heart,
  Link2,
  Megaphone,
  MessageCircle,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PROOF_METRIC_FIELDS,
  checklistProgress,
  reportStatusMeta,
  sortReportsForClient,
} from "@/lib/delivery-report-ui";
import { cn } from "@/lib/utils";
import { ClientPageShell, clientCardClass } from "./client-page-shell";
import { MediaProofOfAiring } from "./media-proof-of-airing";

const SECTIONS = [
  { id: "campaign", label: "Campaign reports", href: "/client/reports", icon: Megaphone },
  {
    id: "media",
    label: "Media proof of airing",
    href: "/client/reports?section=media",
    icon: Clapperboard,
  },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "SUBMITTED", label: "Needs review" },
  { id: "DRAFT", label: "In progress" },
  { id: "APPROVED", label: "Approved" },
  { id: "REVISION_REQUESTED", label: "Revisions" },
];

function sumMetric(reports, key) {
  return reports.reduce((total, report) => {
    const metrics = report?.metrics && typeof report.metrics === "object" ? report.metrics : {};
    const entries = Array.isArray(metrics.entries) ? metrics.entries : null;
    if (entries?.length) {
      return (
        total +
        entries.reduce((sum, entry) => {
          const n = Number(entry?.[key]);
          return sum + (Number.isFinite(n) && n >= 0 ? n : 0);
        }, 0)
      );
    }
    const n = Number(metrics[key]);
    return total + (Number.isFinite(n) && n >= 0 ? n : 0);
  }, 0);
}

function buildReportPortfolioStats(reports = []) {
  const byStatus = {
    DRAFT: 0,
    SUBMITTED: 0,
    APPROVED: 0,
    REVISION_REQUESTED: 0,
  };
  let proofFiles = 0;
  let proofLinks = 0;
  let targetsSet = 0;
  let targetsCompared = 0;
  let targetsMet = 0;
  const campaignIds = new Set();
  const creators = new Set();

  for (const report of reports) {
    if (byStatus[report.status] != null) byStatus[report.status] += 1;
    proofFiles += Array.isArray(report.proofFiles) ? report.proofFiles.length : 0;
    proofLinks += Array.isArray(report.proofLinks) ? report.proofLinks.length : 0;
    if (report.application?.campaign?.id) {
      campaignIds.add(report.application.campaign.id);
    }
    if (report.creatorId || report.creator?.id) {
      creators.add(report.creatorId || report.creator.id);
    }

    const metrics = report?.metrics && typeof report.metrics === "object" ? report.metrics : {};
    const targets = metrics.targets || {};
    const hasTargets = PROOF_METRIC_FIELDS.some(([key]) => {
      const n = Number(targets[key]);
      return Number.isFinite(n) && n >= 0;
    });
    if (hasTargets) targetsSet += 1;

    for (const [key] of PROOF_METRIC_FIELDS) {
      const target = Number(targets[key]);
      const actual = Number(metrics[key]);
      if (!Number.isFinite(target) || target < 0) continue;
      if (!Number.isFinite(actual) || actual < 0) continue;
      targetsCompared += 1;
      if (actual >= target) targetsMet += 1;
    }
  }

  return {
    total: reports.length,
    byStatus,
    proofFiles,
    proofLinks,
    campaigns: campaignIds.size,
    creators: creators.size,
    targetsSet,
    targetsCompared,
    targetsMet,
    views: sumMetric(reports, "views"),
    likes: sumMetric(reports, "likes"),
    comments: sumMetric(reports, "comments"),
    shares: sumMetric(reports, "shares"),
    reach: sumMetric(reports, "reach"),
  };
}

function formatCompact(n) {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return Math.round(n).toLocaleString();
}

export function ClientDeliveryReports({
  reports = [],
  mediaBookings = [],
  mediaCertificates = [],
  mediaReports = [],
  initialSection = "campaign",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionFromUrl =
    searchParams?.get("section") === "media" || initialSection === "media"
      ? "media"
      : "campaign";
  const [section, setSection] = useState(sectionFromUrl);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setSection(sectionFromUrl);
  }, [sectionFromUrl]);

  const sorted = useMemo(() => sortReportsForClient(reports), [reports]);
  const stats = useMemo(() => buildReportPortfolioStats(reports), [reports]);
  const needsReview = stats.byStatus.SUBMITTED;
  const mediaProofCount = mediaCertificates.length;

  const filtered = useMemo(() => {
    if (filter === "all") return sorted;
    return sorted.filter((r) => r.status === filter);
  }, [filter, sorted]);

  const goToSection = (next) => {
    setSection(next);
    router.push(next === "media" ? "/client/reports?section=media" : "/client/reports");
  };

  return (
    <ClientPageShell
      eyebrow="Delivery"
      title="Reports"
      description={
        section === "media"
          ? "Monitor media bookings, station transmission proof, and airing fulfillment."
          : needsReview > 0
            ? `${needsReview} campaign report${needsReview === 1 ? "" : "s"} waiting for your review.`
            : "Review creator checklists, proof links, and social performance."
      }
    >
      <div className="overflow-x-auto rounded-2xl bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-1">
          {SECTIONS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            const count =
              item.id === "media" ? mediaProofCount : reports.length;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goToSection(item.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                  active
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                    active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {section === "media" ? (
        <MediaProofOfAiring
          bookings={mediaBookings}
          certificates={mediaCertificates}
          reports={mediaReports}
        />
      ) : null}

      {section === "campaign" && reports.length > 0 ? (
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={ClipboardList}
              label="Total reports"
              value={String(stats.total)}
              hint={`${stats.campaigns} campaign${stats.campaigns === 1 ? "" : "s"} · ${stats.creators} creator${stats.creators === 1 ? "" : "s"}`}
            />
            <StatCard
              icon={Clock3}
              label="Needs review"
              value={String(stats.byStatus.SUBMITTED)}
              hint={`${stats.byStatus.DRAFT} in progress`}
              accent={stats.byStatus.SUBMITTED > 0 ? "amber" : undefined}
            />
            <StatCard
              icon={CheckCircle2}
              label="Approved"
              value={String(stats.byStatus.APPROVED)}
              hint={
                stats.targetsCompared > 0
                  ? `${stats.targetsMet}/${stats.targetsCompared} targets met`
                  : `${stats.targetsSet} with targets set`
              }
              accent="emerald"
            />
            <StatCard
              icon={FileText}
              label="Proof assets"
              value={String(stats.proofFiles + stats.proofLinks)}
              hint={`${stats.proofFiles} files · ${stats.proofLinks} links`}
            />
          </div>

          <div className={cn(clientCardClass, "p-4 sm:p-5")}>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Portfolio engagement
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Totals across all campaign delivery reports
                  {stats.views + stats.likes + stats.comments === 0
                    ? " · results appear once creators submit metrics"
                    : ""}
                </p>
              </div>
              {stats.targetsSet > 0 ? (
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Target className="h-3.5 w-3.5" />
                  {stats.targetsSet} report{stats.targetsSet === 1 ? "" : "s"} with targets
                </p>
              ) : null}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <MetricChip icon={Eye} label="Views" value={stats.views} />
              <MetricChip icon={Heart} label="Likes" value={stats.likes} />
              <MetricChip icon={MessageCircle} label="Comments" value={stats.comments} />
              <MetricChip icon={Link2} label="Shares" value={stats.shares} />
              <MetricChip icon={Target} label="Reach" value={stats.reach} />
            </div>
          </div>
        </section>
      ) : null}

      {section === "campaign" && reports.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const count =
              item.id === "all"
                ? reports.length
                : reports.filter((r) => r.status === item.id).length;
            if (item.id !== "all" && count === 0) return null;
            return (
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
                <span className="ml-1.5 opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {section === "campaign" && reports.length === 0 ? (
        <div className={cn(clientCardClass, "flex flex-col items-center px-5 py-14 text-center")}>
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ClipboardList className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-slate-700">No delivery reports yet</p>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            When an accepted creator submits proof of work, it will show up here for review.
          </p>
        </div>
      ) : null}

      {section === "campaign" && reports.length > 0 && filtered.length === 0 ? (
        <div className={cn(clientCardClass, "px-5 py-10 text-center text-sm text-slate-500")}>
          No reports in this filter.
        </div>
      ) : null}

      {section === "campaign" && filtered.length > 0 ? (
        <ul className="space-y-3">
          {filtered.map((report) => {
            const meta = reportStatusMeta(report.status);
            const StatusIcon = meta.icon;
            const progress = checklistProgress(report.checklist);
            const views = report.metrics?.views;

            return (
              <li key={report.id}>
                <Link
                  href={`/client/reports/${report.id}`}
                  className={cn(
                    clientCardClass,
                    "block border-0 p-4 transition hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] sm:p-5",
                    report.status === "SUBMITTED" && "ring-1 ring-amber-200"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-3">
                      {report.creator?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={report.creator.imageUrl}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                          {(report.creator?.name || "C").charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-500">
                          {report.creator?.name || "Creator"}
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
                            {meta.clientLabel}
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
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      Updated{" "}
                      {formatDistanceToNow(new Date(report.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </ClientPageShell>
  );
}

function StatCard({ icon: Icon, label, value, hint, accent }) {
  return (
    <div
      className={cn(
        clientCardClass,
        "p-4",
        accent === "amber" && "ring-1 ring-amber-200",
        accent === "emerald" && "ring-1 ring-emerald-100"
      )}
    >
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function MetricChip({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold tabular-nums text-slate-950">
        {formatCompact(value)}
      </p>
    </div>
  );
}
