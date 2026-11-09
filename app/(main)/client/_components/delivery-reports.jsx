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
  Download,
  Eye,
  FileText,
  Info,
  Megaphone,
  Printer,
  Target,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PROOF_METRIC_FIELDS,
  checklistProgress,
  hasMetricTargets,
  reportStatusMeta,
  sortReportsForClient,
} from "@/lib/delivery-report-ui";
import { cn } from "@/lib/utils";
import { ClientPageShell, clientCardClass } from "./client-page-shell";
import { MediaProofOfAiring } from "./media-proof-of-airing";

const SECTIONS = [
  {
    id: "campaign",
    label: "Campaign reporting",
    href: "/client/reports",
    icon: Megaphone,
  },
  {
    id: "bookings",
    label: "Booking reports",
    href: "/client/reports?section=bookings",
    icon: Users,
  },
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
  const bookingIds = new Set();
  const creators = new Set();

  for (const report of reports) {
    if (byStatus[report.status] != null) byStatus[report.status] += 1;
    proofFiles += Array.isArray(report.proofFiles) ? report.proofFiles.length : 0;
    proofLinks += Array.isArray(report.proofLinks) ? report.proofLinks.length : 0;
    if (report.application?.campaign?.id) {
      campaignIds.add(report.application.campaign.id);
    }
    if (report.appointmentId || report.appointment?.id) {
      bookingIds.add(report.appointmentId || report.appointment.id);
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
    bookings: bookingIds.size,
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

function formatWhole(n) {
  const value = Number(n);
  if (!Number.isFinite(value) || value <= 0) return "0";
  return Math.round(value).toLocaleString("en-GH");
}

function formatCedis(n) {
  const value = Number(n);
  if (!Number.isFinite(value) || value <= 0) return "GH₵0";
  return `GH₵${value.toLocaleString("en-GH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function metricValue(report, key) {
  const metrics = report?.metrics && typeof report.metrics === "object" ? report.metrics : {};
  const entries = Array.isArray(metrics.entries) ? metrics.entries : null;
  if (entries?.length) {
    return entries.reduce((sum, entry) => {
      const n = Number(entry?.[key]);
      return sum + (Number.isFinite(n) && n >= 0 ? n : 0);
    }, 0);
  }
  const n = Number(metrics[key]);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function campaignOrderLabel(report) {
  const raw = String(report.application?.id || report.id || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  const tail = raw.slice(-4) || "0000";
  const year = new Date(report.createdAt || Date.now()).getFullYear();
  return `ORD-${year}-${tail}`;
}

function campaignOrderStatus(report) {
  if (report.status === "APPROVED") return { label: "Published", tone: "emerald" };
  if (report.status === "SUBMITTED") return { label: "Awaiting review", tone: "amber" };
  if (report.status === "REVISION_REQUESTED") return { label: "Revision requested", tone: "rose" };
  return { label: "In delivery", tone: "slate" };
}

function exportCampaignCsv(reports) {
  const header = [
    "Creator",
    "Order",
    "Status",
    "Fee (GHS)",
    "Views",
    "Reach",
    "Clicks",
    "Sales",
    "Attributed revenue (GHS)",
    "Campaign",
  ];
  const rows = reports.map((report) => [
    report.creator?.name || "Creator",
    campaignOrderLabel(report),
    campaignOrderStatus(report).label,
    Number(report.application?.rate) || 0,
    metricValue(report, "views"),
    metricValue(report, "reach"),
    metricValue(report, "clicks"),
    metricValue(report, "sales"),
    metricValue(report, "revenue") || metricValue(report, "attributedRevenue"),
    report.application?.campaign?.title || report.title || "",
  ]);
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `campaign-reporting-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
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
  const sectionParam = searchParams?.get("section") || initialSection || "campaign";
  const sectionFromUrl =
    sectionParam === "media" || sectionParam === "bookings"
      ? sectionParam
      : "campaign";
  const [section, setSection] = useState(sectionFromUrl);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setSection(sectionFromUrl);
  }, [sectionFromUrl]);

  const campaignReports = useMemo(
    () => reports.filter((report) => Boolean(report.applicationId || report.application?.id)),
    [reports]
  );
  const bookingReports = useMemo(
    () => reports.filter((report) => Boolean(report.appointmentId || report.appointment?.id)),
    [reports]
  );
  const sectionReports =
    section === "bookings" ? bookingReports : section === "campaign" ? campaignReports : [];

  const sorted = useMemo(
    () => sortReportsForClient(sectionReports),
    [sectionReports]
  );
  const stats = useMemo(
    () => buildReportPortfolioStats(sectionReports),
    [sectionReports]
  );
  const needsReview = stats.byStatus.SUBMITTED;
  const mediaProofCount = mediaCertificates.length;

  const filtered = useMemo(() => {
    if (filter === "all") return sorted;
    return sorted.filter((r) => r.status === filter);
  }, [filter, sorted]);

  const goToSection = (next) => {
    setSection(next);
    setFilter("all");
    if (next === "media") router.push("/client/reports?section=media");
    else if (next === "bookings") router.push("/client/reports?section=bookings");
    else router.push("/client/reports");
  };

  return (
    <ClientPageShell
      eyebrow="Delivery"
      title="Reports"
      description={
        section === "media"
          ? "Monitor media bookings, station transmission proof, and airing fulfillment."
          : section === "bookings"
            ? needsReview > 0
              ? `${needsReview} booking report${needsReview === 1 ? "" : "s"} waiting for your review.`
              : "Set targets as goals for talent, then review checklist and proof when they deliver."
            : needsReview > 0
              ? `${needsReview} creator report${needsReview === 1 ? "" : "s"} waiting for your review.`
              : "Creator cost, order status, actual delivery and outcomes across your campaigns."
      }
    >
      <div className="overflow-x-auto rounded-2xl bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-1">
          {SECTIONS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            const count =
              item.id === "media"
                ? mediaProofCount
                : item.id === "bookings"
                  ? bookingReports.length
                  : campaignReports.length;
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

      {(section === "campaign" || section === "bookings") && sectionReports.length > 0 ? (
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={ClipboardList}
              label={section === "campaign" ? "Creators" : "Total reports"}
              value={String(section === "campaign" ? stats.creators || stats.total : stats.total)}
              hint={
                section === "bookings"
                  ? `${stats.bookings} booking${stats.bookings === 1 ? "" : "s"} · ${stats.creators} talent${stats.creators === 1 ? "" : "s"}`
                  : `${stats.campaigns} campaign${stats.campaigns === 1 ? "" : "s"} · ${stats.total} order${stats.total === 1 ? "" : "s"}`
              }
            />
            <StatCard
              icon={Clock3}
              label={section === "campaign" ? "In delivery" : "Needs review"}
              value={String(
                section === "campaign"
                  ? stats.byStatus.DRAFT + stats.byStatus.SUBMITTED
                  : stats.byStatus.SUBMITTED
              )}
              hint={
                section === "campaign"
                  ? `${stats.byStatus.SUBMITTED} awaiting review`
                  : `${stats.byStatus.DRAFT} in progress`
              }
              accent={stats.byStatus.SUBMITTED > 0 ? "amber" : undefined}
            />
            <StatCard
              icon={CheckCircle2}
              label={section === "campaign" ? "Published" : "Approved"}
              value={String(stats.byStatus.APPROVED)}
              hint={
                stats.targetsCompared > 0
                  ? `${stats.targetsMet}/${stats.targetsCompared} targets met`
                  : section === "campaign"
                    ? `${formatWhole(stats.views)} total views`
                    : `${stats.targetsSet} with targets set`
              }
              accent="emerald"
            />
            <StatCard
              icon={FileText}
              label={section === "campaign" ? "Delivery proof" : "Proof assets"}
              value={String(stats.proofFiles + stats.proofLinks)}
              hint={`${stats.proofFiles} files · ${stats.proofLinks} links`}
            />
          </div>

          {section === "bookings" ? (
            <div className={cn(clientCardClass, "p-4 sm:p-5")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                    <Target className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Booking targets
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Set goals on each report so talent knows what to aim for. Delivery is
                      checklist + proof — metrics results are optional if they share them.
                    </p>
                  </div>
                </div>
                {stats.targetsSet > 0 ? (
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Target className="h-3.5 w-3.5" />
                    {stats.targetsSet} report{stats.targetsSet === 1 ? "" : "s"} with targets
                  </p>
                ) : (
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                    <Target className="h-3.5 w-3.5" />
                    Open a report to set targets
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {(section === "campaign" || section === "bookings") && sectionReports.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const count =
              item.id === "all"
                ? sectionReports.length
                : sectionReports.filter((r) => r.status === item.id).length;
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

      {(section === "campaign" || section === "bookings") && sectionReports.length === 0 ? (
        <div className={cn(clientCardClass, "flex flex-col items-center px-5 py-14 text-center")}>
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            {section === "bookings" ? (
              <Users className="h-5 w-5" />
            ) : (
              <ClipboardList className="h-5 w-5" />
            )}
          </span>
          <p className="text-sm font-medium text-slate-700">
            {section === "bookings"
              ? "No booking reports yet"
              : "No creator campaign reporting yet"}
          </p>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            {section === "bookings"
              ? "After a talent booking is paid, a report appears here so you can set metric targets. Creators see those targets when they deliver."
              : "When hired creators deliver campaign work, each creator’s cost, order status, and outcomes appear here."}
          </p>
        </div>
      ) : null}

      {(section === "campaign" || section === "bookings") &&
      sectionReports.length > 0 &&
      filtered.length === 0 ? (
        <div className={cn(clientCardClass, "px-5 py-10 text-center text-sm text-slate-500")}>
          No reports in this filter.
        </div>
      ) : null}

      {section === "campaign" && filtered.length > 0 ? (
        <CampaignReportingTable reports={filtered} />
      ) : null}

      {section === "bookings" && filtered.length > 0 ? (
        <ul className="space-y-3">
          {filtered.map((report) => {
            const meta = reportStatusMeta(report.status);
            const StatusIcon = meta.icon;
            const progress = checklistProgress(report.checklist);
            const views = report.metrics?.views;
            const hasBrief = Boolean(report.appointment?.clientDescription);
            const targetsReady = hasMetricTargets(report.metrics?.targets);
            const needsTargets =
              !targetsReady &&
              (report.status === "DRAFT" || report.status === "REVISION_REQUESTED");

            return (
              <li key={report.id}>
                <Link
                  href={`/client/reports/${report.id}`}
                  className={cn(
                    clientCardClass,
                    "block border-0 p-4 transition hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] sm:p-5",
                    report.status === "SUBMITTED" && "ring-1 ring-amber-200",
                    needsTargets && "ring-1 ring-sky-200"
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
                          <Badge
                            variant="outline"
                            className="rounded-full border-violet-200 bg-violet-50 font-medium text-violet-700"
                          >
                            Talent booking
                          </Badge>
                          {needsTargets ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700">
                              <Target className="h-3.5 w-3.5" />
                              Set metric targets
                            </span>
                          ) : targetsReady ? (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <Target className="h-3.5 w-3.5" />
                              Targets set
                            </span>
                          ) : null}
                          {hasBrief ? (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <FileText className="h-3.5 w-3.5" />
                              Brief attached
                            </span>
                          ) : null}
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

function CampaignReportingTable({ reports }) {
  const printTable = () => {
    window.print();
  };

  return (
    <section className={cn(clientCardClass, "overflow-hidden border-0 print:shadow-none")}>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">
            Creator-level campaign reporting
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Creator cost, order status, actual delivery and outcomes
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => exportCampaignCsv(reports)}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={printTable}
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print / PDF
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <th className="whitespace-nowrap px-4 py-3 font-semibold sm:px-5">Creator</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Order / Status</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Fee</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Views</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Reach</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Clicks</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Sales</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold sm:pr-5">
                Attributed revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => {
              const orderStatus = campaignOrderStatus(report);
              const fee = Number(report.application?.rate);
              const views = metricValue(report, "views");
              const reach = metricValue(report, "reach");
              const clicks = metricValue(report, "clicks");
              const sales = metricValue(report, "sales");
              const revenue =
                metricValue(report, "revenue") ||
                metricValue(report, "attributedRevenue");
              const campaignTitle =
                report.application?.campaign?.title || report.title || "Campaign";

              return (
                <tr key={report.id} className="bg-white hover:bg-slate-50/80">
                  <td className="px-4 py-3.5 sm:px-5">
                    <Link
                      href={`/client/reports/${report.id}`}
                      className="block min-w-[10rem]"
                    >
                      <p className="font-semibold text-slate-950">
                        {report.creator?.name || "Creator"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {campaignTitle}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/client/reports/${report.id}`} className="block">
                      <p className="font-semibold tabular-nums text-slate-950">
                        {campaignOrderLabel(report)}
                      </p>
                      <span
                        className={cn(
                          "mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                          orderStatus.tone === "emerald" &&
                            "bg-emerald-50 text-emerald-700",
                          orderStatus.tone === "amber" &&
                            "bg-amber-50 text-amber-800",
                          orderStatus.tone === "rose" && "bg-rose-50 text-rose-700",
                          orderStatus.tone === "slate" &&
                            "bg-slate-100 text-slate-600"
                        )}
                      >
                        {orderStatus.label}
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-medium tabular-nums text-slate-950">
                    {formatCedis(fee)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-slate-700">
                    {formatWhole(views)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-slate-700">
                    {formatWhole(reach)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-slate-700">
                    {formatWhole(clicks)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-slate-700">
                    {formatWhole(sales)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-medium tabular-nums text-slate-950 sm:pr-5">
                    {formatCedis(revenue)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 bg-[#faf8ff] px-4 py-3 sm:px-5">
        <div className="flex items-start gap-2.5 text-sm text-slate-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#6d28d9]" />
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-800">Reporting rules:</span>{" "}
            distinguish agreed order value from confirmed payment; measure actual
            views/reach from connected platforms or evidence; use tagged links,
            promo codes or website analytics for attributed conversions; keep
            estimates visibly separate. Other campaign and direct booking orders
            are never counted in this campaign&apos;s totals.
          </p>
        </div>
      </div>
    </section>
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

