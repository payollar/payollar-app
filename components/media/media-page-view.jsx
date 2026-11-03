"use client";

import { motion } from "motion/react";
import Balancer from "react-wrap-balancer";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionBadge } from "@/components/ui/section-badge";
import { SectionShell } from "@/components/landing/section-shell";
import { Footer } from "@/components/landing/footer";
import { MediaListingsGrid } from "@/components/media/media-listings-grid";
import {
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
  Package,
  Clock,
  Eye,
  Building2,
  CircleCheck,
  Wallet,
  Headset,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  { value: "100+", label: "Media partners", icon: Building2 },
  { value: "98%", label: "Booking success", icon: CircleCheck },
  { value: "₵100k+", label: "Ad spend managed", icon: Wallet },
  { value: "24/7", label: "Support", icon: Headset },
];

const LISTING_TYPE_LABELS = {
  TV: "TV",
  RADIO: "Radio",
  BILLBOARD: "Billboard",
  DIGITAL: "Digital",
  INFLUENCER_MARKETING: "Influencer",
  VIDEO_CLIPPING: "Video",
};

/** Demo TV packages shown until media partners publish live packages. */
const DEMO_TV_PACKAGES = [
  {
    id: "demo-tv-prime",
    name: "Prime Time Package",
    price: 15000,
    duration: "30 seconds",
    spots: 5,
    estimatedViewers: "2.5M+ viewers",
    listingId: null,
    listingName: "TV Media",
    listingType: "TV",
    location: "Nationwide",
    agencyName: "Payollar Demo",
  },
  {
    id: "demo-tv-daytime",
    name: "Daytime Package",
    price: 8000,
    duration: "30 seconds",
    spots: 10,
    estimatedViewers: "1.8M+ viewers",
    listingId: null,
    listingName: "TV Media",
    listingType: "TV",
    location: "Nationwide",
    agencyName: "Payollar Demo",
  },
  {
    id: "demo-tv-weekend",
    name: "Weekend Special",
    price: 12000,
    duration: "60 seconds",
    spots: 3,
    estimatedViewers: "2.2M+ viewers",
    listingId: null,
    listingName: "TV Media",
    listingType: "TV",
    location: "Nationwide",
    agencyName: "Payollar Demo",
  },
];

