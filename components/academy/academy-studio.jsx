"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeDollarSign, Check, Clapperboard, Heart, Package, Video, Workflow } from "lucide-react";
import { products, replyFor } from "@/components/academy/products";
import { cn } from "@/lib/utils";

function seed(product) {
  return [
    { id: "user-0", role: "you", text: product.opener },
    { id: "ai-0", role: "ai", text: product.reply },
  ];
}

export function AcademyStudio() {
  const [activeId, setActiveId] = useState(products[0].id);
  const [draft, setDraft] = useState("");
  const [threads, setThreads] = useState(() =>
    Object.fromEntries(products.map((product) => [product.id, seed(product)]))
  );

  const product = products.find((item) => item.id === activeId) ?? products[0];
  const messages = threads[product.id];

  function choose(id) {
    setActiveId(id);
    setDraft("");
    const desk = document.getElementById("desk");
    if (desk && desk.getBoundingClientRect().top < 0) {
      desk.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function ask(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const answer = replyFor(product, text);
    setThreads((current) => ({
      ...current,
      [product.id]: [
        ...current[product.id],
        { id: `you-${Date.now()}`, role: "you", text },
        { id: `ai-${Date.now()}`, role: "ai", text: answer },
      ],
    }));
    setDraft("");
  }

  return (
    <>
      <section id="desk" className="scroll-mt-24 px-4 pb-8 pt-28 sm:px-6 lg:pt-32">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1.5 pr-3 text-sm text-white/80">
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-black">Academy</span>
              <span style={{ fontFamily: "var(--font-handwriting), cursive" }} className="text-base text-white/85">
                one AI per product
              </span>
            </p>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-[4.2rem]">
              Buy the product.
              <span className="mt-1 block bg-linear-to-r from-white via-blue-100 to-[#9eb6ff] bg-clip-text text-transparent">
                Keep the AI.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
              Payollar Academy sells systems creators use to make money. Each one includes an AI that only knows that
              system. It sets up the tools, the workflow, and the first week, and it stays to answer what you ask.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#products"
                className="inline-flex h-11 items-center rounded-full bg-[#0055ff] px-5 text-sm font-medium text-white hover:bg-[#1a66ff]"
              >
                Browse products
              </a>
              <Link
                href="/clip"
                className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm font-medium text-white hover:bg-white/5"
              >
                See Payollar Clip
              </Link>
            </div>
          </div>

          <Desk product={product} messages={messages} draft={draft} onDraft={setDraft} onAsk={ask} />
        </div>
      </section>

      <section id="products" className="scroll-mt-28 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">Products</p>
          <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Five systems. Each one keeps its own AI.
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((item) => (
              <ProductCard key={item.id} item={item} selected={item.id === product.id} onChoose={() => choose(item.id)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const tones = {
  clipping: "#ddd6ff",
  faceless: "#d8d0ff",
  automation: "#d5e0fb",
  product: "#e3d9ff",
  monetization: "#d4e2ff",
};

const chips = {
  clipping: "Copilot",
  faceless: "Faceless",
  automation: "Architect",
  product: "Builder",
  monetization: "Strategist",
};

const icons = {
  clipping: Clapperboard,
  faceless: Video,
  automation: Workflow,
  product: Package,
  monetization: BadgeDollarSign,
};

function ProductCard({ item, selected, onChoose }) {
  const chip = chips[item.id] ?? item.ai;
  const Icon = icons[item.id] ?? Clapperboard;

  return (
    <button
      type="button"
      onClick={onChoose}
      aria-pressed={selected}
      aria-label={`${item.name}. ${item.ai}. $${item.price}. Open this AI.`}
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[1.85rem] px-3 pb-3 pt-8 text-left transition-transform hover:-translate-y-0.5",
        selected && "ring-2 ring-[#0055ff]"
      )}
      style={{ backgroundColor: tones[item.id] ?? "#ddd6ff" }}
    >
      <div className="relative flex flex-1 flex-col rounded-[1.5rem] bg-white px-5 pb-5 pt-9 text-[#17191f] shadow-[0_18px_40px_rgba(20,16,50,0.12)]">
        <span className="absolute left-1/2 top-0 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-black text-white shadow-md">
          <Icon className="size-5" aria-hidden />
        </span>
        <h3 className="text-[1.35rem] font-semibold leading-[1.15] tracking-tight">{item.name}</h3>
        <p className="mt-1.5 text-[13px] font-medium text-[#0055ff]">{item.ai}</p>
        <p className="mt-3 line-clamp-3 min-h-[4.2rem] text-sm leading-relaxed text-[#6a6f7c]">{item.summary}</p>
        <p className="mt-4 text-lg font-medium text-[#0055ff]">${item.price}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <span className="flex h-11 items-center justify-center gap-1 rounded-full bg-[#ece7ff] px-2.5 text-center text-[11px] font-semibold leading-tight text-[#1b1c22]">
            <span className="min-w-0 text-balance">{chip}</span>
            <span className="shrink-0 font-medium">${item.price}</span>
          </span>
          <span className="flex h-11 items-center justify-center gap-1 rounded-full border border-[#ececf2] bg-white px-2.5 text-center text-[11px] font-semibold leading-tight text-[#1b1c22]">
            <span>One-time</span>
            <span className="shrink-0 font-medium text-[#8d909a]">${item.price}</span>
          </span>
        </div>
        <div className="mt-auto flex items-center gap-3 pt-4">
          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-full border border-[#e6e6ec]",
              selected && "border-[#d9e2ff] bg-[#f3f6ff]"
            )}
          >
            <Heart className={cn("size-4 text-[#1b1c22]", selected && "fill-[#0055ff] text-[#0055ff]")} />
          </span>
          <span className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white">
            Open the AI
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </button>
  );
}

function Desk({ product, messages, draft, onDraft, onAsk }) {
  const Icon = icons[product.id] ?? Clapperboard;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-8 rounded-full bg-[#0055ff]/20 blur-3xl" aria-hidden />
      <div className="relative rounded-3xl border border-white/10 bg-[#0c0f18] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              <span className="grid size-7 place-items-center rounded-lg bg-black text-white">
                <Icon className="size-3.5" aria-hidden />
              </span>
              {product.ai}
            </p>
            <p className="mt-0.5 text-xs text-white/45">Included with {product.name}</p>
          </div>
          <p className="text-sm text-white/70">${product.price}</p>
        </div>

        <ul className="grid grid-cols-2 gap-2 px-4 py-4 sm:px-5">
          {product.checks.map((item) => (
            <li key={item} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm">
              <Check className="size-3.5 shrink-0 text-emerald-300" />
              {item}
            </li>
          ))}
        </ul>

        <div className="space-y-3 px-4 pb-2 sm:px-5" aria-live="polite">
          {messages.map((message) => (
            <p
              key={message.id}
              className={cn(
                "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                message.role === "you" ? "ml-auto bg-white text-black" : "bg-white/8 text-white/85"
              )}
            >
              {message.role === "ai" && <span className="mb-1 block text-[11px] text-[#9eb6ff]">{product.ai}</span>}
              {message.text}
            </p>
          ))}
        </div>

        <form onSubmit={onAsk} className="flex gap-2 border-t border-white/8 p-3 sm:p-4">
          <label htmlFor="academy-ask" className="sr-only">
            Ask {product.ai}
          </label>
          <input
            id="academy-ask"
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            placeholder={`Ask ${product.ai}`}
            className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none placeholder:text-white/35"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-1 rounded-xl bg-[#0055ff] px-3 text-sm font-medium text-white hover:bg-[#1a66ff]"
          >
            Send
            <ArrowUpRight className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
