"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@uploadthing/react";
import {
  saveDeliveryReportDraft,
  submitDeliveryReport,
  withdrawDeliveryReport,
} from "@/actions/delivery-reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PROOF_METRIC_FIELDS,
  checklistProgress,
  formatMetricTargetsSummary,
  hasMetricTargets,
  metricsPayloadFromProofEntries,
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
import { CreatorPageShell, creatorCardClass } from "./creator-page-shell";

/** Creators enter actuals against client targets later — hidden for now. */
const SHOW_PROOF_LINK_METRICS = false;

function parseUploadFiles(res) {
  const rows = Array.isArray(res) ? res : res ? [res] : [];
  return rows
    .map((file) => {
      const url =
        file?.url ||
        file?.serverData?.url ||
        (file?.key ? `https://utfs.io/f/${file.key}` : null);
      if (!url) return null;
      return {
        url,
        name: file?.name || file?.serverData?.name || "file",
        type: file?.type || file?.serverData?.type || null,
        size: file?.size ?? file?.serverData?.size ?? null,
        key: file?.key || file?.serverData?.key || null,
      };
    })
    .filter(Boolean);
}

function formatBytes(size) {
  const n = Number(size);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function blankProofEntry() {
  return {
    url: "",
    views: "",
    likes: "",
    comments: "",
    shares: "",
    reach: "",
  };
}

export function CreatorDeliveryReportDetail({ report: initial }) {
  const router = useRouter();
  const [report, setReport] = useState(initial);
  const [checklist, setChecklist] = useState(initial.checklist || []);
  const [proofEntries, setProofEntries] = useState(() => proofEntriesFromReport(initial));
  const [proofFiles, setProofFiles] = useState(initial.proofFiles || []);
  const [proofNotes, setProofNotes] = useState(initial.proofNotes || "");
  const [pending, startTransition] = useTransition();

  const locked = report.status === "APPROVED";
  const submitted = report.status === "SUBMITTED";
  const editable = !locked && !submitted;
  const progress = useMemo(() => checklistProgress(checklist), [checklist]);
  const allDone = progress.total > 0 && progress.done === progress.total;
  const status = reportStatusMeta(report.status);
  const StatusIcon = status.icon;
  const campaign = report.application?.campaign;
  const appointment = report.appointment;
  const socialSuggested = Boolean(initial.metrics?.socialSuggested ?? report.metrics?.socialSuggested);
  const metricTargets = report.metrics?.targets || null;
  const targetsSummary = formatMetricTargetsSummary(metricTargets);

  const payload = () => {
    const { proofLinks, metrics } = metricsPayloadFromProofEntries(proofEntries, {
      socialSuggested,
      targets: metricTargets,
    });
    return {
      checklist,
      proofLinks,
      proofFiles,
      proofNotes,
      metrics,
    };
  };

  const syncReport = (next) => {
    setReport(next);
    setChecklist(next.checklist || []);
    setProofEntries(proofEntriesFromReport(next));
    setProofFiles(Array.isArray(next.proofFiles) ? next.proofFiles : []);
    setProofNotes(next.proofNotes || "");
  };

  const updateProofEntry = (index, patch) => {
    setProofEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))
    );
  };

  const onSave = () => {
    startTransition(async () => {
      try {
        const result = await saveDeliveryReportDraft(report.id, payload());
        syncReport(result.report);
        toast.success("Draft saved");
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Could not save");
      }
    });
  };

  const onSubmit = () => {
    startTransition(async () => {
      try {
        const result = await submitDeliveryReport(report.id, payload());
        syncReport(result.report);
        toast.success("Report submitted to client");
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Could not submit");
      }
    });
  };

  const onWithdraw = () => {
    startTransition(async () => {
      try {
        const result = await withdrawDeliveryReport(report.id);
        syncReport(result.report);
        toast.success("Report withdrawn — you can edit again");
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Could not withdraw");
      }
    });
  };

  const toggleItem = (id) => {
    if (!editable) return;
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const markAllDone = () => {
    if (!editable) return;
    setChecklist((prev) => prev.map((item) => ({ ...item, done: true })));
  };

  return (
    <CreatorPageShell
      eyebrow="Delivery report"
      title={report.title}
      description={
        campaign
          ? `${campaign.brand || "Brand"} · confirm deliverables and share results`
          : appointment
            ? "Confirm the client’s expectations and share results"
            : "Confirm deliverables and share results"
      }
      actions={
        <div className="flex flex-wrap gap-2">
          {campaign?.id ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/campaigns/${campaign.id}`}>
                Campaign
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : null}
          {appointment?.id ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/messages/${appointment.id}`}>
                Booking chat
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/creator/reports">
              <ArrowLeft className="h-4 w-4" />
              All reports
            </Link>
          </Button>
        </div>
      }
    >
      <div
        className={cn(
          "flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
          status.bannerClass
        )}
      >
        <div className="flex items-start gap-3">
          <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">{status.creatorLabel}</p>
            {report.clientFeedback ? (
              <p className="mt-1 text-sm">Client note: {report.clientFeedback}</p>
            ) : submitted ? (
              <p className="mt-1 text-sm opacity-80">
                Waiting on {report.client?.name || "the client"}. Withdraw if you need to edit.
              </p>
            ) : locked ? (
              <p className="mt-1 text-sm opacity-80">
                Approved
                {report.reviewedAt
                  ? ` · ${format(new Date(report.reviewedAt), "MMM d, yyyy")}`
                  : ""}
              </p>
            ) : (
              <p className="mt-1 text-sm opacity-80">
                {progress.done} of {progress.total} checklist items done
              </p>
            )}
          </div>
        </div>
        {submitted ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-current bg-white/70"
            disabled={pending}
            onClick={onWithdraw}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Undo2 className="h-4 w-4" />
                Withdraw to edit
              </>
            )}
          </Button>
        ) : null}
      </div>

      <ClientExpectationsPanel
        brief={appointment?.clientDescription}
        appointmentId={appointment?.id}
        cardClassName={creatorCardClass}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Progress · {progress.percent}%
          </span>
          <span>
            {progress.done}/{progress.total}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              locked ? "bg-emerald-500" : "bg-slate-950"
            )}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      <section className={cn(creatorCardClass, "space-y-4 p-4 sm:p-5")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Checklist</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tick each item once the brief criteria are met.
            </p>
          </div>
          {editable && !allDone ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={markAllDone}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all done
            </Button>
          ) : null}
        </div>
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                disabled={!editable}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition",
                  item.done
                    ? "border-emerald-100 bg-emerald-50/60"
                    : "border-slate-100 bg-white hover:border-slate-200",
                  !editable && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                    item.done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white text-transparent"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span
                  className={cn(
                    "text-sm text-slate-800",
                    item.done && "text-slate-500 line-through"
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={cn(creatorCardClass, "space-y-4 p-4 sm:p-5")}>
        <div>
          <h2 className="text-base font-semibold text-slate-950">Proof</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload files and add links the client can open (screenshots, PDFs, posts, Drive).
          </p>
          {hasMetricTargets(metricTargets) ? (
            <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5 text-sm text-sky-900">
              <p>
                <span className="font-medium text-sky-950">Client goals: </span>
                {targetsSummary}
              </p>
              {appointment ? (
                <p className="mt-1 text-xs text-sky-700/80">
                  Optional guidance — you don’t need to submit metric numbers to deliver.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Uploaded files
          </p>
          {proofFiles.length > 0 ? (
            <ul className="space-y-2">
              {proofFiles.map((file) => {
                const sizeLabel = formatBytes(file.size);
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
                    <div className="min-w-0 flex-1">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-sm font-medium text-slate-950 underline-offset-2 hover:underline"
                      >
                        {fileName}
                      </a>
                      <p className="text-xs text-slate-400">
                        {[file.type, sizeLabel].filter(Boolean).join(" · ") || "Uploaded file"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-xl">
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
                      {editable ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-xl"
                          onClick={() =>
                            setProofFiles((prev) => prev.filter((f) => f.url !== file.url))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
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
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No files uploaded yet.</p>
          )}

          {editable ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
                <Upload className="h-4 w-4" />
                Images, PDF, or video · up to 16MB (video 64MB)
              </div>
              <UploadButton
                endpoint="deliveryProof"
                appearance={{
                  container: "w-auto items-start",
                  button:
                    "h-10 rounded-full bg-slate-950 px-4 text-sm font-medium text-white ut-ready:bg-slate-950 ut-uploading:bg-slate-700",
                  allowedContent: "text-xs text-slate-400",
                }}
                onClientUploadComplete={(res) => {
                  const uploaded = parseUploadFiles(res);
                  if (!uploaded.length) {
                    toast.error("Upload finished but file URL was missing");
                    return;
                  }
                  setProofFiles((prev) => {
                    const seen = new Set(prev.map((f) => f.url));
                    const next = [...prev];
                    for (const file of uploaded) {
                      if (!seen.has(file.url)) {
                        seen.add(file.url);
                        next.push(file);
                      }
                    }
                    return next.slice(0, 12);
                  });
                  toast.success(
                    uploaded.length === 1
                      ? "File uploaded"
                      : `${uploaded.length} files uploaded`
                  );
                }}
                onUploadError={(err) => {
                  console.error(err);
                  toast.error(err?.message || "Upload failed");
                }}
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Links
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add post, Drive, or portfolio links for the client to open.
            </p>
          </div>
          {proofEntries.map((entry, index) => {
            const platform = platformFromUrl(entry.url);
            if (!editable && entry.url) {
              const hasMetrics =
                SHOW_PROOF_LINK_METRICS &&
                PROOF_METRIC_FIELDS.some(
                  ([key]) => entry[key] !== "" && entry[key] != null
                );
              return (
                <div
                  key={`proof-${index}`}
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
                        {platform ? socialPlatformLabel(platform) : "External link"}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {entry.url}
                      </span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </a>
                  {hasMetrics ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {PROOF_METRIC_FIELDS.map(([key, label]) => (
                        <div key={key} className="rounded-lg bg-white px-2.5 py-2 ring-1 ring-slate-100">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            {label}
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
                </div>
              );
            }
            return (
              <div
                key={`proof-${index}`}
                className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    {platform ? (
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2">
                        <SocialPlatformIcon platform={platform} className="h-4 w-4" />
                      </span>
                    ) : null}
                    <Input
                      value={entry.url}
                      disabled={!editable}
                      placeholder="https://instagram.com/… or Drive / portfolio link"
                      className={cn("h-11 rounded-xl bg-white", platform && "pl-10")}
                      onChange={(e) => updateProofEntry(index, { url: e.target.value })}
                    />
                  </div>
                  {editable ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 shrink-0 rounded-xl"
                      onClick={() =>
                        setProofEntries((prev) =>
                          prev.length <= 1
                            ? [blankProofEntry()]
                            : prev.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
                {SHOW_PROOF_LINK_METRICS && platform ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">
                      {socialPlatformLabel(platform)} results
                      <span className="font-normal text-slate-400">
                        {" "}
                        · enter from analytics
                      </span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {PROOF_METRIC_FIELDS.map(([key, label]) => {
                        const target = metricTargets?.[key];
                        return (
                          <label key={key} className="space-y-1">
                            <span className="text-[11px] font-medium text-slate-500">
                              {label}
                              {target != null ? (
                                <span className="font-normal text-slate-400">
                                  {" "}
                                  · target {Number(target).toLocaleString()}
                                </span>
                              ) : null}
                            </span>
                            <Input
                              type="number"
                              min="0"
                              inputMode="numeric"
                              disabled={!editable}
                              value={entry[key] ?? ""}
                              placeholder="0"
                              className="h-10 rounded-xl bg-white"
                              onChange={(e) =>
                                updateProofEntry(index, { [key]: e.target.value })
                              }
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {editable ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setProofEntries((prev) => [...prev, blankProofEntry()])}
          >
            <Plus className="h-4 w-4" />
            Add link
          </Button>
        ) : null}
        <Textarea
          value={proofNotes}
          disabled={!editable}
          placeholder="Optional notes for the client"
          className="min-h-24 rounded-xl"
          onChange={(e) => setProofNotes(e.target.value)}
        />
      </section>

      {editable ? (
        <div className="sticky bottom-3 z-10 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={pending}
            onClick={onSave}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save draft"}
          </Button>
          <Button
            type="button"
            variant="black"
            className="rounded-full"
            disabled={pending || !allDone}
            onClick={onSubmit}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                Submit to client
              </>
            )}
          </Button>
          {!allDone ? (
            <p className="w-full text-xs text-slate-500 sm:w-auto sm:self-center">
              Complete the checklist to submit.
            </p>
          ) : null}
        </div>
      ) : null}
    </CreatorPageShell>
  );
}
