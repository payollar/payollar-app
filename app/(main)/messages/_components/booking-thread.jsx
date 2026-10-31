"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { format, isToday } from "date-fns";
import { ArrowLeft, Calendar, Loader2, MessageCircle, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { getBookingThread, sendBookingMessage } from "@/actions/booking-chat";

function statusLabel(status) {
  if (status === "REQUESTED") return "Chat open";
  if (status === "SCHEDULED") return "Booked";
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED") return "Cancelled";
  return "Session";
}

function statusClass(status, active) {
  if (active) return "bg-white/20 text-white";
  if (status === "REQUESTED") return "bg-[#6d28d9]/20 text-[#ddd6fe]";
  if (status === "SCHEDULED") return "bg-emerald-400/15 text-emerald-200";
  if (status === "CANCELLED") return "bg-rose-400/15 text-rose-200";
  return "bg-white/10 text-white/70";
}

function profileHref(person) {
  const specialty = person?.specialty?.trim();
  if (!person?.id || !specialty) return null;
  return `/talents/${encodeURIComponent(specialty)}/${person.id}`;
}

function Avatar({ person, className = "h-10 w-10" }) {
  const name = person?.name || "?";
  if (person?.imageUrl) {
    return <img src={person.imageUrl} alt="" className={`${className} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span className={`${className} inline-flex shrink-0 items-center justify-center rounded-full bg-[#6d28d9] text-sm font-semibold text-white`}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function whenLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return isToday(date) ? format(date, "h:mm a") : format(date, "MMM d");
}

export function MessagesWorkspace({ chats = [], appointmentId = null, initialThread = null }) {
  const [thread, setThread] = useState(initialThread);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    setThread(initialThread);
    setDraft("");
  }, [initialThread, appointmentId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages?.length, appointmentId]);

  useEffect(() => {
    if (!appointmentId) return undefined;
    let active = true;
    const refresh = async () => {
      try {
        const next = await getBookingThread(appointmentId);
        if (active && next && !next.error) setThread(next);
      } catch {
        // Keep the thread that is already on screen.
      }
    };
    const timer = setInterval(refresh, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [appointmentId]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return chats;
    return chats.filter((chat) => (chat.other?.name || "").toLowerCase().includes(needle));
  }, [chats, query]);

  const unreadTotal = chats.reduce((sum, chat) => sum + (chat.unread || 0), 0);

  const payForSession = async () => {
    if (!thread?.pay) return;
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: thread.pay.doctorId,
          startTime: thread.pay.startTime,
          endTime: thread.pay.endTime,
          description: thread.pay.description || undefined,
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

  const onSubmit = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending || !thread?.canSend || !appointmentId) return;
    setSending(true);
    try {
      await sendBookingMessage(appointmentId, text);
      setDraft("");
      const next = await getBookingThread(appointmentId);
      if (next && !next.error) setThread(next);
    } catch (error) {
      toast.error(error.message || "Could not send that message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="-m-4 flex min-h-0 flex-1 gap-3 bg-[#f4f6fb] p-3 md:-m-6 md:p-4">
      <aside className={`${appointmentId ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col rounded-[1.6rem] bg-[#12141c] p-3 text-white md:w-[300px]`}>
        <div className="px-2 pb-3 pt-1">
          <p className="text-lg font-semibold tracking-tight">Messages</p>
          <p className="mt-0.5 text-xs text-white/50">
            {chats.length} {chats.length === 1 ? "chat" : "chats"}
            {unreadTotal > 0 ? ` · ${unreadTotal} unread` : ""}
          </p>
        </div>
        <label className="mb-3 flex h-10 items-center gap-2 rounded-full bg-white/10 px-3 text-white/70">
          <Search className="h-4 w-4 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
        </label>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {shown.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-white/50">
              {chats.length === 0 ? "No booking chats yet." : "No one matches that name."}
            </p>
          ) : (
            shown.map((chat) => {
              const active = chat.appointmentId === appointmentId;
              return (
                <Link
                  key={chat.appointmentId}
                  href={`/messages/${chat.appointmentId}`}
                  className={`flex items-center gap-3 rounded-2xl px-2.5 py-2.5 ${active ? "bg-[#6d28d9]" : "hover:bg-white/10"}`}
                >
                  <Avatar person={chat.other} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{chat.other?.name || "Booking"}</span>
                      <span className={`shrink-0 text-[10px] ${active ? "text-white/70" : "text-white/40"}`}>
                        {chat.lastMessage ? whenLabel(chat.lastMessage.createdAt) : ""}
                      </span>
                    </span>
                    <span className={`mt-0.5 block truncate text-xs ${active ? "text-white/80" : "text-white/50"}`}>
                      {chat.other?.specialty || "Session"}
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-2">
                      <span className={`truncate text-xs ${active ? "text-white/75" : "text-white/45"}`}>
                        {chat.lastMessage ? `${chat.lastMessage.mine ? "You: " : ""}${chat.lastMessage.body}` : "No messages yet"}
                      </span>
                      {chat.unread > 0 ? (
                        <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#6d28d9]">{chat.unread}</span>
                      ) : (
                        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusClass(chat.appointmentStatus, active)}`}>
                          {statusLabel(chat.appointmentStatus)}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </aside>

      <section className={`${appointmentId ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col overflow-hidden rounded-[1.6rem] bg-white`}>
        {thread && appointmentId ? (
          <ThreadPane
            thread={thread}
            onSubmit={onSubmit}
            draft={draft}
            setDraft={setDraft}
            sending={sending}
            endRef={endRef}
            onPay={payForSession}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <MessageCircle className="h-8 w-8 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-900">Pick a conversation</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">Chats here are between you and the other person on a booking.</p>
          </div>
        )}
      </section>

      {thread && appointmentId ? (
        <aside className="hidden w-[280px] shrink-0 flex-col gap-3 xl:flex">
          <SessionCard thread={thread} onPay={payForSession} />
        </aside>
      ) : null}
    </div>
  );
}

function ThreadPane({ thread, onSubmit, draft, setDraft, sending, endRef, onPay }) {
  const href = profileHref(thread.other);
  let lastDay = "";

  return (
    <>
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <Link href="/messages" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 md:hidden" aria-label="All messages">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Avatar person={thread.other} className="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-950">{thread.other?.name || "Booking chat"}</p>
          <p className="truncate text-xs text-slate-500">
            {thread.other?.specialty ? `${thread.other.specialty} · ` : ""}
            {format(new Date(thread.appointment.startTime), "MMM d, yyyy · h:mm a")}
          </p>
        </div>
        <span className="hidden rounded-full bg-[#f3eefe] px-2.5 py-1 text-xs font-semibold text-[#5b21b6] sm:inline">
          {statusLabel(thread.appointment.status)}
        </span>
        {href ? (
          <Link href={href} className="hidden rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#6d28d9] sm:inline">
            Profile
          </Link>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f7f8fb] px-4 py-4">
        {thread.messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">Say hello and share anything they should know before the session.</p>
        ) : (
          thread.messages.map((message) => {
            const day = format(new Date(message.createdAt), "yyyy-MM-dd");
            const showDay = day !== lastDay;
            lastDay = day;
            return (
              <div key={message.id}>
                {showDay ? (
                  <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    {isToday(new Date(message.createdAt)) ? "Today" : format(new Date(message.createdAt), "MMM d, yyyy")}
                  </p>
                ) : null}
                <div className={message.mine ? "flex justify-end" : "flex items-end gap-2"}>
                  {message.mine ? null : <Avatar person={thread.other} className="h-7 w-7" />}
                  <div
                    className={
                      message.mine
                        ? "max-w-[78%] rounded-2xl rounded-br-md bg-[#16181f] px-3 py-2 text-sm text-white"
                        : "max-w-[78%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
                    }
                  >
                    <p className="whitespace-pre-wrap">{message.body}</p>
                    <p className={message.mine ? "mt-1 text-[10px] text-white/50" : "mt-1 text-[10px] text-slate-400"}>
                      {format(new Date(message.createdAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {thread.canPay ? (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-2.5 xl:hidden">
          <p className="text-xs text-slate-500">This session is not paid yet.</p>
          <button type="button" onClick={onPay} className="shrink-0 rounded-full bg-[#6d28d9] px-3 py-1.5 text-xs font-semibold text-white">
            Pay
          </button>
        </div>
      ) : null}

      {thread.canSend ? (
        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Enter message"
            maxLength={2000}
            className="h-11 flex-1 rounded-full border border-slate-200 bg-[#f7f8fb] px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#6d28d9]"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Send"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#6d28d9] text-white disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      ) : (
        <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">This booking was cancelled, so new messages are closed.</p>
      )}
    </>
  );
}

function SessionCard({ thread, onPay }) {
  const href = profileHref(thread.other);
  const brief = thread.appointment.clientDescription?.trim();
  return (
    <div className="rounded-[1.6rem] bg-white p-4">
      <div className="flex items-center gap-3">
        <Avatar person={thread.other} className="h-12 w-12" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-950">{thread.other?.name || "Booking"}</p>
          <p className="truncate text-xs text-slate-500">{thread.other?.specialty || "Session"}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-start gap-2 text-slate-600">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#6d28d9]" />
          <div>
            <dt className="text-xs text-slate-400">Session</dt>
            <dd className="font-medium text-slate-900">{format(new Date(thread.appointment.startTime), "EEE, MMM d · h:mm a")}</dd>
            <dd className="text-xs text-slate-500">until {format(new Date(thread.appointment.endTime), "h:mm a")}</dd>
          </div>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Status</dt>
          <dd className="mt-1 inline-flex rounded-full bg-[#f3eefe] px-2.5 py-1 text-xs font-semibold text-[#5b21b6]">
            {statusLabel(thread.appointment.status)}
          </dd>
        </div>
        {brief ? (
          <div>
            <dt className="text-xs text-slate-400">Project brief</dt>
            <dd className="mt-1 text-sm leading-relaxed text-slate-700">{brief}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-4 flex flex-col gap-2">
        {href ? (
          <Link href={href} className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-800 hover:border-[#6d28d9]">
            View profile
          </Link>
        ) : null}
        {thread.canPay ? (
          <button type="button" onClick={onPay} className="inline-flex h-10 items-center justify-center rounded-full bg-[#6d28d9] text-sm font-semibold text-white hover:bg-[#5b21b6]">
            Pay with Paystack
          </button>
        ) : null}
      </div>
    </div>
  );
}
