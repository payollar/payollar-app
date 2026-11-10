"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Clapperboard,
  Copy,
  Film,
  Globe2,
  Loader2,
  Mic,
  MoreHorizontal,
  Music2,
  PenLine,
  Plus,
  Radio,
  Sparkles,
  TrendingUp,
  Wallet,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BorderBeam } from "border-beam";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "agents", label: "Agents" },
  { id: "tools", label: "Tools" },
];

const SHORTCUTS = [
  {
    id: "media-mix",
    label: "Media mix",
    badge: "NEW",
    question: "What's the best media mix for a product launch in Ghana?",
    icon: Radio,
  },
  {
    id: "short-film",
    label: "Short film",
    question: "Help me brief a short brand film for social and TV.",
    icon: Film,
  },
  {
    id: "music-video",
    label: "Music video",
    question: "How should I plan a music video campaign with creators and media?",
    icon: Music2,
  },
  {
    id: "content",
    label: "Content",
    question: "How do I create engaging content for social media?",
    icon: PenLine,
  },
  {
    id: "roi",
    label: "ROI",
    question: "What's the ROI difference between TV and digital ads?",
    icon: TrendingUp,
  },
  {
    id: "budget",
    label: "Budget",
    question: "How should I budget my advertising spend?",
    icon: Wallet,
  },
];

const TOOL_LINKS = [
  { href: "/talents", label: "Find talents" },
  { href: "/products", label: "Buy media" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/products/media-cart", label: "Media cart" },
];

const PLACEHOLDER_PROMPTS = [
  "Plan a TV + creator launch for Christmas…",
  "Build a media mix for a Ghana product launch…",
  "Brief a short brand film for social and TV…",
  "Plan a music video campaign with creators…",
  "Compare ROI between TV and digital ads…",
  "Budget my advertising spend across channels…",
];

function useTypingPlaceholder(prompts, { enabled = true } = {}) {
  const [text, setText] = useState("");
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const deletingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !prompts?.length) {
      setText("");
      return undefined;
    }

    let timeoutId;
    const typeSpeed = 38;
    const deleteSpeed = 22;
    const holdFull = 2200;
    const holdEmpty = 420;

    const tick = () => {
      const full = prompts[indexRef.current % prompts.length];

      if (!deletingRef.current) {
        charRef.current = Math.min(charRef.current + 1, full.length);
        setText(full.slice(0, charRef.current));

        if (charRef.current === full.length) {
          timeoutId = setTimeout(() => {
            deletingRef.current = true;
            tick();
          }, holdFull);
          return;
        }

        timeoutId = setTimeout(tick, typeSpeed);
        return;
      }

      charRef.current = Math.max(charRef.current - 1, 0);
      setText(full.slice(0, charRef.current));

      if (charRef.current === 0) {
        deletingRef.current = false;
        indexRef.current = (indexRef.current + 1) % prompts.length;
        timeoutId = setTimeout(tick, holdEmpty);
        return;
      }

      timeoutId = setTimeout(tick, deleteSpeed);
    };

    timeoutId = setTimeout(tick, 280);
    return () => clearTimeout(timeoutId);
  }, [enabled, prompts]);

  return text;
}

