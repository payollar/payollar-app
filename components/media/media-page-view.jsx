"use client";

import { motion } from "motion/react";
import Balancer from "react-wrap-balancer";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SectionBadge } from "@/components/ui/section-badge";
import { SectionShell } from "@/components/landing/section-shell";
import { Footer } from "@/components/landing/footer";
import { MediaListingsGrid } from "@/components/media/media-listings-grid";
import { ArrowRight, Search, MapPin, DollarSign, Users, Calendar, Sparkles } from "lucide-react";

const sectionTitle =
  "text-3xl md:text-4xl font-medium bg-linear-to-r from-foreground to-foreground/70 text-transparent bg-clip-text text-balance text-center leading-tight";
const sectionDesc =
  "text-base md:text-lg text-muted-foreground text-balance text-center max-w-lg mx-auto mt-4";

const WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Browse",
    description: "Explore channels and registered stations that fit your audience and budget.",
  },
  {
    number: "02",
    title: "Book",
    description: "Reserve airtime and packages with clear pricing and schedules.",
  },
  {
    number: "03",
    title: "Launch",
    description: "Upload creative assets and track your campaign from one dashboard.",
  },
];

const STATS = [
  { value: "100+", label: "Media partners" },
  { value: "98%", label: "Booking success" },
  { value: "₵100k+", label: "Ad spend managed" },
  { value: "24/7", label: "Support" },
];

