"use client";

import { Component, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { format, isToday } from "date-fns";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Loader2,
  MessageCircle,
  Package,
  Plus,
  Receipt,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBookingThread,
  saveClientProjectBrief,
  sendBookingInvoice,
  sendBookingMessage,
} from "@/actions/booking-chat";
import { startLogisticsFromAppointment } from "@/actions/logistics";
import { parseBriefFields } from "@/lib/booking-brief";
import { MediaNegotiateWorkspace } from "@/app/(main)/client/_components/media-negotiate";

function moneyGhs(value) {
  const amount = Number(value);
  const safe = Number.isFinite(amount) ? amount : 0;
  return `GH₵ ${safe.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Detect legacy / system payment notice messages posted after Paystack fulfill. */
function parsePaymentConfirmed(body) {
  const text = String(body || "").trim();
  if (!/^Payment confirmed/i.test(text)) return null;
  const amountMatch = text.match(/GH₵\s*([\d,]+(?:\.\d+)?)/i);
  const refMatch = text.match(/\(ref\s+([^)]+)\)/i);
  return {
    amountLabel: amountMatch ? `GH₵ ${amountMatch[1]}` : null,
    reference: refMatch ? String(refMatch[1]).trim() : null,
  };
}

function toValidDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function safeTimeLabel(value) {
  try {
    const date = toValidDate(value);
    if (!date) return "";
    return format(date, "h:mm a");
  } catch {
    return "";
  }
}

function safeDayKey(value) {
  try {
    const date = toValidDate(value);
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  } catch {
    return "";
  }
}

function safeDayHeading(value) {
  try {
    const date = toValidDate(value);
    if (!date) return "";
    return isToday(date) ? "Today" : format(date, "MMM d, yyyy");
  } catch {
    return "";
  }
}

function safeSessionWhen(startTime) {
  try {
    const date = toValidDate(startTime);
    if (!date) return "";
    return format(date, "MMM d, yyyy · h:mm a");
  } catch {
    return "";
  }
}

function safeParseBrief(body) {
  try {
    return parseBriefFields(body || "");
  } catch {
    const text = String(body || "").trim();
    return { want: text, expect: "", timing: "", notes: "" };
  }
}

/** Keeps one bad chat card from blanking the whole messages page. */
class MessageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("Booking message card failed:", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
          {this.props.fallback || "Couldn’t display this message."}
        </div>
      );
    }
    return this.props.children;
  }
}

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

function mediaStatusLabel(status) {
  if (status === "DISCOUNT_REQUESTED") return "Discount pending";
  if (status === "COUNTERED") return "Countered";
  if (status === "ACCEPTED") return "Agreed";
  if (status === "REJECTED") return "Declined";
  if (status === "CLOSED") return "Closed";
  return "Media deal";
}

function mediaStatusClass(status, active) {
  if (active) return "bg-white/20 text-white";
  if (status === "DISCOUNT_REQUESTED") return "bg-amber-400/15 text-amber-100";
  if (status === "COUNTERED") return "bg-sky-400/15 text-sky-100";
  if (status === "ACCEPTED") return "bg-emerald-400/15 text-emerald-200";
  if (status === "REJECTED") return "bg-rose-400/15 text-rose-200";
  return "bg-white/10 text-white/70";
}

function chatHref(chat) {
  if (chat?.href) return chat.href;
  if (chat?.threadType === "MEDIA" && chat?.negotiationId) {
    return `/messages/media/${chat.negotiationId}`;
  }
  return `/messages/${chat.appointmentId}`;
}

function chatKey(chat) {
  if (chat?.threadType === "MEDIA") return `media:${chat.negotiationId}`;
  return `booking:${chat.appointmentId}`;
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

export function MessagesWorkspace({
  chats = [],
  appointmentId = null,
  negotiationId = null,
  initialThread = null,
  initialNegotiation = null,
  negotiationPerspective = "CLIENT",
  fromCart = false,
  cartItemId = "",
}) {
  const [thread, setThread] = useState(initialThread);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [sendingBrief, setSendingBrief] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [reviewingReportId, setReviewingReportId] = useState(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [query, setQuery] = useState("");
  const endRef = useRef(null);
  const isMediaThread = Boolean(negotiationId && initialNegotiation);

  useEffect(() => {
    setThread(initialThread);
    setDraft("");
    setInvoiceOpen(false);
    setBriefOpen(false);
    setReportOpen(false);
  }, [initialThread, appointmentId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages?.length, appointmentId]);

  useEffect(() => {
    if (!appointmentId || isMediaThread) return undefined;
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
  }, [appointmentId, isMediaThread]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return chats;
    return chats.filter((chat) => {
      const hay = [
        chat.other?.name,
        chat.other?.specialty,
        chat.threadType === "MEDIA" ? "media deal" : "booking",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [chats, query]);

  const unreadTotal = chats.reduce((sum, chat) => sum + (chat.unread || 0), 0);

  const payForSession = async (invoiceId) => {
    if (!thread?.pay) return;
    const targetInvoiceId = invoiceId || thread.pay.invoiceId || null;
    setPayingInvoiceId(targetInvoiceId || "session");
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: thread.pay.doctorId,
          startTime: thread.pay.startTime,
          endTime: thread.pay.endTime,
          description: thread.pay.description || undefined,
          invoiceId: targetInvoiceId || undefined,
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
      setPayingInvoiceId(null);
    }
  };

  const onSendInvoice = async (payload) => {
    if (!appointmentId || sendingInvoice) return;
    setSendingInvoice(true);
    try {
      const result = await sendBookingInvoice(appointmentId, payload);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Invoice sent");
      setInvoiceOpen(false);
      const next = await getBookingThread(appointmentId);
      if (next && !next.error) setThread(next);
    } catch (error) {
      toast.error(error?.message || "Could not send invoice.");
    } finally {
      setSendingInvoice(false);
    }
  };

  const onSaveBrief = async (payload) => {
    if (!appointmentId || sendingBrief) return;
    setSendingBrief(true);
    try {
      const result = await saveClientProjectBrief(appointmentId, payload);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.updated ? "Updated brief sent in chat" : "Brief sent in chat");
      setBriefOpen(false);
      const next = await getBookingThread(appointmentId);
      if (next && !next.error) setThread(next);
    } catch (error) {
      toast.error(error?.message || "Could not save your brief.");
    } finally {
      setSendingBrief(false);
    }
  };

  const onSendReport = async (payload) => {
    if (!appointmentId || sendingReport) return;
    setSendingReport(true);
    try {
      const { sendBookingDeliveryReportInChat } = await import("@/actions/delivery-reports");
      const result = await sendBookingDeliveryReportInChat(appointmentId, payload);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.shared ? "Report shared in chat" : "Report sent in chat");
      setReportOpen(false);
      const next = await getBookingThread(appointmentId);
      if (next && !next.error) setThread(next);
    } catch (error) {
      toast.error(error?.message || "Could not send the report.");
    } finally {
      setSendingReport(false);
    }
  };

  const onReviewReport = async (reportId, decision, feedback = "") => {
    if (!appointmentId || !reportId || reviewingReportId) return;
    setReviewingReportId(reportId);
    try {
      const { reviewBookingDeliveryReportInChat } = await import("@/actions/delivery-reports");
      const result = await reviewBookingDeliveryReportInChat(appointmentId, reportId, {
        decision,
        feedback,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(decision === "APPROVED" ? "Report approved" : "Revision requested");
      const next = await getBookingThread(appointmentId);
      if (next && !next.error) setThread(next);
    } catch (error) {
      toast.error(error?.message || "Could not review that report.");
    } finally {
      setReviewingReportId(null);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending || !thread?.canSend || !appointmentId) return;
    setSending(true);
    try {
      const result = await sendBookingMessage(appointmentId, text);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setDraft("");
      const next = await getBookingThread(appointmentId);
      if (next && !next.error) setThread(next);
    } catch (error) {
      const message = String(error?.message || "");
      toast.error(
        error?.digest || message.includes("Server Components render")
          ? "Could not send that message. Please try again."
          : message || "Could not send that message."
      );
    } finally {
      setSending(false);
    }
  };

  const hasActiveThread = Boolean(appointmentId || negotiationId);

  return (
    <div className="-m-4 flex min-h-0 flex-1 gap-3 bg-[#f4f6fb] p-3 md:-m-6 md:p-4">
      <aside className={`${hasActiveThread ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col rounded-[1.6rem] bg-[#12141c] p-3 text-white md:w-[300px]`}>
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
            placeholder="Search people or media"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
        </label>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {shown.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-white/50">
              {chats.length === 0
                ? "No booking or media chats yet."
                : "No one matches that search."}
            </p>
          ) : (
            shown.map((chat) => {
              const isMedia = chat.threadType === "MEDIA";
              const active = isMedia
                ? chat.negotiationId === negotiationId
                : chat.appointmentId === appointmentId;
              return (
                <Link
                  key={chatKey(chat)}
                  href={chatHref(chat)}
                  className={`flex items-center gap-3 rounded-2xl px-2.5 py-2.5 ${active ? "bg-[#6d28d9]" : "hover:bg-white/10"}`}
                >
                  <Avatar person={chat.other} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">
                        {chat.other?.name || (isMedia ? "Media deal" : "Booking")}
                      </span>
                      <span className={`shrink-0 text-[10px] ${active ? "text-white/70" : "text-white/40"}`}>
                        {chat.lastMessage ? whenLabel(chat.lastMessage.createdAt) : ""}
                      </span>
                    </span>
                    <span className={`mt-0.5 block truncate text-xs ${active ? "text-white/80" : "text-white/50"}`}>
                      {isMedia
                        ? chat.other?.specialty || "Media deal"
                        : chat.other?.specialty || "Session"}
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-2">
                      <span className={`truncate text-xs ${active ? "text-white/75" : "text-white/45"}`}>
                        {chat.lastMessage
                          ? `${chat.lastMessage.mine ? "You: " : ""}${
                              chat.lastMessage.kind === "INVOICE"
                                ? chat.lastMessage.body || "Invoice"
                                : chat.lastMessage.kind === "BRIEF"
                                  ? chat.lastMessage.body || "Expectations brief"
                                  : chat.lastMessage.kind === "REPORT"
                                    ? chat.lastMessage.body || "Delivery report"
                                    : chat.lastMessage.body
                            }`
                          : "No messages yet"}
                      </span>
                      {chat.unread > 0 ? (
                        <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#6d28d9]">{chat.unread}</span>
                      ) : (
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            isMedia
                              ? mediaStatusClass(chat.mediaStatus, active)
                              : statusClass(chat.appointmentStatus, active)
                          }`}
                        >
                          {isMedia
                            ? mediaStatusLabel(chat.mediaStatus)
                            : statusLabel(chat.appointmentStatus)}
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

      {isMediaThread ? (
        <section className={`${hasActiveThread ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col overflow-hidden`}>
          <MediaNegotiateWorkspace
            negotiation={initialNegotiation}
            perspective={negotiationPerspective}
            embedded
            fromCart={fromCart}
            cartItemId={cartItemId}
            backHref="/messages"
            backLabel="Messages"
          />
        </section>
      ) : (
        <>
          <section className={`${hasActiveThread ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col overflow-hidden rounded-[1.6rem] bg-white`}>
            {thread && appointmentId ? (
              <ThreadPane
                thread={thread}
                onSubmit={onSubmit}
                draft={draft}
                setDraft={setDraft}
                sending={sending}
                endRef={endRef}
                onPay={payForSession}
                payingInvoiceId={payingInvoiceId}
                invoiceOpen={invoiceOpen}
                setInvoiceOpen={setInvoiceOpen}
                sendingInvoice={sendingInvoice}
                onSendInvoice={onSendInvoice}
                briefOpen={briefOpen}
                setBriefOpen={setBriefOpen}
                sendingBrief={sendingBrief}
                onSaveBrief={onSaveBrief}
                reportOpen={reportOpen}
                setReportOpen={setReportOpen}
                sendingReport={sendingReport}
                onSendReport={onSendReport}
                reviewingReportId={reviewingReportId}
                onReviewReport={onReviewReport}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <MessageCircle className="h-8 w-8 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-900">Pick a conversation</p>
                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  Booking chats and media rate negotiations both live here.
                </p>
              </div>
            )}
          </section>

          {thread && appointmentId ? (
            <aside className="hidden w-[280px] shrink-0 flex-col gap-3 xl:flex">
              <SessionCard
                thread={thread}
                onPay={payForSession}
                onOpenInvoice={() => {
                  setBriefOpen(false);
                  setReportOpen(false);
                  setInvoiceOpen(true);
                }}
                onOpenBrief={() => {
                  setInvoiceOpen(false);
                  setReportOpen(false);
                  setBriefOpen(true);
                }}
                onOpenReport={() => {
                  setInvoiceOpen(false);
                  setBriefOpen(false);
                  setReportOpen(true);
                }}
                invoiceOpen={invoiceOpen}
                briefOpen={briefOpen}
                reportOpen={reportOpen}
              />
            </aside>
          ) : null}
        </>
      )}
    </div>
  );
}

function ThreadPane({
  thread,
  onSubmit,
  draft,
  setDraft,
  sending,
  endRef,
  onPay,
  payingInvoiceId,
  invoiceOpen,
  setInvoiceOpen,
  sendingInvoice,
  onSendInvoice,
  briefOpen,
  setBriefOpen,
  sendingBrief,
  onSaveBrief,
  reportOpen,
  setReportOpen,
  sendingReport,
  onSendReport,
  reviewingReportId,
  onReviewReport,
}) {
  const href = profileHref(thread.other);
  let lastDay = "";
  const messages = Array.isArray(thread?.messages) ? thread.messages : [];
  const clientCanPayInvoice =
    !thread.isCreator &&
    thread.appointment?.status !== "CANCELLED" &&
    thread.appointment?.status !== "COMPLETED";
  const canSetBrief = Boolean(thread.canSetBrief);
  const canSendReport = Boolean(thread.canSendReport);
  const sessionWhen = safeSessionWhen(thread.appointment?.startTime);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <Link href="/messages" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 md:hidden" aria-label="All messages">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Avatar person={thread.other} className="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-950">{thread.other?.name || "Booking chat"}</p>
          <p className="truncate text-xs text-slate-500" suppressHydrationWarning>
            {thread.other?.specialty ? `${thread.other.specialty} · ` : ""}
            {sessionWhen}
            {thread.appointment?.agreedAmount != null
              ? ` · ${moneyGhs(thread.appointment.agreedAmount)}`
              : ""}
          </p>
        </div>
        <span className="hidden rounded-full bg-[#f3eefe] px-2.5 py-1 text-xs font-semibold text-[#5b21b6] sm:inline">
          {statusLabel(thread.appointment?.status)}
        </span>
        {href ? (
          <Link href={href} className="hidden rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#6d28d9] sm:inline">
            Profile
          </Link>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f7f8fb] px-4 py-4">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            {canSetBrief
              ? "Say hello, or use the brief button to share what you want and expect from this booking."
              : "Say hello and share anything they should know before the session."}
          </p>
        ) : (
          messages.map((message) => {
            if (!message?.id) return null;
            const day = safeDayKey(message.createdAt);
            const showDay = Boolean(day) && day !== lastDay;
            if (day) lastDay = day;
            const timeLabel = safeTimeLabel(message.createdAt);
            const paymentNotice =
              message.kind === "TEXT" || !message.kind
                ? parsePaymentConfirmed(message.body)
                : null;
            return (
              <div key={message.id}>
                {showDay ? (
                  <p
                    className="mb-3 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400"
                    suppressHydrationWarning
                  >
                    {safeDayHeading(message.createdAt)}
                  </p>
                ) : null}
                <MessageErrorBoundary fallback={message.body || "Message unavailable"}>
                  {message.kind === "INVOICE" && message.invoice ? (
                    <div className={message.mine ? "flex justify-end" : "flex items-end gap-2"}>
                      {message.mine ? null : <Avatar person={thread.other} className="h-7 w-7" />}
                      <InvoiceMessageCard
                        invoice={message.invoice}
                        mine={message.mine}
                        canPay={clientCanPayInvoice && message.invoice.status === "SENT"}
                        paying={payingInvoiceId === message.invoice.id}
                        onPay={() => onPay(message.invoice.id)}
                        createdAt={message.createdAt}
                      />
                    </div>
                  ) : message.kind === "BRIEF" ? (
                    <div className={message.mine ? "flex justify-end" : "flex items-end gap-2"}>
                      {message.mine ? null : <Avatar person={thread.other} className="h-7 w-7" />}
                      <BriefMessageCard
                        body={message.body}
                        mine={message.mine}
                        createdAt={message.createdAt}
                        appointmentId={thread.appointmentId}
                        isCreator={thread.isCreator}
                      />
                    </div>
                  ) : message.kind === "REPORT" && message.report ? (
                    <div className={message.mine ? "flex justify-end" : "flex items-end gap-2"}>
                      {message.mine ? null : <Avatar person={thread.other} className="h-7 w-7" />}
                      <ReportMessageCard
                        report={message.report}
                        mine={message.mine}
                        createdAt={message.createdAt}
                        canReview={!thread.isCreator && message.report.status === "SUBMITTED"}
                        reviewing={reviewingReportId === message.report.reportId}
                        onReview={onReviewReport}
                      />
                    </div>
                  ) : paymentNotice ? (
                    <div className="flex justify-center py-1">
                      <PaymentConfirmedCard
                        payment={paymentNotice}
                        createdAt={message.createdAt}
                      />
                    </div>
                  ) : (
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
                        {timeLabel ? (
                          <p
                            className={
                              message.mine
                                ? "mt-1 text-[10px] text-white/50"
                                : "mt-1 text-[10px] text-slate-400"
                            }
                            suppressHydrationWarning
                          >
                            {timeLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}
                </MessageErrorBoundary>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {thread.canPay ? (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-2.5 xl:hidden">
          <p className="text-xs text-slate-500">
            {thread.pay?.amount != null
              ? `Pay ${moneyGhs(thread.pay.amount)} to confirm`
              : "This session is not paid yet."}
          </p>
          <button type="button" onClick={() => onPay()} className="shrink-0 rounded-full bg-[#6d28d9] px-3 py-1.5 text-xs font-semibold text-white">
            Pay
          </button>
        </div>
      ) : null}

      {invoiceOpen && thread.canInvoice ? (
        <InvoiceComposer
          defaultAmount={thread.appointment.agreedAmount || thread.pay?.amount || ""}
          sending={sendingInvoice}
          onCancel={() => setInvoiceOpen(false)}
          onSend={onSendInvoice}
        />
      ) : null}

      {briefOpen && canSetBrief ? (
        <BriefComposer
          initialBrief={thread.appointment?.clientDescription || ""}
          sending={sendingBrief}
          onCancel={() => setBriefOpen(false)}
          onSave={onSaveBrief}
        />
      ) : null}

      {reportOpen && canSendReport ? (
        <ReportComposer
          checklist={thread.reportChecklist || []}
          reportStatus={thread.deliveryReport?.status || null}
          sending={sendingReport}
          onCancel={() => setReportOpen(false)}
          onSend={onSendReport}
        />
      ) : null}

      {thread.canSend ? (
        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
          {thread.canInvoice ? (
            <button
              type="button"
              onClick={() => {
                setBriefOpen(false);
                setReportOpen(false);
                setInvoiceOpen((open) => !open);
              }}
              aria-label="Create invoice"
              title="Send invoice"
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                invoiceOpen
                  ? "border-[#6d28d9] bg-[#f3eefe] text-[#5b21b6]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#6d28d9] hover:text-[#6d28d9]"
              }`}
            >
              <Receipt className="h-4 w-4" />
            </button>
          ) : null}
          {canSendReport ? (
            <button
              type="button"
              onClick={() => {
                setInvoiceOpen(false);
                setBriefOpen(false);
                setReportOpen((open) => !open);
              }}
              aria-label="Send delivery report"
              title="Send delivery report"
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                reportOpen
                  ? "border-[#6d28d9] bg-[#f3eefe] text-[#5b21b6]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#6d28d9] hover:text-[#6d28d9]"
              }`}
            >
              <ClipboardList className="h-4 w-4" />
            </button>
          ) : null}
          {canSetBrief ? (
            <button
              type="button"
              onClick={() => {
                setInvoiceOpen(false);
                setReportOpen(false);
                setBriefOpen((open) => !open);
              }}
              aria-label="Share what you want from this booking"
              title="Share expectations"
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                briefOpen
                  ? "border-[#6d28d9] bg-[#f3eefe] text-[#5b21b6]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#6d28d9] hover:text-[#6d28d9]"
              }`}
            >
              <FileText className="h-4 w-4" />
            </button>
          ) : null}
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

function reportStatusMeta(status) {
  if (status === "APPROVED") {
    return { label: "Approved", className: "bg-emerald-50 text-emerald-700" };
  }
  if (status === "REVISION_REQUESTED") {
    return { label: "Needs changes", className: "bg-amber-50 text-amber-700" };
  }
  if (status === "SUBMITTED") {
    return { label: "Needs review", className: "bg-sky-50 text-sky-700" };
  }
  return { label: status || "Report", className: "bg-slate-100 text-slate-600" };
}

function ReportMessageCard({ report, mine, createdAt, canReview, reviewing, onReview }) {
  const [feedback, setFeedback] = useState("");
  const [askRevision, setAskRevision] = useState(false);
  if (!report?.reportId) return null;
  const status = reportStatusMeta(report.status);
  const timeLabel = safeTimeLabel(createdAt);

  return (
    <div
      className={`w-full max-w-[340px] overflow-hidden rounded-2xl border shadow-sm ${
        mine ? "border-[#d6d3f5] bg-white" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-[#f8f7ff] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#6d28d9]/10 text-[#6d28d9]">
            <ClipboardList className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-900">
              {report.title || "Delivery report"}
            </p>
            {timeLabel ? (
              <p className="text-[10px] text-slate-400">{timeLabel}</p>
            ) : null}
          </div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>
      <div className="space-y-2 px-3 py-3">
        <p className="text-xs text-slate-500">
          Checklist {report.checklistDone || 0}/{report.checklistTotal || 0} complete
        </p>
        {report.notes ? (
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
            {report.notes}
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
        {report.feedback ? (
          <p className="rounded-xl bg-slate-50 px-2.5 py-2 text-xs text-slate-600">
            Feedback: {report.feedback}
          </p>
        ) : null}

        {canReview ? (
          <div className="space-y-2 border-t border-slate-100 pt-2">
            {askRevision ? (
              <>
                <textarea
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  rows={2}
                  placeholder="What needs to change?"
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#6d28d9]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={reviewing || !feedback.trim()}
                    onClick={() => onReview(report.reportId, "REVISION_REQUESTED", feedback)}
                    className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-amber-600 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    {reviewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Request revision"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAskRevision(false)}
                    className="rounded-full px-3 text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => onReview(report.reportId, "APPROVED")}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-full bg-emerald-600 text-xs font-semibold text-white disabled:opacity-40"
                >
                  {reviewing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => setAskRevision(true)}
                  className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40"
                >
                  Revise
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ReportComposer({ checklist, reportStatus, sending, onCancel, onSend }) {
  const [notes, setNotes] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [items, setItems] = useState(() =>
    (checklist || []).map((item) => ({ ...item, done: Boolean(item.done) }))
  );

  useEffect(() => {
    setItems((checklist || []).map((item) => ({ ...item, done: Boolean(item.done) })));
  }, [checklist]);

  const allDone = items.length > 0 && items.every((item) => item.done);
  const canSubmit = Boolean(proofLink.trim()) && (reportStatus === "APPROVED" || allDone);

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const submit = (event) => {
    event.preventDefault();
    if (!canSubmit || sending) return;
    onSend({
      notes,
      proofLink,
      checklist: items,
    });
  };

  return (
    <form onSubmit={submit} className="border-t border-slate-100 bg-[#fbfaff] px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">Send delivery report</p>
          <p className="text-xs text-slate-500">
            Posts into this chat for the client to review.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close report"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {reportStatus === "APPROVED" ? (
        <p className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          This report is already approved. Sending will reshare it in chat.
        </p>
      ) : (
        <div className="mb-3 space-y-2">
          <p className="text-xs font-semibold text-slate-600">Checklist from client brief</p>
          <ul className="max-h-40 space-y-1.5 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
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
      )}

      <label className="block text-xs text-slate-500">
        Proof link
        <input
          value={proofLink}
          onChange={(event) => setProofLink(event.target.value)}
          placeholder="https://…"
          className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#6d28d9]"
        />
      </label>
      <label className="mt-2 block text-xs text-slate-500">
        Notes for the client
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="What you delivered and where to find it"
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#6d28d9]"
        />
      </label>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={sending || !canSubmit}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#6d28d9] px-4 text-xs font-semibold text-white disabled:opacity-40"
        >
          {sending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Sending…
            </>
          ) : (
            "Send in chat"
          )}
        </button>
      </div>
    </form>
  );
}

function BriefMessageCard({ body, mine, createdAt, appointmentId, isCreator }) {
  const fields = safeParseBrief(body);
  const rows = [
    fields.want ? { label: "Want", value: fields.want } : null,
    fields.expect ? { label: "Expect", value: fields.expect } : null,
    fields.timing ? { label: "Timing", value: fields.timing } : null,
    fields.notes ? { label: "Notes", value: fields.notes } : null,
  ].filter(Boolean);
  const timeLabel = safeTimeLabel(createdAt);

  return (
    <div
      className={`w-full max-w-[320px] overflow-hidden rounded-2xl border shadow-sm ${
        mine ? "border-[#d6d3f5] bg-white" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-[#f8f7ff] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#6d28d9]/10 text-[#6d28d9]">
            <FileText className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-900">
              {mine ? "Your expectations" : "Client expectations"}
            </p>
            {timeLabel ? (
              <p className="text-[10px] text-slate-400" suppressHydrationWarning>
                {timeLabel}
              </p>
            ) : null}
          </div>
        </div>
        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
          Brief
        </span>
      </div>
      <div className="space-y-2 px-3 py-3">
        {rows.length > 0 ? (
          rows.map((row) => (
            <div key={row.label}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {row.label}
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                {row.value}
              </p>
            </div>
          ))
        ) : (
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
            {body || "Expectations shared"}
          </p>
        )}
        {isCreator && appointmentId ? (
          <Link
            href="/creator/bookings"
            className="inline-flex h-9 w-full items-center justify-center rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#6d28d9] hover:text-[#6d28d9]"
          >
            Use in delivery report
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function BriefComposer({ initialBrief, sending, onCancel, onSave }) {
  const parsed = useMemo(() => safeParseBrief(initialBrief), [initialBrief]);
  const [want, setWant] = useState(parsed.want);
  const [expect, setExpect] = useState(parsed.expect);
  const [timing, setTiming] = useState(parsed.timing);
  const [notes, setNotes] = useState(parsed.notes);

  useEffect(() => {
    const next = safeParseBrief(initialBrief);
    setWant(next.want);
    setExpect(next.expect);
    setTiming(next.timing);
    setNotes(next.notes);
  }, [initialBrief]);

  const charCount =
    want.trim().length +
    expect.trim().length +
    timing.trim().length +
    notes.trim().length;
  const canSubmit = Boolean(want.trim() || expect.trim() || timing.trim() || notes.trim());

  const submit = (event) => {
    event.preventDefault();
    if (!canSubmit || sending) return;
    onSave({ want, expect, timing, notes });
  };

  return (
    <form onSubmit={submit} className="border-t border-slate-100 bg-[#fbfaff] px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">What you want from this booking</p>
          <p className="text-xs text-slate-500">Shared in chat and saved on the session brief.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close brief"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-xs text-slate-500 sm:col-span-2">
          What I want
          <textarea
            value={want}
            onChange={(event) => setWant(event.target.value)}
            rows={2}
            maxLength={800}
            placeholder="e.g. Help me refine my brand voice for a product launch"
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#6d28d9]"
          />
        </label>
        <label className="block text-xs text-slate-500 sm:col-span-2">
          What I expect
          <textarea
            value={expect}
            onChange={(event) => setExpect(event.target.value)}
            rows={2}
            maxLength={800}
            placeholder="e.g. Clear feedback, examples, and next steps after the call"
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#6d28d9]"
          />
        </label>
        <label className="block text-xs text-slate-500">
          Timing / deadline
          <input
            value={timing}
            onChange={(event) => setTiming(event.target.value)}
            maxLength={160}
            placeholder="e.g. Need this before Friday"
            className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#6d28d9]"
          />
        </label>
        <label className="block text-xs text-slate-500">
          Other details
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={240}
            placeholder="Links, budget notes, references…"
            className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#6d28d9]"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[11px] tabular-nums text-slate-400">{charCount} / 2000</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending || !canSubmit}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#6d28d9] px-4 text-xs font-semibold text-white disabled:opacity-40"
          >
            {sending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sharing…
              </>
            ) : (
              "Share in chat"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function PaymentConfirmedCard({ payment, createdAt }) {
  const timeLabel = safeTimeLabel(createdAt);
  return (
    <div className="payollar-payment-card w-full max-w-[220px] overflow-hidden rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50 to-white shadow-[0_8px_18px_rgba(16,185,129,0.1)]">
      <div className="relative overflow-hidden px-3 py-3 text-center">
        <div className="payollar-payment-shimmer pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto mb-1.5 flex h-8 w-8 items-center justify-center">
          <span
            className="payollar-payment-ring absolute inset-0 rounded-full bg-emerald-400/30"
            aria-hidden
          />
          <span className="payollar-payment-check relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
          </span>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
          Payment confirmed
        </p>
        {payment?.amountLabel ? (
          <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-slate-950">
            {payment.amountLabel}
          </p>
        ) : null}
        <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
          Booking paid · ready to continue
        </p>
        {payment?.reference ? (
          <p className="mt-1.5 inline-flex max-w-full items-center rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-medium text-slate-500 ring-1 ring-emerald-100">
            <span className="truncate">Ref · {payment.reference}</span>
          </p>
        ) : null}
        {timeLabel ? (
          <p className="mt-1 text-[9px] text-slate-400" suppressHydrationWarning>
            {timeLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function InvoiceMessageCard({ invoice, mine, canPay, paying, onPay, createdAt }) {
  const superseded = invoice.status === "SUPERSEDED";
  const paid = invoice.status === "PAID";
  const timeLabel = safeTimeLabel(createdAt);
  return (
    <div
      className={`w-full max-w-[320px] overflow-hidden rounded-2xl border shadow-sm ${
        mine ? "border-[#d6d3f5] bg-white" : "border-slate-200 bg-white"
      } ${superseded ? "opacity-70" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-[#f8f7ff] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#6d28d9]/10 text-[#6d28d9]">
            <FileText className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-900">{invoice.title || "Invoice"}</p>
            {timeLabel ? (
              <p className="text-[10px] text-slate-400" suppressHydrationWarning>
                {timeLabel}
              </p>
            ) : null}
          </div>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            paid
              ? "bg-emerald-50 text-emerald-700"
              : superseded
                ? "bg-slate-100 text-slate-500"
                : "bg-amber-50 text-amber-700"
          }`}
        >
          {paid ? "Paid" : superseded ? "Updated" : "Open"}
        </span>
      </div>
      <div className="space-y-2 px-3 py-3">
        {invoice.lineItems?.length ? (
          <ul className="space-y-1.5">
            {invoice.lineItems.map((item, index) => (
              <li key={`${item.description}-${index}`} className="flex items-start justify-between gap-3 text-xs">
                <span className="text-slate-600">{item.description}</span>
                <span className="shrink-0 font-medium tabular-nums text-slate-900">{moneyGhs(item.amount)}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {invoice.notes ? <p className="text-xs leading-relaxed text-slate-500">{invoice.notes}</p> : null}
        <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-2">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Total</p>
          <p className="text-lg font-semibold tabular-nums text-slate-950">{moneyGhs(invoice.amount)}</p>
        </div>
        {canPay ? (
          <button
            type="button"
            onClick={onPay}
            disabled={paying}
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#6d28d9] text-sm font-semibold text-white hover:bg-[#5b21b6] disabled:opacity-60"
          >
            {paying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting…
              </>
            ) : (
              <>Pay now · {moneyGhs(invoice.amount)}</>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function InvoiceComposer({ defaultAmount, sending, onCancel, onSend }) {
  const [title, setTitle] = useState("Session invoice");
  const [amount, setAmount] = useState(
    defaultAmount != null && defaultAmount !== "" ? String(defaultAmount) : ""
  );
  const [notes, setNotes] = useState("");
  const [useLines, setUseLines] = useState(false);
  const [lines, setLines] = useState([{ description: "", amount: "" }]);

  const lineTotal = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const total = useLines ? lineTotal : Number(amount) || 0;

  const submit = (event) => {
    event.preventDefault();
    onSend({
      title,
      notes,
      amount: useLines ? lineTotal : Number(amount),
      lineItems: useLines
        ? lines
            .map((line) => ({
              description: line.description.trim(),
              amount: Number(line.amount),
            }))
            .filter((line) => line.description && line.amount > 0)
        : [],
    });
  };

  return (
    <form onSubmit={submit} className="border-t border-slate-100 bg-[#fbfaff] px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">Customize invoice</p>
        <button type="button" onClick={onCancel} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close invoice">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-xs text-slate-500">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#6d28d9]"
          />
        </label>
        {!useLines ? (
          <label className="block text-xs text-slate-500">
            Amount (GHS)
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="e.g. 350"
              className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#6d28d9]"
              required={!useLines}
            />
          </label>
        ) : (
          <div className="flex items-end">
            <p className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold tabular-nums text-slate-900">
              Total {moneyGhs(lineTotal)}
            </p>
          </div>
        )}
      </div>

      <label className="mt-2 block text-xs text-slate-500">
        Notes for client
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="What this covers after negotiation…"
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#6d28d9]"
        />
      </label>

      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setUseLines((value) => !value)}
          className="text-xs font-semibold text-[#6d28d9] hover:text-[#5b21b6]"
        >
          {useLines ? "Use single amount" : "Add line items"}
        </button>
        <p className="text-xs text-slate-400">Client pays {moneyGhs(total)}</p>
      </div>

      {useLines ? (
        <div className="mt-2 space-y-2">
          {lines.map((line, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={line.description}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = { ...next[index], description: event.target.value };
                  setLines(next);
                }}
                placeholder="Item"
                className="h-9 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9]"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={line.amount}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = { ...next[index], amount: event.target.value };
                  setLines(next);
                }}
                placeholder="0.00"
                className="h-9 w-24 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#6d28d9]"
              />
              <button
                type="button"
                onClick={() => setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600"
                aria-label="Remove line"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {lines.length < 12 ? (
            <button
              type="button"
              onClick={() => setLines((prev) => [...prev, { description: "", amount: "" }])}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#6d28d9]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add line
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-full px-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={sending || total < 1}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#6d28d9] px-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Receipt className="h-3.5 w-3.5" />}
          Send invoice
        </button>
      </div>
    </form>
  );
}

function SessionCard({
  thread,
  onPay,
  onOpenInvoice,
  onOpenBrief,
  onOpenReport,
  invoiceOpen,
  briefOpen,
  reportOpen,
}) {
  const router = useRouter();
  const [kitBusy, setKitBusy] = useState(false);
  const href = profileHref(thread.other);
  const hasBrief = Boolean(thread.appointment?.clientDescription?.trim());
  const canInvoice = Boolean(thread.canInvoice);
  const canSetBrief = Boolean(thread.canSetBrief);
  const canSendReport = Boolean(thread.canSendReport);
  const canStartKit = Boolean(thread.canStartKit);
  const tools = [];

  const openOrCreateKit = async () => {
    if (thread.logisticsShipmentId) {
      router.push(`/client/logistics/${thread.logisticsShipmentId}`);
      return;
    }
    const appointmentId = thread.appointment?.id || thread.appointmentId;
    if (!appointmentId) {
      toast.error("Booking not found");
      return;
    }
    setKitBusy(true);
    try {
      const result = await startLogisticsFromAppointment(appointmentId);
      if (!result?.shipmentId) {
        toast.error("Could not open kit tracking");
        return;
      }
      toast.success(result.existing ? "Opening kit" : "Kit created for this booking");
      router.push(`/client/logistics/${result.shipmentId}`);
    } catch (error) {
      toast.error(error?.message || "Could not open kit tracking");
    } finally {
      setKitBusy(false);
    }
  };

  if (canInvoice) {
    tools.push({
      id: "invoice",
      icon: Receipt,
      title: "Send invoice",
      description: "Charge for this booking. The client can pay from chat.",
      active: Boolean(invoiceOpen),
      onClick: onOpenInvoice,
    });
  }
  if (canSetBrief) {
    tools.push({
      id: "brief",
      icon: FileText,
      title: hasBrief ? "Update brief" : "Share brief",
      description: "Tell talent what you want, expect, and when you need it.",
      active: Boolean(briefOpen),
      onClick: onOpenBrief,
    });
  }
  if (canStartKit) {
    tools.push({
      id: "kit",
      icon: Package,
      title: thread.logisticsShipmentId ? "Track kit" : "Send a kit",
      description: thread.logisticsShipmentId
        ? "Open logistics for the package you’re sending this creator."
        : "Start product logistics to ship a physical package for this booking.",
      active: false,
      onClick: openOrCreateKit,
      busy: kitBusy,
    });
  }
  if (canSendReport) {
    tools.push({
      id: "report",
      icon: ClipboardList,
      title: "Send delivery report",
      description: "Submit checklist + proof for the client to review.",
      active: Boolean(reportOpen),
      onClick: onOpenReport,
    });
  }
  if (thread.canPay) {
    tools.push({
      id: "pay",
      icon: CheckCircle2,
      title:
        thread.pay?.amount != null
          ? `Pay ${moneyGhs(thread.pay.amount)}`
          : "Pay booking",
      description: "Confirm payment with Paystack to lock in this booking.",
      active: false,
      onClick: () => onPay?.(),
      primary: true,
    });
  }

  let sessionLabel = "";
  let untilLabel = "";
  try {
    const start = toValidDate(thread.appointment?.startTime);
    const end = toValidDate(thread.appointment?.endTime);
    if (start) sessionLabel = format(start, "EEE, MMM d · h:mm a");
    if (end) untilLabel = format(end, "h:mm a");
  } catch {
    sessionLabel = "";
    untilLabel = "";
  }

  return (
    <div className="rounded-[1.6rem] bg-white p-4">
      <div className="flex items-center gap-3">
        <Avatar person={thread.other} className="h-12 w-12" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-950">
            {thread.other?.name || "Booking"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {thread.other?.specialty || "Session"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#f3eefe] px-2 py-0.5 text-[10px] font-semibold text-[#5b21b6]">
          {statusLabel(thread.appointment?.status)}
        </span>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#f7f8fb] px-3 py-2.5 text-sm">
        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#6d28d9]" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Session
          </p>
          <p className="font-medium text-slate-900" suppressHydrationWarning>
            {sessionLabel || "Time TBD"}
          </p>
          {untilLabel ? (
            <p className="text-xs text-slate-500" suppressHydrationWarning>
              until {untilLabel}
            </p>
          ) : null}
        </div>
      </div>

      {tools.length > 0 ? (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Chat tools
          </p>
          <ul className="mt-3 space-y-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <li key={tool.id}>
                  <button
                    type="button"
                    onClick={tool.onClick}
                    disabled={Boolean(tool.busy)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition disabled:opacity-60 ${
                      tool.primary
                        ? "border-[#6d28d9] bg-[#6d28d9] text-white hover:bg-[#5b21b6]"
                        : tool.active
                          ? "border-[#6d28d9] bg-[#f3eefe]"
                          : "border-slate-100 bg-[#fafafa] hover:border-[#d8b4fe] hover:bg-white"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        tool.primary
                          ? "bg-white/15 text-white"
                          : tool.active
                            ? "bg-[#6d28d9]/15 text-[#5b21b6]"
                            : "bg-white text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      {tool.busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Icon className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-semibold ${
                          tool.primary ? "text-white" : "text-slate-950"
                        }`}
                      >
                        {tool.title}
                      </span>
                      <span
                        className={`mt-0.5 block text-[11px] leading-relaxed ${
                          tool.primary ? "text-white/75" : "text-slate-500"
                        }`}
                      >
                        {tool.description}
                      </span>
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 ${
                        tool.primary ? "text-white/70" : "text-slate-400"
                      }`}
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Use the message box to chat. Booking tools appear here when this session needs
          an invoice, brief, or delivery report.
        </p>
      )}

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
        {thread.appointment?.agreedAmount != null ? (
          <div className="flex items-center justify-between rounded-2xl bg-[#f7f8fb] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Agreed amount
            </p>
            <p className="text-sm font-semibold tabular-nums text-slate-950">
              {moneyGhs(thread.appointment.agreedAmount)}
            </p>
          </div>
        ) : null}
        {href ? (
          <Link
            href={href}
            className="inline-flex h-10 w-full items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-800 hover:border-[#6d28d9]"
          >
            View profile
          </Link>
        ) : null}
      </div>
    </div>
  );
}
