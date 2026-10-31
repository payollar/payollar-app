"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Check, Loader2, MessageCircle, Send, Video } from "lucide-react";
import { toast } from "sonner";
import { sendBookingMessage } from "@/actions/booking-chat";
import { cancelAppointment, markAppointmentCompleted } from "@/actions/doctor";
import { generateVideoToken } from "@/actions/appointments";

const STEPS = [
  { key: "chat", label: "Chat open" },
  { key: "booked", label: "Booked" },
  { key: "session", label: "Session" },
  { key: "done", label: "Completed" },
];

function stepIndex(order) {
  const now = Date.now();
  const start = new Date(order.startTime).getTime();
  if (order.status === "COMPLETED") return 3;
  if (order.status === "SCHEDULED" && now >= start) return 2;
  if (order.status === "SCHEDULED") return 1;
  return 0;
}

function canJoin(order) {
  if (order.status !== "SCHEDULED") return false;
  const now = Date.now();
  const start = new Date(order.startTime).getTime();
  const end = new Date(order.endTime).getTime();
  return now >= start - 30 * 60 * 1000 && now <= end;
}

export function OrderDetail({ order, basePath }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState("");
  const cancelled = order.status === "CANCELLED";
  const index = stepIndex(order);
  const reference = order.id.replace(/-/g, "").slice(0, 8).toUpperCase();

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
        router.push(`/video-call?sessionId=${result.videoSessionId}&token=${result.token}&appointmentId=${order.id}`);
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
    { at: order.startTime, text: "Session time" },
    order.status === "COMPLETED" ? { at: order.updatedAt, text: "Marked completed" } : null,
    order.status === "CANCELLED" ? { at: order.updatedAt, text: "Cancelled" } : null,
  ].filter(Boolean);

  return (
    <div className="-m-4 min-h-full bg-[#f4f6fb] p-4 text-slate-900 md:-m-6 md:p-5">
      <Link href={basePath} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{reference}</p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cancelled ? "bg-rose-50 text-rose-600" : "bg-[#e8f0ff] text-[#0b3db8]"}`}>
              {cancelled ? "Cancelled" : STEPS[index].label}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">{order.other.name}</h1>
          <p className="text-sm text-slate-500">{order.other.specialty || "Session"}</p>
        </div>
        <Link
          href={`/messages/${order.id}`}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#c9d8ff] bg-white px-4 text-sm font-semibold text-[#0b3db8]"
        >
          <MessageCircle className="h-4 w-4" />
          Open chat
        </Link>
      </div>

      {cancelled ? (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">This booking was cancelled.</p>
      ) : (
        <ol className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {STEPS.map((step, stepNumber) => {
            const done = stepNumber < index;
            const current = stepNumber === index;
            return (
              <li key={step.key} className="rounded-2xl bg-white px-3 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <span
                  className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    done || current ? "bg-[#0055ff] text-white" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : stepNumber + 1}
                </span>
                <p className={`text-sm font-medium ${current || done ? "text-slate-950" : "text-slate-400"}`}>{step.label}</p>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Info label="Session" value={format(new Date(order.startTime), "EEE, d MMM yyyy")} hint={`${format(new Date(order.startTime), "h:mm a")} – ${format(new Date(order.endTime), "h:mm a")}`} />
            <Info label="Brief" value={order.brief || "No brief yet"} />
            <Info label="With" value={order.other.name} hint={order.other.specialty || "Payollar session"} />
          </div>

          <section className="rounded-2xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-950">Session notes</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {order.brief || "The client has not added a brief for this session."}
            </p>
            {order.notes ? <p className="mt-3 text-sm leading-relaxed text-slate-600">{order.notes}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {order.role === "CLIENT" && order.status === "REQUESTED" ? (
                <button type="button" onClick={pay} className="h-10 rounded-full bg-[#0055ff] px-4 text-sm font-semibold text-white">
                  Pay for session
                </button>
              ) : null}
              {order.status === "SCHEDULED" ? (
                <button
                  type="button"
                  disabled={!canJoin(order) || busy === "video"}
                  onClick={() => run("video", generateVideoToken)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 disabled:opacity-50"
                >
                  {busy === "video" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                  {canJoin(order) ? "Join session" : "Join opens 30 minutes before"}
                </button>
              ) : null}
              {order.role === "CREATOR" && order.status === "SCHEDULED" && Date.now() >= new Date(order.endTime).getTime() ? (
                <button
                  type="button"
                  disabled={busy === "complete"}
                  onClick={() => run("complete", markAppointmentCompleted)}
                  className="h-10 rounded-full bg-[#0055ff] px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Mark as complete
                </button>
              ) : null}
              {order.status === "REQUESTED" || order.status === "SCHEDULED" ? (
                <button
                  type="button"
                  disabled={busy === "cancel"}
                  onClick={() => {
                    if (window.confirm("Cancel this booking?")) run("cancel", cancelAppointment);
                  }}
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-950">Timeline</h2>
            <ul className="mt-3 space-y-3">
              {timeline.map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0055ff]" />
                  <span>
                    <span className="block text-xs text-slate-400">{format(new Date(item.at), "d MMM yyyy · h:mm a")}</span>
                    <span className="text-slate-800">{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-950">Conversation</h2>
            <Link href={`/messages/${order.id}`} className="text-sm font-medium text-[#0055ff]">
              Full chat
            </Link>
          </div>
          <div className="max-h-[420px] space-y-3 overflow-y-auto">
            {order.messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No messages yet.</p>
            ) : (
              order.messages.map((message) => (
                <div key={message.id} className={message.mine ? "text-right" : ""}>
                  <p className={`inline-block max-w-[90%] rounded-2xl px-3 py-2 text-left text-sm ${message.mine ? "bg-[#16181f] text-white" : "bg-[#f4f6fb] text-slate-800"}`}>
                    {message.body}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">{format(new Date(message.createdAt), "h:mm a")}</p>
                </div>
              ))
            )}
          </div>
          {cancelled ? null : (
            <form onSubmit={send} className="mt-3 flex items-center gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a message..."
                maxLength={2000}
                className="h-10 flex-1 rounded-full border border-slate-200 bg-[#f7f8fb] px-3 text-sm outline-none"
              />
              <button type="submit" disabled={sending || !draft.trim()} aria-label="Send" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0055ff] text-white disabled:opacity-40">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