export function MediaPageView({ listingsByType }) {
  const lineOne = ["Connect", "with", "every"];
  const lineTwo = ["media", "channel"];

  return (
    <div className="relative z-10 w-full min-h-dvh pt-20 md:pt-24">
      {/* Hero — Avento-style centered + framed preview */}
      <section className="relative flex w-full flex-col items-center justify-center overflow-hidden pb-8 pt-20 lg:pb-12 lg:pt-28">
        <SectionShell className="relative z-10 max-w-[90rem]">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-full py-1.5 pl-1.5 pr-2",
                "badge-glow backdrop-blur-md"
              )}
            >
              <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-semibold text-background">New</span>
              <span className="text-sm font-medium text-foreground/80">Payollar media hub</span>
            </motion.div>

            <h1 className="mt-8 text-4xl font-semibold tracking-tight md:text-6xl">
              <Balancer>
                {lineOne.map((word, index) => (
                  <motion.span
                    key={word + index}
                    initial={{ filter: "blur(10px)", opacity: 0, y: 10 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
                <br />
                {lineTwo.map((word, index) => (
                  <motion.span
                    key={word + index}
                    initial={{ filter: "blur(10px)", opacity: 0, y: 10 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: (lineOne.length + index) * 0.05 }}
                    className={cn(
                      "inline-block",
                      word === "media" &&
                        "bg-linear-to-r from-primary via-blue-500 to-primary bg-size-[200%_100%] animate-[shimmer_3s_ease-in-out_infinite] bg-clip-text text-transparent"
                    )}
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </Balancer>
            </h1>

            <p className="mt-6 max-w-2xl text-base text-foreground/70 md:text-lg">
              <Balancer>
                TV, radio, billboard, and digital—discover inventory, book slots, and run campaigns without juggling
                spreadsheets or endless email threads.
              </Balancer>
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <Button asChild size="lg" variant="marketing" className="rounded-full shadow-lg shadow-primary/25">
                <Link href="/products">
                  Explore services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-primary/40 bg-transparent hover:bg-primary/10">
                <Link href="#browse">
                  <Calendar className="mr-2 h-4 w-4" />
                  Browse inventory
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, filter: "blur(20px)", y: 30 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative mt-12 w-full max-w-4xl lg:mt-16"
            >
              <div className="relative rounded-2xl border border-foreground/10 bg-foreground/5 p-2 backdrop-blur-lg md:rounded-[32px]">
                <div className="absolute left-1/2 top-1/4 -z-10 h-1/3 w-4/5 -translate-x-1/2 -translate-y-1/2 bg-primary/20 opacity-50 blur-[10rem]" />
                <div className="overflow-hidden rounded-lg border border-foreground/10 bg-background md:rounded-[24px]">
                  <div className="grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-6 md:grid-cols-4">
                    {STATS.map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl border border-border/60 bg-card/80 px-4 py-4 text-center shadow-sm"
                      >
                        <div className="text-2xl font-bold tracking-tight text-foreground">{s.value}</div>
                        <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-3/4 bg-linear-to-t from-background to-transparent from-10%" />
              <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-1/10 w-3/5 rounded-full bg-primary opacity-40 blur-[4rem]" />
            </motion.div>
          </div>
        </SectionShell>
      </section>

      {/* Listings */}
      <section id="browse" className="relative w-full overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute -left-1/4 top-0 -z-10 hidden size-1/3 rounded-full bg-primary/10 blur-[8rem] lg:block" />
        <SectionShell className="relative z-10 max-w-[90rem]">
          <div className="flex flex-col items-center text-center">
            <SectionBadge title="Inventory" />
            <motion.h2
              className={cn(sectionTitle, "mt-6")}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Channels & listings
            </motion.h2>
            <motion.p
              className={sectionDesc}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Choose a channel to buy media, or open a listing to schedule with a partner.
            </motion.p>
          </div>
          <div className="mt-12">
            <MediaListingsGrid listingsByType={listingsByType} />
          </div>
        </SectionShell>
      </section>

      {/* Workflow — Avento `workflow.tsx` large numerals */}
      <section className="relative w-full overflow-hidden py-16 lg:py-24">
        <div className="pointer-events-none absolute -right-1/4 top-0 -z-10 hidden size-1/3 rounded-full bg-primary/10 blur-[8rem] lg:block" />
        <SectionShell className="max-w-[90rem]">
          <div className="flex flex-col items-center text-center">
            <SectionBadge title="Workflow" />
            <motion.h2
              className={cn(sectionTitle, "mt-6")}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              From browse to broadcast
              <br />
              in three steps
            </motion.h2>
            <motion.p
              className={sectionDesc}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              One place to plan, book, and launch your media buys
            </motion.p>
          </div>

          <div className="relative mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-y-14 gap-x-8 md:grid-cols-3 md:gap-y-8 lg:gap-x-16">
            {WORKFLOW_STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.35 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "select-none text-[100px] font-bold leading-none md:text-[120px]",
                    "bg-linear-to-b from-primary/40 to-primary/0 bg-clip-text text-transparent"
                  )}
                >
                  {step.number}
                </div>
                <div className="-mt-7 flex flex-col items-center">
                  <h3 className="text-xl font-semibold md:text-2xl">{step.title}</h3>
                  <p className="mt-1 max-w-[280px] text-sm leading-relaxed text-muted-foreground text-balance">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionShell>
      </section>

      {/* Search — black band */}
      <section className="w-full bg-black text-foreground">
        <SectionShell className="max-w-[90rem] py-12 md:py-16">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 to-black p-8 shadow-lg shadow-black/40 md:p-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <Badge variant="secondary" className="mb-4 border border-primary/25 bg-primary/10 text-primary">
                <Search className="mr-1.5 h-3.5 w-3.5" />
                Search
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Find the right placement</h2>
              <p className="mt-3 max-w-2xl text-white/70">
                Filter by location, audience, or format to narrow your next media buy.
              </p>
            </div>
            <div className="mx-auto max-w-2xl space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  placeholder="Search by location, audience, or media type…"
                  className="h-12 border-white/15 bg-white/[0.06] pl-10 text-white placeholder:text-white/40 shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/25"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { icon: MapPin, label: "All locations" },
                  { icon: Users, label: "All demographics" },
                  { icon: DollarSign, label: "Any budget" },
                ].map(({ icon: Icon, label }) => (
                  <Badge
                    key={label}
                    variant="secondary"
                    className="cursor-default border border-primary/25 bg-primary/10 px-3 py-1.5 text-primary"
                  >
                    <Icon className="mr-1 h-3 w-3" />
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </SectionShell>
      </section>

      {/* CTA — Avento `cta.tsx` grid + radial mask + glow */}
      <section className="relative w-full overflow-hidden py-16 lg:pb-24 lg:pt-16">
        <SectionShell className="max-w-[90rem]">
          <div className="relative mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative z-0 overflow-visible rounded-3xl"
            >
              <div
                className="absolute inset-0 -z-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
                  `,
                  backgroundSize: "48px 48px",
                }}
              />
              <div
                className="absolute inset-0 -z-10 bg-background"
                style={{
                  maskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, transparent 40%, white 70%)",
                  WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, transparent 40%, white 70%)",
                }}
              />
              <motion.div
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-1/2 top-1/2 z-0 h-3/4 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[6rem]"
              />
              <div className="relative z-40 flex flex-col items-center px-6 py-14 text-center lg:py-20">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_30px_rgba(0,85,255,0.25)]">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h2 className="mt-8 max-w-3xl text-3xl font-medium leading-[1.2] text-transparent bg-linear-to-r from-foreground to-foreground/70 bg-clip-text md:text-4xl lg:text-5xl">
                  Ready to put your brand
                  <br />
                  on the air?
                </h2>
                <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
                  Explore packages, talk to our team, or start with a single channel—your call.
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="mt-8"
                >
                  <Button asChild size="lg" className="rounded-full text-base">
                    <Link href="/products">Browse all media</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </SectionShell>
      </section>

      <Footer />
    </div>
  );
}
