"use client";

import { format } from "date-fns";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DisputeChatTranscript({ chat, className }) {
  if (!chat) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center",
          className
        )}
      >
        <MessageCircle className="mx-auto h-5 w-5 text-slate-400" />
        <p className="mt-2 text-sm font-medium text-slate-700">
          No booking chat available
        </p>
        <p className="mt-1 text-xs text-slate-500">
          This dispute is not linked to a conversation, or the chat has not
          started yet.
        </p>
      </div>
    );
  }

  const messages = chat.messages || [];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200 bg-white",
        className
      )}
    >
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-950">Booking chat</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {(chat.client?.name || chat.client?.email || "Client") +
            " · " +
            (chat.creator?.name || chat.creator?.email || "Creator")}
          {chat.appointment?.status ? ` · ${chat.appointment.status}` : ""}
        </p>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto bg-slate-50/60 p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No messages in this chat yet.
          </p>
        ) : (
          messages.map((message) => {
            const isCreator = message.sender?.role === "CREATOR";
            const alignRight = message.mine || isCreator;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  alignRight ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
                    alignRight
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-900"
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 flex items-center gap-2 text-[11px]",
                      alignRight ? "text-white/70" : "text-slate-400"
                    )}
                  >
                    <span className="font-semibold">
                      {message.sender?.name ||
                        message.sender?.email ||
                        (alignRight ? "Creator" : "Client")}
                    </span>
                    <span>
                      {message.createdAt
                        ? format(new Date(message.createdAt), "MMM d, h:mm a")
                        : ""}
                    </span>
                  </div>
                  {message.kind === "INVOICE" ? (
                    <p className="font-medium">Invoice message</p>
                  ) : null}
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
