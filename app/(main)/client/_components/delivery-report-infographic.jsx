"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  CheckCircle2,
  FileText,
  Link2,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  PROOF_METRIC_FIELDS,
  checklistProgress,
  hasMetricTargets,
  proofEntriesFromReport,
} from "@/lib/delivery-report-ui";
import {
  SocialPlatformIcon,
  platformFromUrl,
  socialPlatformLabel,
} from "@/components/social-platform-icon";
import { cn } from "@/lib/utils";
import { clientCardClass } from "./client-page-shell";

function pct(actual, target) {
  if (actual == null || target == null || Number(target) <= 0) return null;
  return Math.round((Number(actual) / Number(target)) * 100);
}

function Ring({ value = 0, size = 88, stroke = 8, trackClassName, progressClassName }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className={trackClassName || "text-slate-200"}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className={cn(
          "transition-[stroke-dashoffset] duration-700",
          progressClassName || "text-slate-950"
        )}
      />
    </svg>
  );
}

/**
 * Post-project summary for clients after a delivery report is approved.
 */
export function DeliveryReportInfographic({ report }) {
  const progress = useMemo(
    () => checklistProgress(report?.checklist || []),
    [report?.checklist]
  );
  const proofEntries = useMemo(
    () => proofEntriesFromReport(report).filter((e) => e.url),
    [report]
  );
  const proofFiles = Array.isArray(report?.proofFiles) ? report.proofFiles : [];
  const targets = report?.metrics?.targets || null;
  const actuals = report?.metrics || {};
  const platforms = useMemo(() => {
    const ids = [];
    const seen = new Set();
    for (const entry of proofEntries) {
      const id = platformFromUrl(entry.url);
      if (id && !seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
    return ids;
  }, [proofEntries]);

  const metricRows = useMemo(() => {
    return PROOF_METRIC_FIELDS.map(([key, label]) => {
      const target = targets?.[key];
      const actual = actuals[key];
      const hasActual = actual !== "" && actual != null;
      const hasTarget = target !== "" && target != null;
      if (!hasActual && !hasTarget) return null;
      return {
        key,
        label,
        target: hasTarget ? Number(target) : null,
        actual: hasActual ? Number(actual) : null,
        ratio: pct(actual, target),
      };
    }).filter(Boolean);
  }, [targets, actuals]);

  const hitCount = metricRows.filter(
    (row) => row.actual != null && row.target != null && row.actual >= row.target
  ).length;
  const comparedCount = metricRows.filter(
    (row) => row.actual != null && row.target != null
  ).length;

  const maxBar = Math.max(
    1,
    ...metricRows.flatMap((row) => [row.actual || 0, row.target || 0])
  );

  return (
    <section className={cn(clientCardClass, "overflow-hidden p-0")}>
      <div className="relative border-b border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-5 py-6 text-white sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Project summary
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Delivery complete
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              {report.title}
              {report.creator?.name ? ` · ${report.creator.name}` : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/65">
              {report.submittedAt ? (
                <span className="rounded-full bg-white/10 px-2.5 py-1">
                  Submitted {format(new Date(report.submittedAt), "MMM d, yyyy")}
                </span>
              ) : null}
              {report.reviewedAt ? (
                <span className="rounded-full bg-white/10 px-2.5 py-1">
                  Approved {format(new Date(report.reviewedAt), "MMM d, yyyy")}
                </span>
              ) : null}
            </div>
          </div>
          <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center self-start sm:self-auto">
            <Ring
              value={progress.percent}
              trackClassName="text-white/20"
              progressClassName="text-white"
            />
            <div className="absolute inset-0 flex rotate-0 flex-col items-center justify-center text-center">
              <span className="text-lg font-semibold tabular-nums">{progress.percent}%</span>
              <span className="text-[10px] uppercase tracking-wide text-white/55">
                done
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
        <StatTile
          icon={CheckCircle2}
          label="Checklist"
          value={`${progress.done}/${progress.total}`}
          hint="Items confirmed"
        />
        <StatTile
          icon={FileText}
          label="Files"
          value={String(proofFiles.length)}
          hint="Uploaded proof"
        />
        <StatTile
          icon={Link2}
          label="Links"
          value={String(proofEntries.length)}
          hint="Live post / assets"
        />
      </div>

      {platforms.length > 0 ? (
        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Platforms
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {platforms.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-800"
              >
                <SocialPlatformIcon platform={id} className="h-3.5 w-3.5" />
                {socialPlatformLabel(id)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {(hasMetricTargets(targets) || metricRows.length > 0) && (
        <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <TrendingUp className="h-3.5 w-3.5" />
                Engagement
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-950">
                Targets vs results
              </h3>
            </div>
            {comparedCount > 0 ? (
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-950">{hitCount}</span>
                /{comparedCount} targets met
              </p>
            ) : hasMetricTargets(targets) ? (
              <p className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                <Target className="h-3.5 w-3.5" />
                Goals set · results pending
              </p>
            ) : null}
          </div>

          <div className="mt-4 space-y-4">
            {metricRows.map((row) => {
              const actualWidth =
                row.actual != null ? Math.max(4, (row.actual / maxBar) * 100) : 0;
              const targetWidth =
                row.target != null ? Math.max(4, (row.target / maxBar) * 100) : 0;
              const met =
                row.actual != null &&
                row.target != null &&
                row.actual >= row.target;
              return (
                <div key={row.key} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800">{row.label}</p>
                    <p className="text-xs tabular-nums text-slate-500">
                      {row.actual != null ? (
                        <span className="font-semibold text-slate-950">
                          {row.actual.toLocaleString()}
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                      {row.target != null ? (
                        <span> / target {row.target.toLocaleString()}</span>
                      ) : null}
                      {row.ratio != null ? (
                        <span className={cn("ml-2", met ? "text-emerald-600" : "text-slate-400")}>
                          {row.ratio}%
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
                    {row.target != null ? (
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-slate-300/80"
                        style={{ width: `${targetWidth}%` }}
                      />
                    ) : null}
                    {row.actual != null ? (
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full",
                          met ? "bg-emerald-500" : "bg-slate-950"
                        )}
                        style={{ width: `${actualWidth}%` }}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-950" /> Result
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300" /> Target
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Target met
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

function StatTile({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
