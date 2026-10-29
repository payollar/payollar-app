"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { platforms } from "@/components/clip/platform-icons";

const stills = [
  { src: "/images/ayra.jpg", alt: "Creator close-up" },
  { src: "/images/fave.jpg", alt: "Portrait on a red backdrop" },
  { src: "/images/mellisa.jpg", alt: "Creator riding through the city" },
  { src: "/host.jpeg", alt: "Host speaking on stage" },
  { src: "/dj.jpeg", alt: "DJ at the decks" },
  { src: "/voice.jpeg", alt: "Singer at a microphone" },
  { src: "/content.jpeg", alt: "Creator in a leather jacket" },
  { src: "/producer.jpeg", alt: "Producer at a console" },
  { src: "/foodcontent.jpg", alt: "Food being photographed" },
  { src: "/clipping.jpg", alt: "Edit bay with a timeline on screen" },
  { src: "/fashionshow.jpg", alt: "Model on a runway" },
  { src: "/images/russ.jpg", alt: "Artist portrait" },
  { src: "/vlog.jpg", alt: "Beach travel still" },
  { src: "/bloggers.jpg", alt: "Creator working outside" },
  { src: "/techproduct.jpg", alt: "Product flat lay" },
];

const moments = [
  { at: "02:14", line: "Stop posting the whole episode.", score: 96, image: "/host.jpeg", alt: "Host speaking on stage" },
  { at: "11:02", line: "I cut my posting time in half.", score: 91, image: "/images/mellisa.jpg", alt: "Creator riding through the city" },
  { at: "27:40", line: "Here's the cut I actually post.", score: 88, image: "/dj.jpeg", alt: "DJ at the decks" },
  { at: "36:18", line: "The caption does half the work.", score: 74, image: "/images/fave.jpg", alt: "Portrait on a red backdrop" },
];

const plans = [
  {
    name: "Free",
    monthly: 0,
    annual: 0,
    blurb: "See if the cuts are worth posting.",
    points: ["60 minutes of source each month", "Up to 5 finished clips", "720p with a Payollar end card", "Auto captions"],
    cta: "Start free",
  },
  {
    name: "Creator",
    monthly: 24,
    annual: 19,
    blurb: "A posting week from every recording.",
    points: [
      "8 hours of source each month",
      "1080p, no end card",
      "Brand font, color, and logo",
      "9:16, 1:1, and 16:9 from one cut",
      "A review link before anything posts",
    ],
    cta: "Clip as a creator",
    featured: true,
  },
  {
    name: "Studio",
    monthly: 79,
    annual: 63,
    blurb: "For shows that still have an editor in the loop.",
    points: ["40 hours of source each month", "4 seats on one board", "4K files", "Priority render", "Client approval on the same link"],
    cta: "Open a studio",
  },
];

const faqs = [
  {
    q: "What can I clip?",
    a: "A YouTube link, a podcast video, a stream recording, or a file you add after you sign in. The studio on this page is the same review step: score, caption, ratio, then approve.",
  },
  {
    q: "Do I have to post what it finds?",
    a: "No. Clips sit on a board. You keep one, rewrite the caption, or drop it. Nothing posts until you approve it.",
  },
  {
    q: "Will the captions look like a paragraph?",
    a: "They are written for a vertical frame: short lines, a hard stop, and clear space where the platform UI sits.",
  },
  {
    q: "Can someone else finish the cut?",
    a: "Studio plans share the board with an editor or a client. If you want a person to deliver the week, book a clipping team from Payollar’s media marketplace.",
  },
  {
    q: "What happens to the source file?",
    a: "It stays on the project and is used to render the clips you keep. Delete the project when the week is posted.",
  },
];

