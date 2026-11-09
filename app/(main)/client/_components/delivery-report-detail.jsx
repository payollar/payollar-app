"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Heart,
  Link2,
  Loader2,
  MessageCircle,
  Plus,
  RotateCcw,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  reviewDeliveryReport,
  updateDeliveryReportChecklist,
  updateDeliveryReportMetricTargets,
} from "@/actions/delivery-reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PROOF_METRIC_FIELDS,
  checklistProgress,
  emptyMetricTargetsForm,
  formatMetricTargetsSummary,
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

const METRIC_ICONS = {
  views: Eye,
  likes: Heart,
  comments: MessageCircle,
  shares: Link2,
  reach: Target,
};

export function ClientDeliveryReportDetail({ report: initial }) {
  const router = useRouter();
  const [report, setReport] = useState(initial);
  const [feedback, setFeedback] = useState(initial.clientFeedback || "");
  const [targets, setTargets] = useState(() =>
    emptyMetricTargetsForm(initial.metrics?.targets)
  );
  const [checklistDraft, setChecklistDraft] = useState(() =>
    seedChecklistDraft(initial.checklist)
  );
  const [pending, startTransition] = useTransition();

  const canReview = report.status === "SUBMITTED";
  const canEditTargets = report.status !== "APPROVED";
  const canEditChecklist =
    report.status === "DRAFT" || report.status === "REVISION_REQUESTED";
  const checklist = report.checklist || [];
  const progress = useMemo(() => checklistProgress(checklist), [checklist]);
  const status = reportStatusMeta(report.status);
  const StatusIcon = status.icon;
  const campaign = report.application?.campaign;
  const appointment = report.appointment;
  const isBooking = Boolean(appointment?.id);
  const proofEntries = useMemo(
    () => proofEntriesFromReport(report).filter((entry) => entry.url),
    [report]
  );
  const proofFiles = Array.isArray(report.proofFiles) ? report.proofFiles : [];
  const hasProof = proofFiles.length > 0 || proofEntries.length > 0 || Boolean(report.proofNotes);
  const targetsSaved = hasMetricTargets(report.metrics?.targets);
  const targetsSummary = formatMetricTargetsSummary(report.metrics?.targets);
  const actuals = report.metrics || {};
  const showActuals =
    report.status === "SUBMITTED" ||
    report.status === "APPROVED" ||
    (hasMetricTargets(actuals) &&
      PROOF_METRIC_FIELDS.some(([key]) => actuals[key] != null && actuals[key] !== ""));
  const waitingOnCreator =
    report.status === "DRAFT" || report.status === "REVISION_REQUESTED";
  const showProofSection =
    canReview || report.status === "APPROVED" || hasProof;

  const onSaveTargets = () => {
    startTransition(async () => {
      try {
        const result = await updateDeliveryReportMetricTargets(report.id, targets);
        setReport(result.report);
        setTargets(emptyMetricTargetsForm(result.report.metrics?.targets));
        toast.success(
          isBooking
            ? "Targets saved — talent can see them now"
            : "Targets saved"
        );
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Could not save targets");
      }
    });
  };

  const onSaveChecklist = () => {
    startTransition(async () => {
      try {
        const result = await updateDeliveryReportChecklist(
          report.id,
          checklistDraft
        );
        setReport(result.report);
        setChecklistDraft(seedChecklistDraft(result.report.checklist));
        toast.success("Checklist saved — talent will see these items");
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Could not save checklist");
      }
    });
  };

  const updateChecklistItem = (id, patch) => {
    setChecklistDraft((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const addChecklistItem = () => {
    if (checklistDraft.length >= 20) return;
    setChecklistDraft((prev) => [
      ...prev,
      { id: `item_${Date.now()}_${prev.length + 1}`, label: "", done: false },
    ]);
  };

  const removeChecklistItem = (id) => {
    setChecklistDraft((prev) => {
      if (prev.length <= 1) {
        return [{ id: `item_${Date.now()}`, label: "", done: false }];
      }
      return prev.filter((item) => item.id !== id);
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
        setChecklistDraft(seedChecklistDraft(result.report.checklist));
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
      eyebrow={isBooking ? "Booking report" : "Delivery report"}
      title={
        isBooking
          ? report.creator?.name || report.title
          : report.title
      }
      description={
        isBooking
          ? "Set targets as goals for talent. They deliver with checklist + proof — metrics are optional."
          : `From ${report.creator?.name || "creator"}`
      }
      actions={
        <div className="flex flex-wrap gap-2">
          {campaign?.id ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/client/campaigns`}>Campaigns</Link>
            </Button>
          ) : null}
          {appointment?.id ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/messages/${appointment.id}`}>
                <MessageCircle className="h-4 w-4" />
                Booking chat
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="rounded-full">
            <Link
              href={
                isBooking
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
            clientCardClass,
            "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
            canReview && "ring-1 ring-amber-200"
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            {report.creator?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={report.creator.imageUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base font-semibold text-slate-600">
                {(report.creator?.name || "C").charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                    status.className
                  )}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.clientLabel}
                </span>
                {isBooking ? (
                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                    Talent booking
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-sm font-semibold text-slate-950">
                {report.creator?.name || "Creator"}
              </p>
              <p className="text-sm text-slate-500">
                {report.submittedAt
                  ? `Submitted ${format(new Date(report.submittedAt), "MMM d · h:mm a")}`
                  : waitingOnCreator
                    ? targetsSaved
                      ? "Targets shared — waiting for delivery"
                      : "Set targets so talent knows what to hit"
                    : status.clientLabel}
                {report.reviewedAt
                  ? ` · Reviewed ${format(new Date(report.reviewedAt), "MMM d")}`
                  : ""}
              </p>
              {report.clientFeedback && report.status !== "SUBMITTED" ? (
                <p className="mt-2 text-sm text-slate-600">
                  Your note: {report.clientFeedback}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-2xl bg-slate-50 px-4 py-3 sm:min-w-[200px]">
            <div
              className="relative flex h-12 w-12 items-center justify-center"
              aria-hidden
            >
              <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke={progress.percent === 100 ? "#10b981" : "#0f172a"}
                  strokeWidth="3"
                  strokeDasharray={`${progress.percent} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold tabular-nums text-slate-700">
                {progress.percent}%
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Checklist
              </p>
              <p className="text-sm font-semibold tabular-nums text-slate-950">
                {progress.done}/{progress.total} done
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        <div className="space-y-6">
          <section
            className={cn(
              clientCardClass,
              "space-y-4 p-4 sm:p-5",
              !targetsSaved && canEditTargets && "ring-1 ring-sky-200"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    targetsSaved
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-sky-50 text-sky-700"
                  )}
                >
                  <Target className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    Metric targets
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {isBooking
                      ? targetsSaved
                        ? "Shared as goals — talent doesn’t have to submit metric numbers to deliver."
                        : "Optional goals for this booking. Talent delivers with checklist + proof; submitting metrics isn’t required."
                      : "Engagement goals the creator should hit with proof."}
                  </p>
                </div>
              </div>
              {targetsSaved ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Shared with talent
                </span>
              ) : canEditTargets ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                  Action needed
                </span>
              ) : null}
            </div>

            {targetsSaved && !canEditTargets ? (
              <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                {targetsSummary}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {PROOF_METRIC_FIELDS.map(([key, label]) => {
                    const Icon = METRIC_ICONS[key] || Target;
                    return (
                      <label
                        key={key}
                        className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5"
                      >
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <Icon className="h-3 w-3" />
                          {label}
                        </span>
                        <Input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          disabled={!canEditTargets || pending}
                          value={targets[key] ?? ""}
                          placeholder="—"
                          className="h-10 rounded-xl border-slate-200 bg-white"
                          onChange={(e) =>
                            setTargets((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                        />
                      </label>
                    );
                  })}
                </div>
                {canEditTargets ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="black"
                      size="sm"
                      className="rounded-full"
                      disabled={pending}
                      onClick={onSaveTargets}
                    >
                      {pending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Target className="h-4 w-4" />
                          {targetsSaved ? "Update targets" : "Save & share targets"}
                        </>
                      )}
                    </Button>
                    {targetsSaved && targetsSummary ? (
                      <p className="text-xs text-slate-500">{targetsSummary}</p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Leave blank any metric that doesn’t apply.
                      </p>
                    )}
                  </div>
                ) : null}
              </>
            )}

            {showActuals ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Reported results
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {PROOF_METRIC_FIELDS.map(([key, label]) => {
                    const actual = actuals[key];
                    const target = report.metrics?.targets?.[key];
                    const met =
                      actual != null &&
                      target != null &&
                      Number(actual) >= Number(target);
                    return (
                      <div
                        key={key}
                        className="rounded-lg bg-white px-2.5 py-2 ring-1 ring-slate-100"
                      >
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
          ) : null}

          <section className={cn(clientCardClass, "space-y-3 p-4 sm:p-5")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <ClipboardList className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    Checklist
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {canEditChecklist
                      ? "Edit what talent should complete. They mark items done when delivering."
                      : "Talent’s progress against your checklist."}
                  </p>
                </div>
              </div>
              {canEditChecklist ? (
                <button
                  type="button"
                  onClick={addChecklistItem}
                  disabled={checklistDraft.length >= 20 || pending}
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              ) : null}
            </div>

            {canEditChecklist ? (
              <>
                <ul className="space-y-2">
                  {checklistDraft.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-2 rounded-xl border border-slate-100 bg-white px-2.5 py-2"
                    >
                      <span
                        className={cn(
                          "mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          item.done
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-400"
                        )}
                        title={item.done ? "Marked done by talent" : "Not done yet"}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <Input
                        value={item.label}
                        disabled={pending}
                        placeholder="e.g. Post 3 Instagram reels"
                        className="h-10 flex-1 rounded-xl"
                        onChange={(e) =>
                          updateChecklistItem(item.id, { label: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(item.id)}
                        disabled={pending}
                        className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="black"
                    size="sm"
                    className="rounded-full"
                    disabled={pending}
                    onClick={onSaveChecklist}
                  >
                    {pending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save checklist"
                    )}
                  </Button>
                  <p className="text-xs text-slate-400">
                    {progress.done}/{progress.total} marked done by talent
                  </p>
                </div>
              </>
            ) : checklist.length === 0 ? (
              <p className="text-sm text-slate-500">No checklist items yet.</p>
            ) : (
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
                        item.done
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-400"
                      )}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm text-slate-800">{item.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {showProofSection ? (
            <section className={cn(clientCardClass, "space-y-3 p-4 sm:p-5")}>
              <h2 className="text-base font-semibold text-slate-950">Proof</h2>
              <ProofBody
                proofFiles={proofFiles}
                proofEntries={proofEntries}
                proofNotes={report.proofNotes}
              />
            </section>
          ) : waitingOnCreator ? (
            <div
              className={cn(
                clientCardClass,
                "flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:p-5"
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950">
                  {report.status === "REVISION_REQUESTED"
                    ? "Waiting for a revised submission"
                    : "Proof not submitted yet"}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Links and files will show here once{" "}
                  {report.creator?.name || "talent"} delivers.
                </p>
              </div>
              {appointment?.id ? (
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={`/messages/${appointment.id}`}>Message talent</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-6 lg:sticky lg:top-4">
          {appointment?.clientDescription ? (
            <ClientExpectationsPanel
              brief={appointment.clientDescription}
              appointmentId={appointment.id}
              viewer="client"
              cardClassName={clientCardClass}
              compact
            />
          ) : isBooking ? (
            <div className={cn(clientCardClass, "p-4 sm:p-5")}>
              <p className="text-sm font-semibold text-slate-950">No chat brief yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Metric targets above are the main brief. You can still add more detail in
                booking chat.
              </p>
              {appointment?.id ? (
                <Button asChild variant="outline" size="sm" className="mt-3 rounded-full">
                  <Link href={`/messages/${appointment.id}`}>Open chat</Link>
                </Button>
              ) : null}
            </div>
          ) : campaign ? (
            <div className={cn(clientCardClass, "space-y-2 p-4 sm:p-5")}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Campaign
              </p>
              <p className="text-sm font-semibold text-slate-950">
                {campaign.title || "Campaign"}
              </p>
              {campaign.description ? (
                <p className="text-sm leading-relaxed text-slate-600">
                  {campaign.description}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </ClientPageShell>
  );
}

function seedChecklistDraft(checklist) {
  const rows = Array.isArray(checklist)
    ? checklist.map((item, index) => ({
        id: String(item?.id || `item_${index + 1}`),
        label: String(item?.label || ""),
        done: Boolean(item?.done),
      }))
    : [];
  return rows.length
    ? rows
    : [{ id: `item_${Date.now()}`, label: "", done: false }];
}

function ProofBody({ proofFiles, proofEntries, proofNotes }) {
  if (
    (!proofFiles || proofFiles.length === 0) &&
    (!proofEntries || proofEntries.length === 0) &&
    !proofNotes
  ) {
    return <p className="text-sm text-slate-500">No proof uploaded yet.</p>;
  }

  return (
    <>
      {proofFiles?.length > 0 ? (
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

      {proofEntries?.length > 0 ? (
        <ul className="space-y-2">
          {proofEntries.map((entry) => {
            const platform = platformFromUrl(entry.url);
            const label = platform ? socialPlatformLabel(platform) : "External link";
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
                    <SocialPlatformIcon platform={platform} className="h-4 w-4" />
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

      {proofNotes ? (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {proofNotes}
        </p>
      ) : null}
    </>
  );
}
