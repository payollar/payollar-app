"use client";

import { format } from "date-fns";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function SenderAvatar({ sender, dark = false }) {
  const name = sender?.name || sender?.email || "?";
  if (sender?.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={sender.imageUrl}
        alt=""
        className="h-6 w-6 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
        dark ? "bg-white/15 text-white" : "bg-slate-200 text-slate-600"
      )}
    >
      {String(name).charAt(0).toUpperCase()}
    </span>
  );
}

export function DisputeChatTranscript({ chat, className, compactEmpty = false }) {
  if (!chat) {
    if (compactEmpty) return null;
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center",
          className
        )}
      >
        <MessageCircle className="mx-auto h-5 w-5 text-slate-400" />
        <p className="mt-2 text-sm font-medium text-slate-700">
          No booking chat available
        </p>
        <p className="mt-1 text-xs text-slate-500">
          This dispute is not linked to a conversation yet.
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
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-700">
            <MessageCircle className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">Booking chat</p>
            <p className="truncate text-xs text-slate-500">
              {(chat.client?.name || chat.client?.email || "Client") +
                " · " +
                (chat.creator?.name || chat.creator?.email || "Creator")}
              {chat.appointment?.status ? ` · ${chat.appointment.status}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[360px] space-y-3 overflow-y-auto bg-[#f7f8fb] p-3">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No messages in this chat yet.
          </p>
        ) : (
          messages.map((message) => {
            const isCreator = message.sender?.role === "CREATOR";
            return (
              <div
                key={message.id}
                className={cn("flex gap-2", isCreator ? "flex-row-reverse" : "flex-row")}
              >
                <SenderAvatar sender={message.sender} dark={isCreator} />
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    isCreator
                      ? "rounded-tr-md bg-slate-950 text-white"
                      : "rounded-tl-md border border-slate-200 bg-white text-slate-900"
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px]",
                      isCreator ? "text-white/65" : "text-slate-400"
                    )}
                  >
                    <span className="font-semibold">
                      {message.sender?.name ||
                        message.sender?.email ||
                        (isCreator ? "Creator" : "Client")}
                    </span>
                    <span>
                      {message.createdAt
                        ? format(new Date(message.createdAt), "MMM d, h:mm a")
                        : ""}
                    </span>
                  </div>
                  {message.kind === "INVOICE" ? (
                    <p className="mb-0.5 text-[11px] font-medium opacity-80">
                      Invoice
                    </p>
                  ) : null}
                  {message.kind === "BRIEF" ? (
                    <p className="mb-0.5 text-[11px] font-medium opacity-80">
                      Brief
                    </p>
                  ) : null}
                  {message.kind === "REPORT" ? (
                    <p className="mb-0.5 text-[11px] font-medium opacity-80">
                      Delivery report
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap break-words leading-relaxed">
                    {message.body}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
