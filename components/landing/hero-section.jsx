"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Headphones, Mic, ArrowRight, Target } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import Balancer from "react-wrap-balancer";
import { cn } from "@/lib/utils";
import { SectionShell } from "@/components/landing/section-shell";
import { SectionParticles } from "@/components/landing/section-particles";
import { useLandingSessionUser } from "@/hooks/use-landing-session";

const creativeImages = [
  { src: "/images/about-hero.jpg", alt: "DJ performing", type: "artist" },
  { src: "/images/russ.jpg", alt: "Artist on stage", type: "producer" },
  { src: "/images/ayra.jpg", alt: "Artist recording", type: "artist" },
  { src: "/images/mellisa.jpg", alt: "Influencer creating content", type: "influencer" },
  { src: "/images/kaesfr.jpg", alt: "Radio host", type: "artist" },
  { src: "/images/kingp.jpg", alt: "Podcast recording", type: "artist" },
  { src: "/images/fave.jpg", alt: "Live performance", type: "artist" },
  { src: "/images/dude.jpg", alt: "Studio session", type: "artist" },
];

export function HeroSection() {
  const { isSignedIn } = useLandingSessionUser();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % creativeImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const titleWords = ["Discover", "the", "best", "Talents", "&", "Media"];
  const accentStart = 3;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
      <SectionParticles
        className="inset-0"
        opacityClass="opacity-[0.35]"
        quantity={80}
        staticity={50}
        ease={50}
      />

      <SectionShell className="relative z-10 max-w-[min(100%,96rem)] px-4 sm:px-5 md:px-6 lg:px-8 xl:px-12 2xl:px-14">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <div className="order-2 min-w-0 space-y-8 lg:order-1 lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className={cn(
                "inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full",
                "badge-glow backdrop-blur-md"
              )}
            >
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-semibold rounded-full",
                  "bg-foreground text-background"
                )}
              >
                New
              </span>
              <span
                className="text-sm text-foreground/85 font-medium"
                style={{ fontFamily: "var(--font-handwriting), cursive" }}
              >
                Connect with top talents
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.08]">
              <Balancer>
                {titleWords.map((word, index) => (
                  <motion.span
                    key={word + index}
                    initial={{ filter: "blur(8px)", opacity: 0, y: 8 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className={cn(
                      "inline-block",
                      index >= accentStart &&
                        "bg-linear-to-r from-primary via-blue-400 to-primary bg-size-[200%_100%] animate-[shimmer_3s_ease-in-out_infinite] text-transparent bg-clip-text"
                    )}
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
                <br />
                <motion.span
                  initial={{ filter: "blur(8px)", opacity: 0, y: 8 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.28 }}
                  className="inline-block text-foreground"
                >
                  for your projects
                </motion.span>
              </Balancer>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="text-lg text-foreground/70 max-w-xl leading-relaxed"
            >
              <Balancer>
                Get instant access to vetted creative professionals, dedicated support, and a seamless platform to
                execute media, content, and entertainment projects—on your terms.
              </Balancer>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35 }}
              className="flex flex-wrap gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-3">
                <img src="/icons/secure.PNG" alt="" className="w-8 h-8 object-contain opacity-90" />
                <span className="font-medium text-foreground/85">Quality guaranteed</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/icons/verified2.PNG" alt="" className="w-8 h-8 object-contain opacity-90" />
                <span className="font-medium text-foreground/85">Top-rated professionals</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.45 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3"
            >
              {!isSignedIn && (
                <Button asChild size="lg" variant="marketing" className="gap-2">
                  <Link href="/onboarding">
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant="marketingOutline">
                <Link href="/talents">Find Talents</Link>
              </Button>
              <Button asChild size="lg" variant="marketingOutline">
                <Link href="/campaigns">
                  <Target className="h-4 w-4" />
                  View Campaigns
                </Link>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, filter: "blur(12px)", y: 24 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-1 flex w-full min-w-0 justify-center lg:order-2 lg:col-span-6 lg:justify-start"
          >
            {/* Narrower max-width + taller fixed height keeps bento proportional */}
            <div className="relative w-full max-w-[24rem] rounded-2xl border border-foreground/10 bg-foreground/[0.04] backdrop-blur-md p-1 shadow-2xl shadow-black/40 sm:max-w-[26rem] md:max-w-[28rem] md:rounded-[24px] md:p-1.5 lg:max-w-[30rem] xl:max-w-[34rem]">
              <div className="pointer-events-none absolute top-1/4 left-1/2 -z-10 h-1/3 w-4/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 opacity-60 blur-[6rem]" />
              <div className="overflow-hidden rounded-[1rem] md:rounded-[1.35rem] border border-foreground/10 bg-background/80">
                {/* Mobile: single column preview */}
                <div className="flex flex-col gap-2 p-2 md:hidden">
                  <div className="relative aspect-[4/3] max-h-[220px] w-full overflow-hidden rounded-2xl border border-emerald-500/35 sm:max-h-[260px]">
                    <img
                      src={creativeImages[currentIndex]?.src || "/placeholder.svg"}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-end gap-2">
                      <Mic className="h-4 w-4 text-emerald-400" aria-hidden />
                      <div className="text-white">
                        <div className="mb-0.5 inline-flex rounded-full border border-emerald-400/50 bg-emerald-600/85 px-2 py-0.5 text-[10px] font-semibold uppercase">
                          Featured Talent
                        </div>
                        <p className="text-xs font-bold">
                          PROFESSIONAL {creativeImages[currentIndex]?.type?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="aspect-square overflow-hidden rounded-lg border border-emerald-500/25">
                      <img src="/images/talent4.jpg" alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="aspect-square overflow-hidden rounded-lg border border-emerald-500/25">
                      <img src="/images/talent2.jpg" alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="aspect-square overflow-hidden rounded-lg border border-emerald-500/25">
                      <img src="/images/talent3.jpg" alt="" className="h-full w-full object-cover object-top" />
                    </div>
                  </div>
                </div>

                {/*
                  2×2 grid (reference): cols ≈65/35 (13fr/7fr), rows ≈60/40 (3fr/2fr).
                  Top-right = one cell with two stacked images (flex), not a 3×3 grid.
                */}
                <div
                  className="hidden h-[480px] w-full gap-2 p-1 md:grid md:h-[520px] md:gap-2.5 md:p-1.5 lg:h-[560px] xl:h-[600px]"
                  style={{
                    gridTemplateColumns: "minmax(0, 12fr) minmax(0, 7fr)",
                    gridTemplateRows: "minmax(0, 3fr) minmax(0, 2fr)",
                  }}
                >
                  {/* Top-left — featured */}
                  <div className="relative col-start-1 row-start-1 min-h-0 overflow-hidden rounded-2xl border border-emerald-500/40 shadow-md md:rounded-[1.25rem]">
                    <img
                      src={creativeImages[currentIndex]?.src || "/placeholder.svg"}
                      alt={creativeImages[currentIndex]?.alt}
                      className="h-full w-full object-cover object-center transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex max-w-[90%] items-end gap-2 md:bottom-4 md:left-4">
                      <Mic className="mb-0.5 h-4 w-4 shrink-0 text-white drop-shadow md:h-5 md:w-5" aria-hidden />
                      <div className="text-white">
                        <div className="mb-0.5 inline-flex rounded-full border border-emerald-400/60 bg-emerald-600/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide md:text-xs">
                          Featured Talent
                        </div>
                        <p className="text-xs font-bold capitalize tracking-wide md:text-sm">
                          Professional {creativeImages[currentIndex]?.type}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top-right — two stacked (combined height = top row) */}
                  <div className="col-start-2 row-start-1 flex min-h-0 flex-col gap-2 md:gap-2.5">
                    <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-emerald-500/30 md:rounded-2xl">
                      <img src="/images/talent4.jpg" alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-2 right-2 rounded-full border border-emerald-500/50 bg-emerald-600/85 p-2 shadow-sm backdrop-blur-sm">
                        <Headphones className="h-3.5 w-3.5 text-white md:h-4 md:w-4" aria-hidden />
                      </div>
                    </div>
                    <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-emerald-500/30 md:rounded-2xl">
                      <img src="/images/talent2.jpg" alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                  </div>

                  {/* Bottom-left — wide landscape */}
                  <div className="relative col-start-1 row-start-2 min-h-0 overflow-hidden rounded-xl border border-emerald-500/30 bg-zinc-950 md:rounded-2xl">
                    <img
                      src="/images/talent6.jpg"
                      alt=""
                      className="h-full w-full object-cover object-[center_40%]"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                      <div className="rounded-full border border-emerald-500/50 bg-emerald-600/85 p-2 shadow-sm backdrop-blur-sm">
                        <Camera className="h-3.5 w-3.5 text-white md:h-4 md:w-4" aria-hidden />
                      </div>
                    </div>
                  </div>

                  {/* Bottom-right — portrait (same row height as wide, same col width as stack above) */}
                  <div className="relative col-start-2 row-start-2 min-h-0 overflow-hidden rounded-xl border border-emerald-500/30 bg-zinc-950 md:rounded-2xl">
                    <img
                      src="/images/talent3.jpg"
                      alt=""
                      className="h-full w-full object-cover object-[center_25%]"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionShell>
    </section>
  );
}