export default function ChatPage() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [mode, setMode] = useState("agents");
  const [copiedId, setCopiedId] = useState(null);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const busy = status === "in_progress" || status === "submitted";
  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [mode, hasMessages]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred. Please try again.");
    }
  }, [error]);

  const send = (text) => {
    const input = String(text || "").trim();
    if (!input || busy) return;
    sendMessage({ text: input });
    setDraft("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send(draft);
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  return (
    <div className="relative mx-auto flex h-full w-full max-w-[64rem] flex-col px-4 text-zinc-100 sm:px-6">
      {!hasMessages ? (
        <div className="relative flex min-h-0 flex-1 flex-col">
          {/* Balanced vertical band: fills the page without floating too high or low */}
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-0 pb-[4.5rem] pt-2 sm:pb-20">
            <div className="flex w-full max-w-[56rem] -translate-y-[8vh] flex-col items-center sm:-translate-y-[10vh] md:-translate-y-[12vh]">
              <h1 className="text-center text-[1.85rem] font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
                What are we planning today?
              </h1>

              <div className="mt-[clamp(1.25rem,3.5vh,2rem)] inline-flex rounded-full border border-white/10 bg-[#141414] p-1">
                {MODES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={cn(
                      "rounded-full px-5 py-2 text-sm font-medium transition",
                      mode === item.id
                        ? "bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.16)]"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {mode === "agents" ? (
                <>
                  <Composer
                    draft={draft}
                    setDraft={setDraft}
                    busy={busy}
                    onSubmit={handleSubmit}
                    textareaRef={textareaRef}
                    onResize={resizeTextarea}
                    className="mt-[clamp(1.5rem,4vh,2.25rem)] w-full"
                    spacious
                    animatePlaceholder
                  />

                  <div className="mt-[clamp(0.5rem,1.5vh,0.75rem)] flex w-full flex-wrap items-center justify-center gap-2">
                    {SHORTCUTS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={busy}
                          onClick={() => send(item.question)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-[#141414] px-3.5 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-[#1a1a1a] hover:text-white disabled:opacity-50"
                        >
                          <Icon className="h-3.5 w-3.5 text-zinc-500" />
                          {item.label}
                          {item.badge ? (
                            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                              {item.badge}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#141414] text-zinc-400 hover:border-white/20 hover:text-white"
                      aria-label="More prompts"
                      onClick={() => toast.message("More prompt packs coming soon.")}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                </>
              ) : (
                <div className="mt-[clamp(1.5rem,4vh,2.25rem)] grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  {TOOL_LINKS.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-[#141414] px-4 py-4 transition hover:border-white/20 hover:bg-[#1a1a1a]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-300 ring-1 ring-white/10 group-hover:text-white">
                        <Wrench className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-white">{tool.label}</p>
                        <p className="text-xs text-zinc-500">Open in Payollar</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] text-zinc-600 sm:bottom-4">
            Powered by Groq · AI can make mistakes. Verify important information.
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col py-3 sm:py-4">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
            <div className="inline-flex rounded-full border border-white/10 bg-[#141414] p-1">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                    mode === item.id
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-white/20 hover:text-white"
            >
              New chat
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4 pr-1">
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
                      "relative max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[85%]",
                      message.role === "user"
                        ? "rounded-tr-sm bg-[#ff4d8d] text-white"
                        : "border border-white/10 bg-[#141414] text-zinc-100"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-[#ff4d8d]" />
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
                    ) : null}

                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-invert prose-p:text-zinc-200 prose-strong:text-white">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 text-sm leading-relaxed last:mb-0">
                                {children}
                              </p>
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
                              <code className="rounded bg-black/40 px-1 font-mono text-[0.85em]">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="mb-2 overflow-x-auto rounded-lg bg-black/50 p-3 text-sm">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {messageText}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {messageText}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {busy ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#141414] px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-[#ff4d8d]" />
                  <span className="text-sm text-zinc-400">Thinking…</span>
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <Composer
            draft={draft}
            setDraft={setDraft}
            busy={busy}
            onSubmit={handleSubmit}
            textareaRef={textareaRef}
            onResize={resizeTextarea}
            className="mt-auto w-full shrink-0"
          />
          <p className="mt-2 shrink-0 pb-1 text-center text-[11px] text-zinc-600">
            Powered by Groq · AI can make mistakes. Verify important information.
          </p>
        </div>
      )}
    </div>
  );
}

function Composer({
  draft,
  setDraft,
  busy,
  onSubmit,
  textareaRef,
  onResize,
  className,
  spacious = false,
  animatePlaceholder = false,
}) {
  const typingPlaceholder = useTypingPlaceholder(PLACEHOLDER_PROMPTS, {
    enabled: animatePlaceholder && !draft.trim(),
  });
  const placeholder = animatePlaceholder
    ? typingPlaceholder || " "
    : "Ask Payollar AI…";

  return (
    <BorderBeam
      size="md"
      theme="dark"
      colorVariant="colorful"
      strength={0.75}
      borderRadius={28}
      duration={6}
      className={cn("w-full", className)}
    >
      <form
        onSubmit={onSubmit}
        className="relative rounded-[1.75rem] border border-white/10 bg-[#161616] p-3 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] sm:p-3.5"
      >
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            onResize?.();
          }}
          rows={2}
          disabled={busy}
          placeholder={placeholder}
          className={cn(
            "w-full resize-none bg-transparent px-1 text-[15px] leading-relaxed text-white outline-none placeholder:text-zinc-500 disabled:opacity-60",
            spacious ? "min-h-[64px] sm:min-h-[72px]" : "min-h-[52px] sm:min-h-[56px]"
          )}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit(event);
            }
          }}
        />

        <div className={cn("flex items-center justify-between gap-2", spacious ? "mt-3" : "mt-2.5")}>
          <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-white/20 hover:text-white"
              onClick={() => toast.message("Attachments coming soon.")}
              aria-label="Add attachment"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs font-medium text-zinc-300 hover:border-white/20 hover:text-white"
              onClick={() => toast.message("Chat Mode is ready — more modes soon.")}
            >
              <Clapperboard className="h-3.5 w-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Chat Mode</span>
              <span className="sm:hidden">Chat</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
            </button>
            <button
              type="button"
              className="hidden h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs font-medium text-zinc-300 hover:border-white/20 hover:text-white md:inline-flex"
              onClick={() => toast.message("Running on Groq Llama 3.3 70B.")}
            >
              <Globe2 className="h-3.5 w-3.5 text-zinc-500" />
              Groq Llama 3.3
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              className="hidden h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs font-medium text-zinc-300 hover:border-white/20 hover:text-white sm:inline-flex"
              onClick={() => toast.message("Ask-first review stays on for safety.")}
            >
              Ask first
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
              aria-label="Voice input"
              onClick={() => toast.message("Voice input coming soon.")}
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff4d8d] text-white transition hover:bg-[#ff3b80] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </form>
    </BorderBeam>
  );
}
