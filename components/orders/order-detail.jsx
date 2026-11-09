"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Loader2,
  MessageCircle,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@uploadthing/react";
import { sendBookingMessage } from "@/actions/booking-chat";
import { cancelAppointment, markAppointmentCompleted } from "@/actions/doctor";
import {
  reviewBookingDeliveryReportInChat,
  sendBookingDeliveryReportInChat,
  withdrawDeliveryReport,
} from "@/actions/delivery-reports";
import { checklistFromBrief } from "@/lib/booking-brief";

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

const STEPS = [
  { key: "opened", label: "Opened" },
  { key: "booked", label: "Booked" },
  { key: "deliverable", label: "Deliverable" },
  { key: "wrap", label: "Wrap-up" },
  { key: "done", label: "Completed" },
];

function reportStatus(order) {
  return order.deliveryReport?.status || null;
}

function progressIndex(order) {
  const status = reportStatus(order);
  // Only true completion is an approved deliverable (or legacy complete after approval).
  if (status === "APPROVED") return 4;
  if (order.status === "COMPLETED" && status === "APPROVED") return 4;
  if (status === "SUBMITTED") return 3;
  if (order.status === "CANCELLED") return 0;
  // Paid / confirmed bookings stay on Deliverable until something is submitted.
  if (order.status === "SCHEDULED" || order.status === "COMPLETED" || isPaidBooking(order)) {
    return 2;
  }
  return 0;
}

function statusCopy(order, index) {
  if (order.status === "CANCELLED") return { label: "Cancelled", className: "bg-rose-50 text-rose-600" };
  if (reportStatus(order) === "APPROVED") {
    return { label: "Completed", className: "bg-emerald-50 text-emerald-700" };
  }
  if (order.status === "COMPLETED" && reportStatus(order) === "APPROVED") {
    return { label: "Completed", className: "bg-emerald-50 text-emerald-700" };
  }
  if (reportStatus(order) === "REVISION_REQUESTED") {
    return { label: "Changes requested", className: "bg-amber-50 text-amber-700" };
  }
  if (index === 4) return { label: "Completed", className: "bg-emerald-50 text-emerald-700" };
  if (index === 3) return { label: "Awaiting review", className: "bg-amber-50 text-amber-700" };
  if (index === 2) {
    return order.role === "CREATOR"
      ? { label: "Submit deliverable", className: "bg-violet-50 text-violet-700" }
      : { label: "Awaiting deliverable", className: "bg-slate-100 text-slate-700" };
  }
  if (index === 1) return { label: "Booked", className: "bg-slate-100 text-slate-700" };
  return { label: "Chat open", className: "bg-slate-100 text-slate-700" };
}

function stepWhen(order, step, index) {
  if (step > index || order.status === "CANCELLED") return "";
  if (step === 0) return format(new Date(order.createdAt), "MMM d");
  if (step === 1 && index >= 1) return format(new Date(order.updatedAt || order.createdAt), "MMM d");
  if (step === 2 && index >= 2) return format(new Date(order.updatedAt || order.startTime), "MMM d");
  if (step === 3 && order.deliveryReport?.submittedAt) {
    return format(new Date(order.deliveryReport.submittedAt), "MMM d");
  }
  if (step === 4) {
    const when = order.deliveryReport?.reviewedAt || order.updatedAt;
    return when ? format(new Date(when), "MMM d") : "";
  }
  return "";
}

function initials(name) {
  return (
    String(name || "P")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P"
  );
}

