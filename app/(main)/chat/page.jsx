"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Bell,
  ArrowUp,
  Paperclip,
  BookmarkPlus,
  Radio,
  PenLine,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const GLOW = {
  blue: "from-blue-500/35 via-blue-500/5 to-transparent",
  amber: "from-amber-500/35 via-amber-500/5 to-transparent",
  violet: "from-violet-500/35 via-violet-500/5 to-transparent",
  teal: "from-teal-400/35 via-teal-500/5 to-transparent",
};

const FEATURES = [
  {
    title: "Media mix strategy",
    description: "Plan TV, radio, digital, and creator touchpoints for launches.",
    question: "What's the best media mix for a product launch in Ghana?",
    glow: GLOW.blue,
    icon: Radio,
  },
  {
    title: "Content & social",
    description: "Hooks, formats, and calendars that actually get engagement.",
    question: "How do I create engaging content for social media?",
    glow: GLOW.amber,
    icon: PenLine,
  },
  {
    title: "ROI & channels",
    description: "Compare performance and budget across advertising channels.",
    question: "What's the ROI difference between TV and digital ads?",
    glow: GLOW.violet,
    icon: TrendingUp,
  },
  {
    title: "Budget planning",
    description: "Allocate spend with clear priorities and guardrails.",
    question: "How should I budget my advertising spend?",
    glow: GLOW.teal,
    icon: Wallet,
  },
];

const QUICK_PILLS = [
  "What's the best media mix for a product launch in Ghana?",
  "How do I create engaging content for social media?",
  "Give me one high-impact marketing tip for this week.",
  "How should I budget my advertising spend?",
];

function FeatureCard({ item, onPick }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onPick(item.question)}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 text-left transition-all hover:border-white/20 hover:bg-[#141414]"
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br blur-3xl",
          item.glow
        )}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
        <Sparkles className="absolute left-[10%] top-[18%] h-3 w-3 text-white/50" />
        <Sparkles className="absolute right-[20%] top-[30%] h-2 w-2 text-white/40" />
        <Sparkles className="absolute bottom-[28%] left-[22%] h-2.5 w-2.5 text-white/35" />
      </div>
      <div className="relative z-[1] mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="relative z-[1] text-base font-semibold text-white">{item.title}</h3>
      <p className="relative z-[1] mt-1.5 text-sm leading-relaxed text-zinc-400">
        {item.description}
      </p>
    </button>
  );
}

export default function ChatPage() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred. Please try again.");
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = inputRef.current?.value ?? "";
    const input = raw.trim();
    if (!input) return;

    sendMessage({ text: input });
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.focus();
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const exportChat = async () => {
    const lines = messages.map((message) => {
      const messageText = message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");
      const role = message.role === "user" ? "You" : "Payollar AI";
      return `${role}: ${messageText}`;
    });
    const text = lines.join("\n\n");
    if (!text.trim()) {
      toast.message("Nothing to export yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Chat copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  };

  const busy = status === "in_progress";

  /** Minimum height = viewport below navbar; content flows — no inner scroll box. */
  const shellMin =
    "min-h-[calc(100dvh-5.25rem)] md:min-h-[calc(100dvh-7rem)]";

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[56rem] flex-col text-zinc-100 xl:max-w-[64rem]",
        shellMin
      )}
    >
      <div className="flex flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5">
        {messages.length === 0 && (
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl [font-family:var(--font-heading)]">
              Welcome to Payollar AI
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-pretty text-sm text-zinc-400 sm:text-base">
              Your marketing copilot for media planning, creators, campaigns, and growth—ask
              anything.
            </p>
          </div>
        )}

        {messages.length === 0 && (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-3">
            {FEATURES.map((item) => (
              <FeatureCard
                key={item.title}
                item={item}
                onPick={(q) => sendMessage({ text: q })}
              />
            ))}
          </div>
        )}

        <div className="space-y-6 pb-4">
          {messages.map((message) => {
              const messageText = message.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("");

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "relative max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[85%]",
                      message.role === "user"
                        ? "rounded-tr-sm bg-violet-600 text-white"
                        : "border border-white/10 bg-zinc-900/90 text-zinc-100"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                          <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                            Payollar AI
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(messageText, message.id)}
                          className="rounded p-1 text-zinc-500 opacity-70 transition hover:bg-white/10 hover:opacity-100"
                          title="Copy message"
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                    <div
                      className={cn(
                        "prose prose-sm max-w-none prose-invert",
                        "prose-p:text-zinc-200 prose-headings:text-white prose-strong:text-white",
                        "prose-code:rounded prose-code:bg-black/40 prose-code:px-1 prose-code:text-zinc-200"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="mb-2 list-inside list-disc space-y-1 text-sm">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-2 list-inside list-decimal space-y-1 text-sm">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => <li className="ml-1">{children}</li>,
                            code: ({ children }) => (
                              <code className="font-mono text-[0.85em]">{children}</code>
                            ),
                            pre: ({ children }) => (
                              <pre className="mb-2 overflow-x-auto rounded-lg bg-black/50 p-3 text-sm">
                                {children}
                              </pre>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">{children}</strong>
                            ),
                          }}
                        >
                          {messageText}
                        </ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {messageText}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
          })}

          {busy && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/90 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                <span className="text-sm text-zinc-400">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 z-30 mt-auto shrink-0 border-t border-white/10 bg-black/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-black/80 sm:px-6">
        <div className="mb-3 flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportChat}
            className="hidden border-white/15 bg-transparent text-xs text-zinc-300 hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            Export chat
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportChat}
            className="border-white/15 bg-transparent text-xs text-zinc-300 hover:bg-white/10 hover:text-white sm:hidden"
          >
            Export
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-violet-600 px-4 text-white hover:bg-violet-500"
          >
            <Link href="/pricing">Upgrade</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 text-zinc-400 hover:bg-white/10 hover:text-white md:inline-flex"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
        {messages.length === 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_PILLS.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => sendMessage({ text: pill })}
                disabled={busy}
                className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-left text-xs text-zinc-300 transition hover:border-white/25 hover:bg-white/[0.08] disabled:opacity-50"
              >
                {pill}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <Input
            ref={inputRef}
            name="message"
            placeholder="Ask me anything…"
            disabled={busy}
            autoComplete="off"
            className="h-12 rounded-full border-white/15 bg-zinc-900/80 pr-12 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/40"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={busy}
            className="absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-violet-600 hover:bg-violet-500"
            aria-label="Send"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-zinc-500 hover:border-white/10 hover:text-zinc-400"
            onClick={() => toast.message("Saved prompts coming soon.")}
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Saved prompts
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-zinc-500 hover:border-white/10 hover:text-zinc-400"
            onClick={() => toast.message("Attachments coming soon.")}
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attach
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-zinc-600">
          Powered by Groq · AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
