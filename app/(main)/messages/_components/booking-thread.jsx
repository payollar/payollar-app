"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { getBookingThread, sendBookingMessage } from "@/actions/booking-chat";

export function BookingThread({ appointmentId, initialThread }) {
  const [thread, setThread] = useState(initialThread);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages.length]);

  useEffect(() => {
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

  const payForSession = async () => {
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
    if (!text || sending || !thread.canSend) return;
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <p className="font-semibold">{thread.other?.name || "Booking chat"}</p>
        <p className="text-xs text-muted-foreground">
          {thread.other?.specialty ? `${thread.other.specialty} · ` : ""}
          Session {format(new Date(thread.appointment.startTime), "MMM d, yyyy · h:mm a")}
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {thread.messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Say hello and share anything they should know before the session.
          </p>
        ) : (
          thread.messages.map((message) => (
            <div key={message.id} className={message.mine ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  message.mine
                    ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm text-foreground"
                }
              >
                <p className="whitespace-pre-wrap">{message.body}</p>
                <p className={message.mine ? "mt-1 text-[10px] text-primary-foreground/70" : "mt-1 text-[10px] text-muted-foreground"}>
                  {format(new Date(message.createdAt), "h:mm a")}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
      {thread.canPay ? (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">This session is not paid yet. You can keep chatting, then confirm it when you are ready.</p>
          <button
            type="button"
            onClick={payForSession}
            className="shrink-0 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Pay with Paystack
          </button>
        </div>
      ) : null}
      {thread.canSend ? (
        <form onSubmit={onSubmit} className="flex gap-2 border-t border-border p-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message"
            maxLength={2000}
            className="h-11 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </button>
        </form>
      ) : (
        <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          This booking was cancelled, so new messages are closed.
        </p>
      )}
    </div>
  );
}