export function MediaPageView({ listingsByType, customPackages = [] }) {
  const lineOne = ["Connect", "with", "every"];
  const lineTwo = ["media", "channel"];
  const sourcePackages = customPackages.length > 0 ? customPackages : DEMO_TV_PACKAGES;
  const featuredPackages = sourcePackages.slice(0, 9);
  const usingDemoPackages = customPackages.length === 0;

  return (
    <div className="relative z-10 w-full min-h-dvh bg-background pt-20 text-foreground md:pt-24">
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
                <Link href="#packages">
                  Browse packages
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
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative mt-12 w-full max-w-4xl lg:mt-14"
            >
              <div className="absolute left-1/2 top-0 -z-10 h-24 w-3/5 -translate-x-1/2 rounded-full bg-primary/25 blur-[4rem]" />
              <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card p-2 shadow-[0_16px_50px_-28px_rgba(15,23,42,0.35)] sm:p-2.5">
                <div className="grid grid-cols-2 divide-x divide-y divide-border/60 overflow-hidden rounded-[1.35rem] border border-border/50 bg-secondary/40 md:grid-cols-4 md:divide-y-0">
                  {STATS.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div
                        key={s.label}
                        className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center sm:px-5 sm:py-7"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/10">
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                          {s.value}
                        </div>
                        <div className="text-xs font-medium text-muted-foreground sm:text-sm">
                          {s.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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

      {/* Custom packages from media agencies */}
      <section
        id="packages"
        className="relative w-full overflow-hidden bg-[#f3f4f6] py-16 text-foreground md:py-24"
      >
        <div className="pointer-events-none absolute -right-1/4 top-1/3 -z-10 hidden size-1/3 rounded-full bg-primary/10 blur-[8rem] lg:block" />
        <SectionShell className="relative z-10 max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <SectionBadge title="Packages" />
            <motion.h2
              className={cn(sectionTitle, "mt-6")}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Custom packages
            </motion.h2>
            <motion.p
              className={sectionDesc}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Ready-made buys from media partners — or open media buying to plan your own flight.
            </motion.p>
          </div>

          {featuredPackages.length > 0 ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-5">
              {featuredPackages.map((pkg, index) => {
                const typeKey = String(pkg.listingType || "TV").toUpperCase();
                const bookHref = pkg.listingId
                  ? `/media/schedule?type=${encodeURIComponent(typeKey)}&listing=${encodeURIComponent(pkg.listingId)}`
                  : `/products?type=${encodeURIComponent(typeKey)}`;
                const typeLabel =
                  LISTING_TYPE_LABELS[pkg.listingType] || pkg.listingType || "Media";
                const featured = index === 1;

                const metaChips = [
                  pkg.duration
                    ? { icon: Clock, label: pkg.duration }
                    : null,
                  pkg.spots != null
                    ? {
                        icon: Calendar,
                        label: `${pkg.spots} spot${pkg.spots === 1 ? "" : "s"}`,
                      }
                    : null,
                  pkg.estimatedViewers
                    ? { icon: Eye, label: pkg.estimatedViewers }
                    : null,
                  pkg.location
                    ? { icon: MapPin, label: pkg.location }
                    : null,
                ].filter(Boolean);

                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
                    className={cn(featured && "lg:-mt-2 lg:mb-2")}
                  >
                    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10">
                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5 pt-0.5">
                            {featured ? (
                              <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                                Popular
                              </span>
                            ) : null}
                            <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                              {typeLabel}
                            </span>
                            {usingDemoPackages ? (
                              <span className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                Demo
                              </span>
                            ) : null}
                          </div>
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                              featured
                                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            <Package className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                        </div>

                        <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                          {pkg.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {[pkg.listingName, pkg.agencyName].filter(Boolean).join(" · ")}
                        </p>

                        <div className="mt-5 rounded-xl border border-primary/10 bg-primary/[0.04] px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/70">
                            Package price
                          </p>
                          <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-[1.65rem]">
                            ₵{Number(pkg.price || 0).toLocaleString("en-GH")}
                          </p>
                        </div>

                        {metaChips.length > 0 ? (
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            {metaChips.map((chip) => {
                              const Icon = chip.icon;
                              return (
                                <div
                                  key={chip.label}
                                  className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/80 px-2.5 py-2"
                                >
                                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                                  <span className="truncate text-[11px] font-medium text-muted-foreground">
                                    {chip.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}

                        <div className="mt-auto pt-5">
                          <Button
                            asChild
                            variant="marketing"
                            className="h-11 w-full rounded-full text-sm font-semibold shadow-md shadow-primary/20"
                          >
                            <Link href={bookHref}>
                              Book package
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </article>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-dashed border-border/70 bg-card px-6 py-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No packages yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Partners can publish packages from their dashboard. Browse listings to start planning
                meanwhile.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button asChild variant="marketing" className="h-10 rounded-full px-4 text-sm">
                  <Link href="/products">Browse media buying</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-full border-primary/40 px-4 text-sm"
                >
                  <Link href="/media/schedule">Schedule custom media</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            {sourcePackages.length > 9 ? (
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-full border-primary/40 px-4 text-sm font-semibold"
              >
                <Link href="/media/packages">
                  View all packages
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="marketing" className="h-10 rounded-full px-5 text-sm font-semibold">
              <Link href="/products">
                <Package className="mr-2 h-4 w-4" />
                {usingDemoPackages ? "Open media buying" : "Build a custom package"}
              </Link>
            </Button>
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
                    linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px)
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
                    <Link href="#packages">Browse custom packages</Link>
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
