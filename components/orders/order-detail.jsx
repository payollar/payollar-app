"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock3,
  FileText,
  Loader2,
  MessageCircle,
  Send,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { sendBookingMessage } from "@/actions/booking-chat";
import { cancelAppointment, markAppointmentCompleted } from "@/actions/doctor";
import { generateVideoToken } from "@/actions/appointments";

const STEPS = [
  { key: "opened", label: "Opened" },
  { key: "booked", label: "Booked" },
  { key: "session", label: "Session" },
  { key: "wrap", label: "Wrap-up" },
  { key: "done", label: "Completed" },
];

function progressIndex(order) {
  const now = Date.now();
  const start = new Date(order.startTime).getTime();
  const end = new Date(order.endTime).getTime();
  if (order.status === "COMPLETED") return 4;
  if (order.status === "SCHEDULED" && now >= end) return 3;
  if (order.status === "SCHEDULED" && now >= start) return 2;
  if (order.status === "SCHEDULED") return 1;
  return 0;
}

function statusCopy(order, index) {
  if (order.status === "CANCELLED") return { label: "Cancelled", className: "bg-rose-50 text-rose-600" };
  if (order.status === "COMPLETED") return { label: "Completed", className: "bg-emerald-50 text-emerald-700" };
  if (index === 3) return { label: "Ready to complete", className: "bg-amber-50 text-amber-700" };
  if (index === 2) return { label: "In session", className: "bg-[#e8f0ff] text-[#0b3db8]" };
  if (index === 1) return { label: "Booked", className: "bg-[#e8f0ff] text-[#0b3db8]" };
  return { label: "Chat open", className: "bg-[#e8f0ff] text-[#0b3db8]" };
}

function stepWhen(order, step, index) {
  if (step > index || order.status === "CANCELLED") return "";
  if (step === 0) return format(new Date(order.createdAt), "MMM d");
  if (step === 2) return format(new Date(order.startTime), "MMM d");
  if (step === 3) return format(new Date(order.endTime), "MMM d");
  if (step === 4) return format(new Date(order.updatedAt), "MMM d");
  return "";
}

