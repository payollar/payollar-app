"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What do I get when I buy?",
    a: "The system for that subject, and an AI that only knows that system. It sets up the tools, the workflow, and the first week, then stays for the questions that come up while you do it.",
  },
  {
    q: "Does every product have its own AI?",
    a: "Yes. The Clipping Copilot sets up a clipping business. The Monetization Strategist builds the revenue plan. They do not share a single general chat.",
  },
  {
    q: "Can I talk to it after I buy?",
    a: "Yes. The AI stays on that system. Ask it which tool to use, what to build first, or how to reply to a client.",
  },
  {
    q: "How does this sit with Payollar Clip?",
    a: "Clip is the tool that finds the cuts. The Clipping System teaches the business around it, and the AI Clipping Copilot sets up the workflow, the tools, and the first week.",
  },
  {
    q: "Is the price a subscription?",
    a: "Each product is a one-time price. The AI for that product is included.",
  },
];

export function AcademySections() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <section id="how" className="scroll-mt-28 border-y border-white/8 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">How it works</p>
          <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">From the buy to the setup.</h2>
          <ol className="mt-10 grid gap-4 lg:grid-cols-3">
            <li className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-medium text-[#9eb6ff]">01</p>
              <h3 className="mt-3 text-xl font-semibold">Pick the product</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                The Clipping System, a faceless channel, an automation stack, a first digital product, or a monetization plan. The price on the card is the whole buy.
              </p>
            </li>
            <li className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-medium text-[#9eb6ff]">02</p>
              <h3 className="mt-3 text-xl font-semibold">The AI opens your setup</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                It names the tools, makes the folder, and drafts the first week. You approve before anything goes out.
              </p>
            </li>
            <li className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-medium text-[#9eb6ff]">03</p>
              <h3 className="mt-3 text-xl font-semibold">Ask it while you work</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                The same AI answers the next question: a tool, a price, a reply to a buyer. It stays on that product.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-12">
          <article className="rounded-3xl border border-white/10 bg-[#10131c] p-6 lg:col-span-7">
            <h2 className="text-3xl font-semibold tracking-tight">What the AI actually does</h2>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-white/70">
              <li>
                <span className="block text-base font-medium text-white">Tools</span>
                It lists what you need for that product and where each piece goes.
              </li>
              <li>
                <span className="block text-base font-medium text-white">Files</span>
                It drafts the roadmap, the workflow, the offer, or the first week, and leaves them for you to edit.
              </li>
              <li>
                <span className="block text-base font-medium text-white">Replies</span>
                You can ask it how to answer a brand, a client, or a buyer of your own product.
              </li>
            </ul>
          </article>
          <article className="relative min-h-72 overflow-hidden rounded-3xl border border-white/10 lg:col-span-5">
            <Image
              src="/host.jpeg"
              alt="Creator speaking on stage"
              fill
              className="object-cover"
              sizes="480px"
            />
          </article>
        </div>
      </section>

      <section id="faq" className="scroll-mt-28 px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-semibold tracking-tight">Questions before you buy</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {faqs.map((item, index) => {
              const open = openFaq === index;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? -1 : index)}
                  >
                    <span className="text-base font-medium">{item.q}</span>
                    <ChevronDown className={cn("size-4 shrink-0 text-white/50 transition-transform", open && "rotate-180")} />
                  </button>
                  {open && <p className="pb-4 text-sm leading-relaxed text-white/60">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#10131c] px-6 py-14 sm:px-12">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9eb6ff]">Start with clipping</p>
          <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            The recording is done. The business is not.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/60">
            The Clipping System is $49, and the AI Clipping Copilot is included. It sets the roadmap, the tools, and the first week of outreach.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center rounded-full bg-[#0055ff] px-5 text-sm font-medium text-white hover:bg-[#1a66ff]"
            >
              Create an account
            </Link>
            <a
              href="#desk"
              className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm font-medium text-white hover:bg-white/5"
            >
              Ask the Clipping Copilot
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">
              Payollar <span className="text-[#9eb6ff]">Academy</span>
            </p>
            <p className="mt-1 text-sm text-white/45">Digital products for creators. Each one keeps its own AI.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55">
            <Link href="/clip" className="hover:text-white">
              Payollar Clip
            </Link>
            <Link href="/" className="hover:text-white">
              Payollar home
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