const week = [
  { day: "Mon", title: "Hook", on: true, image: "/host.jpeg", alt: "Host speaking on stage" },
  { day: "Tue", title: "Story", on: true, image: "/images/mellisa.jpg", alt: "Creator riding through the city" },
  { day: "Wed", title: "—", on: false },
  { day: "Thu", title: "Demo", on: true, image: "/dj.jpeg", alt: "DJ at the decks" },
  { day: "Fri", title: "—", on: false },
  { day: "Sat", title: "Quote", on: true, image: "/voice.jpeg", alt: "Singer at a microphone" },
  { day: "Sun", title: "—", on: false },
];

export function ClipSections() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <section className="relative overflow-hidden border-y border-white/8 py-4" aria-label="Platforms">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-[#07080d] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-[#07080d] to-transparent sm:w-24" />
        <div className="animate-marquee inline-flex" style={{ width: "max-content", maxWidth: "none" }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="inline-flex gap-3 pr-3" style={{ width: "max-content", maxWidth: "none" }} aria-hidden={copy === 1 || undefined}>
              {Array.from({ length: 4 }, (_, repeat) =>
                platforms.map(({ name, Icon }) => {
                  const iconOnly = name === "X";
                  return (
                    <span
                      key={`${name}-${copy}-${repeat}`}
                      className={cn(
                        "inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 text-sm text-white/70",
                        iconOnly ? "px-2.5 py-2" : "px-4 py-2"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {iconOnly ? <span className="sr-only">{name}</span> : name}
                    </span>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden py-4" aria-label="Creator stills from the library">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-[#07080d] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-[#07080d] to-transparent sm:w-24" />
        <div className="animate-marquee inline-flex" style={{ width: "max-content", maxWidth: "none" }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="inline-flex gap-3 pr-3" style={{ width: "max-content", maxWidth: "none" }} aria-hidden={copy === 1 || undefined}>
              {Array.from({ length: 3 }, (_, repeat) =>
                stills.map((still) => (
                  <div key={`${still.src}-${copy}-${repeat}`} className="relative h-36 w-24 shrink-0 overflow-hidden rounded-2xl">
                    <Image src={still.src} alt={copy === 0 && repeat === 0 ? still.alt : ""} fill className="object-cover" sizes="96px" />
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
          {[
            ["8–15", "postable cuts from a 45-minute episode"],
            ["3 ratios", "from the cut you already approved"],
            ["You approve", "before a file ever leaves the board"],
          ].map(([stat, label]) => (
            <div key={stat} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6">
              <p className="text-3xl font-semibold tracking-tight">{stat}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="product" className="scroll-mt-28 px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">Product</p>
          <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            The cut, the caption, and the frame. Together.
          </h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-12">
            <article className="rounded-3xl border border-white/10 bg-[#10131c] p-5 sm:p-6 lg:col-span-7">
              <h3 className="text-lg font-semibold">Moment radar</h3>
              <p className="mt-1 max-w-md text-sm text-white/55">
                Lines are ranked by how hard they open, not by how long the speaker talked.
              </p>
              <ul className="mt-6 space-y-3">
                {moments.map((moment) => (
                  <li key={moment.at} className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3">
                    <span className="relative size-10 overflow-hidden rounded-lg">
                      <Image src={moment.image} alt={moment.alt} fill className="object-cover" sizes="40px" />
                    </span>
                    <span className="w-12 text-xs tabular-nums text-white/40">{moment.at}</span>
                    <div>
                      <p className="text-sm">{moment.line}</p>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-[#0055ff]" style={{ width: `${moment.score}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-emerald-300">{moment.score}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="flex flex-col rounded-3xl border border-white/10 bg-[#10131c] p-5 sm:p-6 lg:col-span-5">
              <h3 className="text-lg font-semibold">Captions that fit the frame</h3>
              <p className="mt-1 text-sm text-white/55">Two lines. A hard stop. Room for the platform buttons.</p>
              <div className="relative mx-auto mt-6 aspect-[9/16] w-40 overflow-hidden rounded-[1.6rem] border border-white/10">
                <Image
                  src="/images/ayra.jpg"
                  alt="Vertical clip of a creator with a caption over the lower third"
                  fill
                  className="object-cover"
                  sizes="160px"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20" />
                <p className="absolute inset-x-2 bottom-3 rounded-lg bg-black/75 px-2 py-1.5 text-center text-xs font-medium leading-snug">
                  Stop posting the whole episode.
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-[#10131c] p-5 sm:p-6 lg:col-span-4">
              <h3 className="text-lg font-semibold">Speaker stays in frame</h3>
              <p className="mt-1 text-sm text-white/55">A wide interview becomes a vertical cut without losing the face.</p>
              <div className="mt-6 flex items-end gap-3">
                <div className="relative h-16 flex-1 overflow-hidden rounded-lg border border-white/10">
                  <Image src="/host.jpeg" alt="Wide interview frame" fill className="object-cover object-[center_30%]" sizes="240px" />
                </div>
                <div className="relative h-28 w-16 overflow-hidden rounded-lg ring-2 ring-[#0055ff]">
                  <Image
                    src="/host.jpeg"
                    alt="The same interview cropped vertical so the speaker stays centered"
                    fill
                    className="object-cover object-[center_18%]"
                    sizes="80px"
                  />
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-[#10131c] p-5 sm:p-6 lg:col-span-4">
              <h3 className="text-lg font-semibold">Brand kit</h3>
              <p className="mt-1 text-sm text-white/55">Font, color, logo bug, and the end card you already use.</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-xl bg-[#0055ff] text-lg font-semibold">P</span>
                <div>
                  <p className="text-sm font-medium">DM Sans</p>
                  <div className="mt-2 flex gap-1.5">
                    {["#0055ff", "#ffffff", "#34d399", "#07080d"].map((color) => (
                      <span key={color} className="size-4 rounded-full border border-white/20" style={{ background: color }} />
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-[#10131c] p-5 sm:p-6 lg:col-span-4">
              <h3 className="text-lg font-semibold">One approval, three files</h3>
              <p className="mt-1 text-sm text-white/55">Keep the cut once. The same frame goes out in the ratios each feed uses.</p>
              <div className="mt-6 flex items-end gap-2">
                <RatioStill label="9:16" className="h-24 w-14" position="center 20%" />
                <RatioStill label="1:1" className="size-16" position="center 30%" />
                <RatioStill label="16:9" className="h-12 flex-1" position="center 35%" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2" aria-label="Platforms">
                {platforms.map(({ name, Icon }) => (
                  <span key={name} title={name} className="inline-flex size-8 items-center justify-center rounded-full border border-white/10 text-white/70">
                    <Icon className="size-3.5" />
                    <span className="sr-only">{name}</span>
                  </span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="workflow" className="scroll-mt-28 border-y border-white/8 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">How it works</p>
          <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">From the recording to the week.</h2>
          <ol className="mt-10 grid gap-4 lg:grid-cols-3">
            <li className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-medium text-[#7aa6ff]">01</p>
              <h3 className="mt-3 text-xl font-semibold">Bring the long video</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Paste the link you already sent your editor. Clip reads the talk, not just the loud parts.
              </p>
              <div className="relative mt-5 h-36 overflow-hidden rounded-2xl">
                <Image
                  src="/clipping.jpg"
                  alt="Edit bay with a timeline open on the monitor"
                  fill
                  className="object-cover object-[center_30%]"
                  sizes="360px"
                />
              </div>
            </li>
            <li className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-medium text-[#7aa6ff]">02</p>
              <h3 className="mt-3 text-xl font-semibold">Keep what scores</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Open the high scores first. Rewrite a caption, change the ratio, or throw the clip out.
              </p>
            </li>
            <li className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-medium text-[#7aa6ff]">03</p>
              <h3 className="mt-3 text-xl font-semibold">Lay out the week</h3>
              <div className="mt-4 grid grid-cols-7 gap-1">
                {week.map((slot) => (
                  <div key={slot.day} className="text-center">
                    <p className="text-[10px] text-white/40">{slot.day}</p>
                    <div className="relative mt-1 h-12 overflow-hidden rounded-md bg-white/5">
                      {slot.on && slot.image ? (
                        <Image src={slot.image} alt={slot.alt} fill className="object-cover" sizes="48px" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/25">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-28 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">Pricing</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Pay for the hours you record.</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 p-1" role="group" aria-label="Billing period">
              <button
                type="button"
                aria-pressed={!annual}
                onClick={() => setAnnual(false)}
                className={cn("rounded-full px-3 py-1.5 text-sm", !annual ? "bg-white text-black" : "text-white/60")}
              >
                Monthly
              </button>
              <button
                type="button"
                aria-pressed={annual}
                onClick={() => setAnnual(true)}
                className={cn("rounded-full px-3 py-1.5 text-sm", annual ? "bg-white text-black" : "text-white/60")}
              >
                Yearly · save 20%
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const price = annual ? plan.annual : plan.monthly;
              return (
                <article
                  key={plan.name}
                  className={cn(
                    "flex flex-col rounded-3xl border p-6",
                    plan.featured ? "border-[#0055ff] bg-[#0055ff]/10" : "border-white/10 bg-[#10131c]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.featured && (
                      <span className="rounded-full bg-[#0055ff] px-2 py-0.5 text-[11px] font-medium">Most creators</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-white/55">{plan.blurb}</p>
                  <p className="mt-6 flex items-end gap-1">
                    <span className="text-4xl font-semibold tracking-tight">${price}</span>
                    <span className="mb-1 text-sm text-white/45">/ month</span>
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    {price === 0 ? "No card to try the first hour." : annual ? "Billed yearly." : "Billed monthly."}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2 text-sm text-white/75">
                    {plan.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-up"
                    className={cn(
                      "mt-8 inline-flex h-11 items-center justify-center rounded-full text-sm font-medium",
                      plan.featured ? "bg-white text-black hover:bg-white/90" : "bg-white/10 text-white hover:bg-white/15"
                    )}
                  >
                    {plan.cta}
                  </Link>
                </article>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-white/45">
            Want a person to cut the week instead?{" "}
            <Link href="/products/video-clipping" className="text-white underline-offset-4 hover:underline">
              Book a clipping team
            </Link>
            .
          </p>
        </div>
      </section>

      <section id="faq" className="scroll-mt-28 px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-semibold tracking-tight">Questions creators ask first</h2>
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
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#10131c] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="px-6 py-14 sm:px-12">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7aa6ff]">Start with a link</p>
            <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              The episode is done. The posts are not.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#try"
                className="inline-flex h-11 items-center rounded-full bg-[#0055ff] px-5 text-sm font-medium text-white hover:bg-[#1a66ff]"
              >
                Try a sample episode
              </a>
              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm font-medium text-white hover:bg-white/5"
              >
                Create an account
              </Link>
            </div>
          </div>
          <div className="relative min-h-64">
            <Image
              src="/clipping.jpg"
              alt="An edit bay with a timeline open on the monitor"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 480px, 100vw"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">
              Payollar <span className="text-[#7aa6ff]">Clip</span>
            </p>
            <p className="mt-1 text-sm text-white/45">Clipping for creators. The rest of Payollar still books the humans.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55">
            <Link href="/academy" className="hover:text-white">
              Academy
            </Link>
            <Link href="/" className="hover:text-white">
              Payollar home
            </Link>
            <Link href="/pricing" className="hover:text-white">
              Platform pricing
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

function RatioStill({ label, className, position }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md border border-white/15", className)}>
      <Image
        src="/dj.jpeg"
        alt={`DJ clip framed as ${label}`}
        fill
        className="object-cover"
        style={{ objectPosition: position }}
        sizes="140px"
      />
      <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] text-white">{label}</span>
    </div>
  );
}