function canJoin(order) {
  if (order.status !== "SCHEDULED") return false;
  const now = Date.now();
  const start = new Date(order.startTime).getTime();
  const end = new Date(order.endTime).getTime();
  return now >= start - 30 * 60 * 1000 && now <= end;
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
  if (diff <= 0) return "Session time has passed";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

export function OrderDetail({ order, basePath }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState("");
  const cancelled = order.status === "CANCELLED";
  const index = progressIndex(order);
  const status = statusCopy(order, index);
  const reference = order.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const minutes = Math.max(
    1,
    Math.round((new Date(order.endTime).getTime() - new Date(order.startTime).getTime()) / 60000)
  );
  const title = order.brief || order.other.specialty || "Session";

  const pay = async () => {
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: order.other.id,
          startTime: order.startTime,
          endTime: order.endTime,
          description: order.brief || undefined,
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
      if (name === "video" && result?.videoSessionId && result?.token) {
        router.push(
          `/video-call?sessionId=${result.videoSessionId}&token=${result.token}&appointmentId=${order.id}`
        );
        return;
      }
      toast.success(name === "complete" ? "Session marked completed." : "Booking cancelled.");
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

  const timeline = [
    { at: order.createdAt, text: "Booking opened" },
    order.status === "SCHEDULED" || order.status === "COMPLETED"
      ? { at: order.startTime, text: "Session time" }
      : null,
    order.status === "COMPLETED" ? { at: order.updatedAt, text: "Marked completed" } : null,
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
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#d5e2ff] bg-white px-4 text-sm font-semibold text-[#0b3db8] shadow-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </Link>
          </div>

          {cancelled ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">This booking was cancelled.</p>
          ) : (
            <ol className="relative grid grid-cols-5 px-1 pt-2">
              <span className="absolute left-[10%] right-[10%] top-[18px] h-px bg-slate-200" aria-hidden />
              {STEPS.map((step, stepNumber) => {
                const done = stepNumber < index;
                const current = stepNumber === index;
                const when = stepWhen(order, stepNumber, index);
                return (
                  <li key={step.key} className="relative flex flex-col items-center text-center">
                    <span
                      className={`z-[1] flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold ${
                        done || current
                          ? "border-[#0055ff] bg-[#0055ff] text-white"
                          : "border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : stepNumber + 1}
                    </span>
                    <span className={`mt-2 text-xs font-medium sm:text-sm ${current || done ? "text-slate-950" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-400">{when}</span>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="grid gap-3 rounded-[22px] bg-[#f3f0ff] p-3 md:grid-cols-3">
            <Tile
              icon={Calendar}
              label="Session"
              value={format(new Date(order.startTime), "EEE, d MMM yyyy")}
              hint={`${format(new Date(order.startTime), "h:mm a")} – ${format(new Date(order.endTime), "h:mm a")}`}
            />
            <Tile
              icon={Clock3}
              label="Deadline"
              value={format(new Date(order.endTime), "d MMM yyyy")}
              hint={deadlineHint(order.endTime)}
            />
            <Tile icon={FileText} label="Request" value={title} hint={`${minutes} min session`} />
          </div>

          <section className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="flex min-h-[190px] flex-col justify-between rounded-2xl bg-[#16181f] p-4 text-white">
                <p className="text-xs font-medium uppercase tracking-wide text-white/50">Session</p>
                <div>
                  <p className="text-lg font-semibold">{format(new Date(order.startTime), "h:mm a")}</p>
                  <p className="mt-1 text-sm text-white/70">{format(new Date(order.startTime), "EEEE, d MMMM")}</p>
                  <p className="mt-1 text-xs text-white/50">{minutes} minutes with {order.other.name}</p>
                </div>
                {order.status === "SCHEDULED" ? (
                  <button
                    type="button"
                    disabled={!canJoin(order) || busy === "video"}
                    onClick={() => run("video", generateVideoToken)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-slate-950 disabled:opacity-60"
                  >
                    {busy === "video" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                    {canJoin(order) ? "Join session" : "Opens 30 min before"}
                  </button>
                ) : (
                  <p className="text-xs text-white/50">{status.label}</p>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Booking message</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {order.brief || "No brief was added for this session."}
                </p>
                {order.notes ? (
                  <p className="mt-3 rounded-xl bg-[#f7f8fc] px-3 py-2 text-sm leading-relaxed text-slate-600">
                    {order.notes}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {order.role === "CREATOR" && order.status === "SCHEDULED" && Date.now() >= new Date(order.endTime).getTime() ? (
                <button
                  type="button"
                  disabled={busy === "complete"}
                  onClick={() => run("complete", markAppointmentCompleted)}
                  className="inline-flex h-11 items-center rounded-full bg-[#0055ff] px-5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {busy === "complete" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Mark as complete
                </button>
              ) : null}
              {order.role === "CLIENT" && order.status === "REQUESTED" ? (
                <button type="button" onClick={pay} className="h-11 rounded-full bg-[#0055ff] px-5 text-sm font-semibold text-white">
                  Pay for session
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
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#0055ff]" />
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
              <Link href={`/messages/${order.id}`} className="text-sm font-medium text-[#0055ff]">
                Open
              </Link>
            </div>
            <div className="max-h-[380px] space-y-4 overflow-y-auto pr-1">
              {order.messages.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">No messages on this booking yet.</p>
              ) : (
                order.messages.map((message) => (
                  <div key={message.id} className="flex gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-[11px] font-semibold text-[#0b3db8]">
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
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{message.body}</p>
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
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0055ff] text-white disabled:opacity-40"
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
              <Row label="Length" value={`${minutes} min`} />
              <Row label="Opened" value={format(new Date(order.createdAt), "d MMM yyyy")} />
            </dl>
          </section>
        </aside>
      </div>
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
