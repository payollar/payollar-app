"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  reviewDeliveryReport,
  updateDeliveryReportMetricTargets,
} from "@/actions/delivery-reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PROOF_METRIC_FIELDS,
  checklistProgress,
  emptyMetricTargetsForm,
  hasMetricTargets,
  proofEntriesFromReport,
  reportStatusMeta,
} from "@/lib/delivery-report-ui";
import {
  SocialPlatformIcon,
  platformFromUrl,
  socialPlatformLabel,
} from "@/components/social-platform-icon";
import { cn } from "@/lib/utils";
import { ClientExpectationsPanel } from "@/components/reports/client-expectations-panel";
import { ClientPageShell, clientCardClass } from "./client-page-shell";
import { DeliveryReportInfographic } from "./delivery-report-infographic";

export function ClientDeliveryReportDetail({ report: initial }) {
  const router = useRouter();
  const [report, setReport] = useState(initial);
  const [feedback, setFeedback] = useState(initial.clientFeedback || "");
  const [targets, setTargets] = useState(() =>
    emptyMetricTargetsForm(initial.metrics?.targets)
  );
  const [pending, startTransition] = useTransition();

  const canReview = report.status === "SUBMITTED";
  const canEditTargets = report.status !== "APPROVED";
  const checklist = report.checklist || [];
  const progress = useMemo(() => checklistProgress(checklist), [checklist]);
  const status = reportStatusMeta(report.status);
  const StatusIcon = status.icon;
  const campaign = report.application?.campaign;
  const appointment = report.appointment;
  const proofEntries = useMemo(
    () => proofEntriesFromReport(report).filter((entry) => entry.url),
    [report]
  );
  const proofFiles = Array.isArray(report.proofFiles) ? report.proofFiles : [];
  const actuals = report.metrics || {};
  const showActuals =
    report.status === "SUBMITTED" ||
    report.status === "APPROVED" ||
    hasMetricTargets(actuals);

  const onSaveTargets = () => {
    startTransition(async () => {
      try {
        const result = await updateDeliveryReportMetricTargets(report.id, targets);
        setReport(result.report);
        setTargets(emptyMetricTargetsForm(result.report.metrics?.targets));
        toast.success("Targets saved");
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Could not save targets");
      }
    });
  };

  const onReview = (decision) => {
    startTransition(async () => {
      try {
        const result = await reviewDeliveryReport(report.id, {
          decision,
          feedback,
        });
        setReport(result.report);
        setFeedback(result.report.clientFeedback || "");
        setTargets(emptyMetricTargetsForm(result.report.metrics?.targets));
        toast.success(
          decision === "APPROVED" ? "Report approved" : "Revision requested"
        );
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Could not update report");
      }
    });
  };

  return (
    <ClientPageShell
      eyebrow="Delivery report"
      title={report.title}
      description={`From ${report.creator?.name || "creator"}`}
      actions={
        <div className="flex flex-wrap gap-2">
          {campaign?.id ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/client/campaigns`}>
                Campaigns
              </Link>
            </Button>
          ) : null}
          {appointment?.id ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/messages/${appointment.id}`}>Booking chat</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="rounded-full">
            <Link
              href={
                appointment?.id
                  ? "/client/reports?section=bookings"
                  : "/client/reports"
              }
            >
              <ArrowLeft className="h-4 w-4" />
              All reports
            </Link>
          </Button>
        </div>
      }
    >
      {report.status === "APPROVED" ? (
        <DeliveryReportInfographic report={report} />
      ) : (
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl border px-4 py-3",
            status.bannerClass
          )}
        >
          <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">{status.clientLabel}</p>
            <p className="mt-1 text-sm opacity-80">
              {report.submittedAt
                ? `Submitted ${format(new Date(report.submittedAt), "MMM d, yyyy · h:mm a")}`
                : "Creator has not submitted yet"}
              {report.reviewedAt
                ? ` · Reviewed ${format(new Date(report.reviewedAt), "MMM d, yyyy")}`
                : ""}
            </p>
            {report.clientFeedback && report.status !== "SUBMITTED" ? (
              <p className="mt-2 text-sm">Your note: {report.clientFeedback}</p>
            ) : null}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {report.creator?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.creator.imageUrl}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-base font-semibold text-slate-600">
            {(report.creator?.name || "C").charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <p className="font-semibold text-slate-950">
            {report.creator?.name || "Creator"}
          </p>
          <p className="text-sm text-slate-500">
            {progress.done}/{progress.total} checklist complete · {progress.percent}%
          </p>
        </div>
      </div>

      <ClientExpectationsPanel
        brief={appointment?.clientDescription}
        appointmentId={appointment?.id}
        cardClassName={clientCardClass}
      />

      <section className={cn(clientCardClass, "space-y-3 p-4 sm:p-5")}>
        <h2 className="text-base font-semibold text-slate-950">Checklist</h2>
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-3 py-3",
                item.done
                  ? "border-emerald-100 bg-emerald-50/60"
                  : "border-slate-100 bg-white"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  item.done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm text-slate-800">{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={cn(clientCardClass, "space-y-4 p-4 sm:p-5")}>
        <div>
          <h2 className="text-base font-semibold text-slate-950">Metric targets</h2>
          <p className="mt-1 text-sm text-slate-500">
            Set the engagement goals you expect. The creator fills in actual results when
            submitting proof.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PROOF_METRIC_FIELDS.map(([key, label]) => (
            <label key={key} className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500">{label}</span>
              <Input
                type="number"
                min="0"
                inputMode="numeric"
                disabled={!canEditTargets || pending}
                value={targets[key] ?? ""}
                placeholder="—"
                className="h-10 rounded-xl"
                onChange={(e) =>
                  setTargets((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            </label>
          ))}
        </div>
        {canEditTargets ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={pending}
            onClick={onSaveTargets}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save targets"}
          </Button>
        ) : null}
        {showActuals && hasMetricTargets(actuals) ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Reported results
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {PROOF_METRIC_FIELDS.map(([key, label]) => {
                const actual = actuals[key];
                const target = report.metrics?.targets?.[key];
                const met =
                  actual != null && target != null && Number(actual) >= Number(target);
                return (
                  <div key={key} className="rounded-lg bg-white px-2.5 py-2 ring-1 ring-slate-100">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {label}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">
                      {actual != null ? Number(actual).toLocaleString() : "—"}
                    </p>
                    {target != null ? (
                      <p
                        className={cn(
                          "mt-0.5 text-[10px]",
                          met ? "text-emerald-600" : "text-slate-400"
                        )}
                      >
                        Target {Number(target).toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      <section className={cn(clientCardClass, "space-y-3 p-4 sm:p-5")}>
        <h2 className="text-base font-semibold text-slate-950">Proof</h2>
        {proofFiles.length > 0 ? (
          <ul className="space-y-2">
            {proofFiles.map((file) => {
              const isImage = String(file.type || "").startsWith("image/");
              const fileName = file.name || "File";
              return (
                <li
                  key={file.url}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                >
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.url}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                      <FileText className="h-4 w-4" />
                    </span>
                  )}
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate text-sm font-medium text-slate-950 underline-offset-2 hover:underline"
                    title={fileName}
                  >
                    {fileName}
                  </a>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl"
                    >
                      <a
                        href={file.url}
                        download={fileName}
                        target="_blank"
                        rel="noreferrer"
                        title="Download"
                        aria-label={`Download ${fileName}`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-slate-500"
                    >
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        title="Open"
                        aria-label={`Open ${fileName}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
        {proofEntries.length > 0 ? (
          <ul className="space-y-2">
            {proofEntries.map((entry) => {
              const platform = platformFromUrl(entry.url);
              const label = platform
                ? socialPlatformLabel(platform)
                : "External link";
              const hasMetrics = PROOF_METRIC_FIELDS.some(
                ([key]) => entry[key] !== "" && entry[key] != null
              );
              return (
                <li
                  key={entry.url}
                  className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                >
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                      <SocialPlatformIcon
                        platform={platform}
                        className="h-4 w-4"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-950">
                        {label}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {entry.url}
                      </span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </a>
                  {platform && hasMetrics ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {PROOF_METRIC_FIELDS.map(([key, fieldLabel]) => (
                        <div
                          key={key}
                          className="rounded-lg bg-white px-2.5 py-2 ring-1 ring-slate-100"
                        >
                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            {fieldLabel}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">
                            {entry[key] !== "" && entry[key] != null
                              ? Number(entry[key]).toLocaleString()
                              : "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
        {proofFiles.length === 0 && proofEntries.length === 0 ? (
          <p className="text-sm text-slate-500">No proof uploaded yet.</p>
        ) : null}
        {report.proofNotes ? (
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {report.proofNotes}
          </p>
        ) : null}
      </section>

      {canReview ? (
        <section
          className={cn(
            clientCardClass,
            "sticky bottom-3 z-10 space-y-3 border-amber-200 p-4 shadow-lg sm:p-5"
          )}
        >
          <h2 className="text-base font-semibold text-slate-950">Your review</h2>
          <Textarea
            value={feedback}
            placeholder="Optional note — required if you request changes"
            className="min-h-24 rounded-xl"
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={pending}
              onClick={() => onReview("REVISION_REQUESTED")}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Request changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="black"
              className="rounded-full"
              disabled={pending}
              onClick={() => onReview("APPROVED")}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Approve report
                </>
              )}
            </Button>
          </div>
        </section>
      ) : report.status === "DRAFT" || report.status === "REVISION_REQUESTED" ? (
        <p className="text-sm text-slate-500">
          {report.status === "REVISION_REQUESTED"
            ? "Waiting for the creator to resubmit after your feedback."
            : "The creator is still filling this report."}
        </p>
      ) : null}
    </ClientPageShell>
  );
}