function deadlineHint(endTime) {
  const end = new Date(endTime).getTime();
  const diff = end - Date.now();
  if (diff <= 0) return "Due date has passed";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

function moneyGhs(value) {
  return `GH₵ ${Number(value || 0).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function briefPreview(brief) {
  const text = String(brief || "").trim();
  if (!text) return "Booking request";
  return text.length > 72 ? `${text.slice(0, 72)}…` : text;
}

function isPaidBooking(order) {
  if (order.status === "SCHEDULED" || order.status === "COMPLETED") return true;
  if (order.invoice?.status === "PAID") return true;
  if (Array.isArray(order.invoices) && order.invoices.some((invoice) => invoice.status === "PAID")) {
    return true;
  }
  return false;
}

function deliverableHeadline(order) {
  const report = order.deliveryReport;
  if (report?.status === "APPROVED") return "Approved";
  if (report?.status === "SUBMITTED") return "Submitted for review";
  if (report?.status === "REVISION_REQUESTED") return "Needs changes";
  if (report?.status === "DRAFT") {
    return order.role === "CREATOR" ? "Draft in progress" : "Deliverable in progress";
  }
  if (isPaidBooking(order)) {
    return order.role === "CREATOR" ? "Add your deliverable" : "Awaiting deliverable";
  }
  return "Waiting for payment";
}

function stepDetails(order, step) {
  const paid = isPaidBooking(order);
  const report = order.deliveryReport;
  const paidInvoice =
    (Array.isArray(order.invoices) ? order.invoices : []).find((invoice) => invoice.status === "PAID") ||
    (order.invoice?.status === "PAID" ? order.invoice : null);

  switch (step) {
    case 0:
      return {
        title: "Opened",
        body: "This booking chat was opened so you could align on scope, price, and expectations.",
        meta: [
          { label: "Opened", value: format(new Date(order.createdAt), "MMM d, yyyy · h:mm a") },
          { label: "Brief", value: order.brief ? "Shared" : "Not added yet" },
        ],
      };
    case 1:
      return {
        title: "Booked",
        body: paid
          ? "Payment was confirmed and the booking is locked in for delivery."
          : "Once payment is made, this step becomes Booked and work can begin.",
        meta: [
          {
            label: "Payment",
            value: paidInvoice
              ? `Paid · ${moneyGhs(paidInvoice.amount)}`
              : paid
                ? "Confirmed"
                : "Not paid yet",
          },
          {
            label: "Confirmed",
            value:
              paid || order.status === "SCHEDULED" || order.status === "COMPLETED"
                ? format(new Date(order.updatedAt || order.createdAt), "MMM d, yyyy · h:mm a")
                : "Pending",
          },
        ],
      };
    case 2:
      return {
        title: "Deliverable",
        body:
          order.role === "CREATOR"
            ? "Submit proof of the agreed work here (checklist + link + notes)."
            : "The talent submits the agreed deliverable here for your review.",
        meta: [
          {
            label: "Status",
            value: report?.status
              ? String(report.status).replaceAll("_", " ").toLowerCase()
              : paid
                ? "Waiting for submit"
                : "Locked until payment",
          },
          {
            label: "Deadline",
            value: format(new Date(order.endTime), "MMM d, yyyy"),
          },
        ],
      };
    case 3:
      return {
        title: "Wrap-up",
        body: "After the deliverable is submitted, the client reviews it and can approve or request changes.",
        meta: [
          {
            label: "Submitted",
            value: report?.submittedAt
              ? format(new Date(report.submittedAt), "MMM d, yyyy · h:mm a")
              : "Not submitted yet",
          },
          {
            label: "Review",
            value:
              report?.status === "APPROVED"
                ? "Approved"
                : report?.status === "REVISION_REQUESTED"
                  ? "Changes requested"
                  : report?.status === "SUBMITTED"
                    ? "Awaiting client review"
                    : "Not started",
          },
        ],
      };
    case 4:
    default:
      return {
        title: "Completed",
        body: "The booking is closed after the deliverable is approved (or marked complete).",
        meta: [
          {
            label: "Status",
            value:
              order.status === "COMPLETED" || report?.status === "APPROVED"
                ? "Completed"
                : "Not completed yet",
          },
          {
            label: "Closed",
            value:
              order.status === "COMPLETED" || report?.reviewedAt
                ? format(new Date(report?.reviewedAt || order.updatedAt), "MMM d, yyyy · h:mm a")
                : "Pending",
          },
        ],
      };
  }
}

export function OrderDetail({ order, basePath }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState("");
  const [paying, setPaying] = useState(false);
  const cancelled = order.status === "CANCELLED";
  const index = progressIndex(order);
  const [selectedStep, setSelectedStep] = useState(index);
  const status = statusCopy(order, index);
  const reference = order.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const title = briefPreview(order.brief) || order.other.specialty || "Booking";
  const openInvoice = order.invoice?.status === "SENT" ? order.invoice : null;
  const paid = isPaidBooking(order);
  const selectedDetails = stepDetails(order, selectedStep);
  const fullyComplete =
    index === 4 && (order.status === "COMPLETED" || reportStatus(order) === "APPROVED");

  useEffect(() => {
    setSelectedStep(index);
  }, [index, order.id]);
  const canPayInvoice =
    order.role === "CLIENT" &&
    Boolean(openInvoice) &&
    order.status !== "CANCELLED" &&
    order.status !== "COMPLETED";
  const report = order.deliveryReport || null;
  const reportLocked = report?.status === "SUBMITTED" || report?.status === "APPROVED";
  const canSubmitDeliverable =
    order.role === "CREATOR" &&
    !cancelled &&
    isPaidBooking(order) &&
    !reportLocked;
  const canReviewDeliverable =
    order.role === "CLIENT" &&
    !cancelled &&
    report?.status === "SUBMITTED";
  const canWithdrawDeliverable =
    order.role === "CREATOR" &&
    !cancelled &&
    report?.status === "SUBMITTED";
  const canMarkComplete =
    order.role === "CREATOR" &&
    order.status === "SCHEDULED" &&
    report?.status === "APPROVED";

  const pay = async (invoiceId) => {
    setPaying(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: order.other.id,
          startTime: order.startTime,
          endTime: order.endTime,
          description: order.brief || undefined,
          invoiceId: invoiceId || openInvoice?.id || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not start payment.");
        return;
      }
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }
      toast.error("Payment link not received.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const run = async (name, action) => {
    setBusy(name);
    try {
      const formData = new FormData();
      formData.append("appointmentId", order.id);
      const result = await action(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(name === "complete" ? "Booking marked completed." : "Booking cancelled.");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "That did not go through.");
    } finally {
      setBusy("");
    }
  };

  const send = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending || cancelled) return;
    setSending(true);
    try {
      await sendBookingMessage(order.id, text);
      setDraft("");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Could not send that message.");
    } finally {
      setSending(false);
    }
  };

  const submitDeliverable = async (payload) => {
    setBusy("deliverable");
    try {
      const result = await sendBookingDeliveryReportInChat(order.id, payload);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.shared ? "Deliverable reshared" : "Deliverable submitted for review");
      setSelectedStep(3);
      router.refresh();
    } catch (error) {
      toast.error(error?.message || "Could not submit the deliverable.");
    } finally {
      setBusy("");
    }
  };

  const withdrawDeliverable = async () => {
    if (!report?.id || busy === "withdraw") return;
    setBusy("withdraw");
    try {
      await withdrawDeliveryReport(report.id);
      toast.success("Deliverable moved back to draft so you can edit it");
      setSelectedStep(2);
      router.refresh();
    } catch (error) {
      toast.error(error?.message || "Could not unlock that deliverable for editing.");
    } finally {
      setBusy("");
    }
  };

  const reviewDeliverable = async (decision, feedback = "") => {
    if (!report?.id) return;
    setBusy(decision === "APPROVED" ? "approve" : "revise");
    try {
      const result = await reviewBookingDeliveryReportInChat(order.id, report.id, {
        decision,
        feedback,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(decision === "APPROVED" ? "Deliverable approved" : "Revision requested");
      setSelectedStep(decision === "APPROVED" ? 4 : 2);
      router.refresh();
    } catch (error) {
      toast.error(error?.message || "Could not review that deliverable.");
    } finally {
      setBusy("");
    }
  };

  const timeline = [
    { at: order.createdAt, text: "Booking opened" },
    order.status === "SCHEDULED" || order.status === "COMPLETED"
      ? { at: order.updatedAt || order.startTime, text: "Booking confirmed" }
      : null,
    report?.submittedAt ? { at: report.submittedAt, text: "Deliverable submitted" } : null,
    report?.status === "REVISION_REQUESTED" && report?.reviewedAt
      ? { at: report.reviewedAt, text: "Revision requested" }
      : null,
    report?.status === "APPROVED" && report?.reviewedAt
      ? { at: report.reviewedAt, text: "Deliverable approved" }
      : null,
    order.status === "COMPLETED" ? { at: order.updatedAt, text: "Booking completed" } : null,
    order.status === "CANCELLED" ? { at: order.updatedAt, text: "Booking cancelled" } : null,
  ].filter(Boolean);

  return (
    <div className="-m-4 min-h-full bg-[#f7f8fc] p-4 text-slate-900 md:-m-6 md:p-6">
      <Link
        href={basePath}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{reference}</h1>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-slate-500">
                {order.other.name}
                {order.other.specialty ? ` · ${order.other.specialty}` : ""}
              </p>
            </div>
            <Link
              href={`/messages/${order.id}`}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#d5e2ff] bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </Link>
          </div>

          {cancelled ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">This booking was cancelled.</p>
          ) : (
            <>
              <ol className="relative grid grid-cols-5 px-1 pt-2">
                <span className="absolute left-[10%] right-[10%] top-[18px] h-px bg-slate-200" aria-hidden />
                {STEPS.map((step, stepNumber) => {
                  const done = stepNumber < index || (fullyComplete && stepNumber === index);
                  const current = stepNumber === index && !fullyComplete;
                  const selected = selectedStep === stepNumber;
                  const reachable = stepNumber <= index;
                  const when = stepWhen(order, stepNumber, index);
                  return (
                    <li key={step.key} className="relative flex flex-col items-center text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedStep(stepNumber)}
                        className="group relative z-[1] flex flex-col items-center rounded-xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6d28d9]/40"
                        aria-pressed={selected}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition ${
                            selected
                              ? "border-[#6d28d9] bg-[#6d28d9] text-white"
                              : done || current
                                ? "border-slate-950 bg-slate-950 text-white"
                                : "border-slate-200 bg-white text-slate-400 group-hover:border-slate-400"
                          }`}
                        >
                          {done ? <Check className="h-4 w-4" /> : stepNumber + 1}
                        </span>
                        <span
                          className={`mt-2 text-xs font-medium sm:text-sm ${
                            selected || current || done ? "text-slate-950" : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="mt-0.5 text-[11px] text-slate-400">
                          {when || (reachable ? "" : "Upcoming")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Step details</p>
                    <h2 className="mt-1 text-base font-semibold text-slate-950">{selectedDetails.title}</h2>
                  </div>
                  {selectedStep > index ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                      Upcoming
                    </span>
                  ) : selectedStep < index || fullyComplete ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      Done
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{selectedDetails.body}</p>
                <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                  {selectedDetails.meta.map((item) => (
                    <div key={item.label} className="rounded-xl bg-[#f7f8fc] px-3 py-2">
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        {item.label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-medium text-slate-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>

                {selectedStep === 2 && canSubmitDeliverable ? (
                  <div className="mt-4 rounded-2xl border border-[#e7e0ff] bg-[#fbfaff] p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-950">Add deliverable</p>
                    <DeliverableComposer
                      brief={order.brief}
                      existing={report}
                      sending={busy === "deliverable"}
                      onSubmit={submitDeliverable}
                    />
                  </div>
                ) : null}

                {selectedStep === 2 && canWithdrawDeliverable ? (
                  <div className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-[#f7f8fc] p-4">
                    <DeliverableSummary report={report} role={order.role} />
                    <button
                      type="button"
                      disabled={busy === "withdraw"}
                      onClick={withdrawDeliverable}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 disabled:opacity-50"
                    >
                      {busy === "withdraw" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Edit deliverable
                    </button>
                  </div>
                ) : null}

                {selectedStep === 3 && canReviewDeliverable ? (
                  <div className="mt-4 rounded-2xl border border-[#e7e0ff] bg-[#fbfaff] p-4">
                    <DeliverableReview
                      report={report}
                      reviewing={busy === "approve" || busy === "revise"}
                      onReview={reviewDeliverable}
                    />
                  </div>
                ) : null}

                {selectedStep === 3 && canWithdrawDeliverable ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy === "withdraw"}
                      onClick={withdrawDeliverable}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 disabled:opacity-50"
                    >
                      {busy === "withdraw" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Edit & resubmit
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          )}

          <div className="grid gap-3 rounded-[22px] bg-[#f3f0ff] p-3 md:grid-cols-3">
            <Tile
              icon={ClipboardList}
              label="Stage"
              value={STEPS[index]?.label || status.label}
              hint={status.label}
            />
            <Tile
              icon={Clock3}
              label="Deadline"
              value={format(new Date(order.endTime), "d MMM yyyy")}
              hint={deadlineHint(order.endTime)}
            />
            <Tile icon={FileText} label="Brief" value={title} hint="From client expectations" />
          </div>

          <section className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="flex min-h-[190px] flex-col justify-between rounded-2xl bg-[#16181f] p-4 text-white">
                <p className="text-xs font-medium uppercase tracking-wide text-white/50">Deliverable</p>
                <div>
                  <p className="text-lg font-semibold">{deliverableHeadline(order)}</p>
                  <p className="mt-1 text-sm text-white/70">
                    {order.status === "COMPLETED" || report?.status === "APPROVED"
                      ? "This booking is closed. You can still message for follow-up."
                      : order.role === "CREATOR"
                        ? "Share proof of what you delivered for this booking."
                        : paid
                          ? "Talent submits the agreed deliverable here for your review."
                          : "Payment unlocks the deliverable step for this booking."}
                  </p>
                  <p className="mt-1 text-xs text-white/50">with {order.other.name}</p>
                </div>
                <p className="text-xs text-white/50">{status.label}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Booking brief</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {order.brief || "No brief was added for this booking."}
                </p>
                {order.notes ? (
                  <p className="mt-3 rounded-xl bg-[#f7f8fc] px-3 py-2 text-sm leading-relaxed text-slate-600">
                    {order.notes}
                  </p>
                ) : null}
              </div>
            </div>

            {openInvoice ? (
              <div className="mt-4 rounded-2xl border border-[#dbe7ff] bg-[#f7f9ff] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-950">
                      Invoice
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-950">{openInvoice.title}</p>
                    {openInvoice.notes ? (
                      <p className="mt-1 text-sm text-slate-500">{openInvoice.notes}</p>
                    ) : null}
                    {openInvoice.lineItems?.length ? (
                      <ul className="mt-2 space-y-1">
                        {openInvoice.lineItems.map((item, i) => (
                          <li key={`${item.description}-${i}`} className="flex justify-between gap-3 text-xs text-slate-600">
                            <span>{item.description}</span>
                            <span className="font-medium tabular-nums text-slate-900">
                              {moneyGhs(item.amount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <p className="text-xl font-semibold tabular-nums text-slate-950">
                    {moneyGhs(openInvoice.amount)}
                  </p>
                </div>
                {canPayInvoice ? (
                  <button
                    type="button"
                    disabled={paying}
                    onClick={() => pay(openInvoice.id)}
                    className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Pay now · {moneyGhs(openInvoice.amount)}
                  </button>
                ) : null}
              </div>
            ) : null}

            {(canSubmitDeliverable || canReviewDeliverable || canWithdrawDeliverable || report) &&
            !cancelled ? (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-[#fbfaff] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-[#6d28d9]" />
                    <h3 className="text-sm font-semibold text-slate-950">
                      {canSubmitDeliverable
                        ? "Submit deliverable"
                        : canReviewDeliverable
                          ? "Review deliverable"
                          : "Deliverable"}
                    </h3>
                  </div>
                  {canWithdrawDeliverable ? (
                    <button
                      type="button"
                      disabled={busy === "withdraw"}
                      onClick={withdrawDeliverable}
                      className="text-xs font-semibold text-[#6d28d9] hover:underline disabled:opacity-50"
                    >
                      {busy === "withdraw" ? "Unlocking…" : "Edit deliverable"}
                    </button>
                  ) : null}
                </div>

                {canSubmitDeliverable ? (
                  <DeliverableComposer
                    brief={order.brief}
                    existing={report}
                    sending={busy === "deliverable"}
                    onSubmit={submitDeliverable}
                  />
                ) : null}

                {canReviewDeliverable ? (
                  <DeliverableReview
                    report={report}
                    reviewing={busy === "approve" || busy === "revise"}
                    onReview={reviewDeliverable}
                  />
                ) : null}

                {!canSubmitDeliverable && !canReviewDeliverable && report ? (
                  <DeliverableSummary report={report} role={order.role} />
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {canMarkComplete ? (
                <button
                  type="button"
                  disabled={busy === "complete"}
                  onClick={() => run("complete", markAppointmentCompleted)}
                  className="inline-flex h-11 items-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {busy === "complete" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Mark as complete
                </button>
              ) : null}
              {order.role === "CLIENT" && order.status === "REQUESTED" && !openInvoice ? (
                <button
                  type="button"
                  disabled={paying}
                  onClick={() => pay()}
                  className="h-11 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Pay for booking
                </button>
              ) : null}
              <Link
                href={`/messages/${order.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Link>
              {order.status === "REQUESTED" || order.status === "SCHEDULED" ? (
                <button
                  type="button"
                  disabled={busy === "cancel"}
                  onClick={() => {
                    if (window.confirm("Cancel this booking?")) run("cancel", cancelAppointment);
                  }}
                  className="h-11 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </section>

          <section className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-950">Order timeline</h2>
            <ul className="mt-4 space-y-4">
              {timeline.map((item) => (
                <li key={item.text} className="flex gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-950" />
                  <span>
                    <span className="block text-xs text-slate-400">{format(new Date(item.at), "MMM d, yyyy · h:mm a")}</span>
                    <span className="text-sm text-slate-800">{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">Conversation</h2>
              <Link href={`/messages/${order.id}`} className="text-sm font-medium text-slate-950">
                Open
              </Link>
            </div>
            <div className="max-h-[380px] space-y-4 overflow-y-auto pr-1">
              {order.messages.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">No messages on this booking yet.</p>
              ) : (
                order.messages.map((message) => (
                  <div key={message.id} className="flex gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700">
                      {message.mine ? "Y" : initials(order.other.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {message.mine ? "You" : order.other.name}
                        </p>
                        <p className="shrink-0 text-[11px] text-slate-400">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{message.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cancelled ? null : (
              <form onSubmit={send} className="mt-4 flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type a message..."
                  maxLength={2000}
                  className="h-11 flex-1 rounded-full border border-slate-200 bg-[#f7f8fc] px-4 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  aria-label="Send"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white disabled:opacity-40"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            )}
          </section>

          <section className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-950">Order summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="With" value={order.other.name} />
              <Row label="Status" value={status.label} />
              <Row label="Deadline" value={format(new Date(order.endTime), "d MMM yyyy")} />
              {order.invoice ? (
                <Row
                  label="Invoice"
                  value={`${order.invoice.status === "PAID" ? "Paid" : "Due"} · ${moneyGhs(order.invoice.amount)}`}
                />
              ) : order.agreedAmount != null ? (
                <Row label="Agreed" value={moneyGhs(order.agreedAmount)} />
              ) : null}
              <Row label="Opened" value={format(new Date(order.createdAt), "d MMM yyyy")} />
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

function DeliverableComposer({ brief, existing, sending, onSubmit }) {
  const seed = useMemo(() => {
    if (Array.isArray(existing?.checklist) && existing.checklist.length) {
      return existing.checklist.map((item) => ({ ...item, done: Boolean(item.done) }));
    }
    return checklistFromBrief(brief);
  }, [brief, existing]);
  const [items, setItems] = useState(seed);
  const [proofLink, setProofLink] = useState(existing?.proofLinks?.[0] || "");
  const [proofFiles, setProofFiles] = useState(() =>
    Array.isArray(existing?.proofFiles) ? existing.proofFiles : []
  );
  const [notes, setNotes] = useState(existing?.proofNotes || "");

  useEffect(() => {
    setItems(seed);
    setProofLink(existing?.proofLinks?.[0] || "");
    setProofFiles(Array.isArray(existing?.proofFiles) ? existing.proofFiles : []);
    setNotes(existing?.proofNotes || "");
  }, [seed, existing]);

  const allDone = items.length > 0 && items.every((item) => item.done);
  const hasProof = Boolean(proofLink.trim()) || proofFiles.length > 0;
  const canSubmit = hasProof && allDone;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit || sending) return;
        onSubmit({
          proofLink,
          proofFiles,
          notes,
          checklist: items,
        });
      }}
      className="space-y-3"
    >
      {existing?.status === "REVISION_REQUESTED" && existing?.clientFeedback ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Client feedback: {existing.clientFeedback}
        </p>
      ) : null}
      <div>
        <p className="text-xs font-semibold text-slate-600">Checklist from brief</p>
        <ul className="mt-2 max-h-44 space-y-1.5 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() =>
                  setItems((prev) =>
                    prev.map((row) => (row.id === item.id ? { ...row, done: !row.done } : row))
                  )
                }
                className={`flex w-full items-start gap-2 rounded-xl border px-2.5 py-2 text-left text-xs ${
                  item.done
                    ? "border-emerald-100 bg-emerald-50/70 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <CheckCircle2
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                    item.done ? "text-emerald-600" : "text-slate-300"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600">Upload files</p>
        {proofFiles.length > 0 ? (
          <ul className="space-y-2">
            {proofFiles.map((file) => {
              const isImage = String(file.type || "").startsWith("image/");
              const sizeLabel = formatBytes(file.size);
              return (
                <li
                  key={file.url}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                >
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.url}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200">
                      <FileText className="h-4 w-4" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-sm font-medium text-slate-950 hover:underline"
                    >
                      {file.name || "File"}
                    </a>
                    <p className="text-[11px] text-slate-400">
                      {[file.type, sizeLabel].filter(Boolean).join(" · ") || "Uploaded file"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setProofFiles((prev) => prev.filter((row) => row.url !== file.url))
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Remove file"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-slate-400">No files uploaded yet.</p>
        )}
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Upload className="h-3.5 w-3.5" />
            Images, PDF, or video · up to 16MB (video 64MB)
          </div>
          <UploadButton
            endpoint="deliveryProof"
            appearance={{
              container: "w-auto items-start",
              button:
                "h-9 rounded-full bg-slate-950 px-4 text-xs font-semibold text-white ut-ready:bg-slate-950 ut-uploading:bg-slate-700",
              allowedContent: "text-[11px] text-slate-400",
            }}
            onClientUploadComplete={(res) => {
              const uploaded = parseUploadFiles(res);
              if (!uploaded.length) {
                toast.error("Upload finished but file URL was missing");
                return;
              }
              setProofFiles((prev) => {
                const seen = new Set(prev.map((file) => file.url));
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
                uploaded.length === 1 ? "File uploaded" : `${uploaded.length} files uploaded`
              );
            }}
            onUploadError={(err) => {
              console.error(err);
              toast.error(err?.message || "Could not upload that file.");
            }}
          />
        </div>
      </div>

      <label className="block text-xs text-slate-500">
        Proof link <span className="text-slate-400">(optional if you uploaded files)</span>
        <input
          value={proofLink}
          onChange={(event) => setProofLink(event.target.value)}
          placeholder="https://…"
          className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#6d28d9]"
        />
      </label>
      <label className="block text-xs text-slate-500">
        Notes for the client
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="What you delivered and where to find it"
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#6d28d9]"
        />
      </label>
      <button
        type="submit"
        disabled={sending || !canSubmit}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-40"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Submit for review
      </button>
    </form>
  );
}

function DeliverableReview({ report, reviewing, onReview }) {
  const [askRevision, setAskRevision] = useState(false);
  const [feedback, setFeedback] = useState("");

  return (
    <div className="space-y-3">
      <DeliverableSummary report={report} role="CLIENT" />
      {askRevision ? (
        <div className="space-y-2">
          <textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="What needs to change?"
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#6d28d9]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={reviewing || !feedback.trim()}
              onClick={() => onReview("REVISION_REQUESTED", feedback)}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-amber-600 text-sm font-semibold text-white disabled:opacity-40"
            >
              {reviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request changes"}
            </button>
            <button
              type="button"
              onClick={() => setAskRevision(false)}
              className="h-10 rounded-full px-4 text-sm font-semibold text-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={reviewing}
            onClick={() => onReview("APPROVED")}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-600 text-sm font-semibold text-white disabled:opacity-40"
          >
            {reviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Approve
          </button>
          <button
            type="button"
            disabled={reviewing}
            onClick={() => setAskRevision(true)}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-40"
          >
            Request changes
          </button>
        </div>
      )}
    </div>
  );
}

function DeliverableSummary({ report, role = "CLIENT" }) {
  if (!report) return null;
  const done = Array.isArray(report.checklist)
    ? report.checklist.filter((item) => item.done).length
    : 0;
  const total = Array.isArray(report.checklist) ? report.checklist.length : 0;
  const reportHref =
    role === "CREATOR" ? `/creator/reports/${report.id}` : `/client/reports/${report.id}`;
  return (
    <div className="space-y-2 text-sm text-slate-700">
      <p className="font-medium text-slate-950">{report.title || "Delivery report"}</p>
      <p className="text-xs text-slate-500">
        Status: {String(report.status || "").replaceAll("_", " ").toLowerCase()}
        {total ? ` · Checklist ${done}/${total}` : ""}
      </p>
      {report.proofNotes ? (
        <p className="whitespace-pre-wrap rounded-xl bg-white px-3 py-2 text-xs leading-relaxed text-slate-600">
          {report.proofNotes}
        </p>
      ) : null}
      {report.proofLinks?.length ? (
        <ul className="space-y-1">
          {report.proofLinks.map((link) => (
            <li key={link}>
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="break-all text-xs font-medium text-[#6d28d9] hover:underline"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {report.proofFiles?.length ? (
        <ul className="space-y-2">
          {report.proofFiles.map((file) => {
            const isImage = String(file.type || "").startsWith("image/");
            const sizeLabel = formatBytes(file.size);
            return (
              <li
                key={file.url}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2"
              >
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.url}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-xs font-medium text-slate-950 hover:underline"
                  >
                    {file.name || "File"}
                  </a>
                  <p className="text-[10px] text-slate-400">
                    {[file.type, sizeLabel].filter(Boolean).join(" · ") || "Uploaded file"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      {report.clientFeedback ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Feedback: {report.clientFeedback}
        </p>
      ) : null}
      {report.id ? (
        <Link href={reportHref} className="text-xs font-semibold text-[#6d28d9] hover:underline">
          Open full report
        </Link>
      ) : null}
    </div>
  );
}

function Tile({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Icon className="h-3.5 w-3.5 text-[#6d5efc]" />
        {label}
      </div>
      <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-950">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="truncate font-medium text-slate-900">{value}</dd>
    </div>
  );
}
