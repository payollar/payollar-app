"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Radio,
  Tv,
  Smartphone,
  Biohazard as Billboard,
  Users,
  Calendar,
  Package,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SectionParticles } from "@/components/landing/section-particles";
import { useLandingTheme } from "@/components/landing/landing-theme";
import { cn } from "@/lib/utils";

export function MediaFeaturesSection() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  const mediaTypes = [
    { name: "TV Media", icon: Tv },
    { name: "Radio Media", icon: Radio },
    { name: "Digital Media", icon: Smartphone },
    { name: "Billboard", icon: Billboard },
    { name: "Influencer Marketing", icon: Users },
  ];

  return (
    <section className="w-full bg-background">
      <div className="mx-auto max-w-[90rem] px-3 py-10 sm:px-5 lg:px-6 lg:py-14">
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl shadow-xl",
            isLight
              ? "border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-[#eef4ff] shadow-[0_24px_60px_-36px_rgba(15,23,42,0.3)]"
              : "bg-black"
          )}
        >
          <SectionParticles
            className="inset-0"
            opacityClass={isLight ? "opacity-[0.07]" : "opacity-[0.12]"}
            quantity={40}
          />
          {isLight && (
            <>
              <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-primary/[0.08] blur-[5rem]" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-sky-300/20 blur-[4rem]" />
            </>
          )}
          <div className="relative z-10 px-6 py-12 sm:px-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-12 lg:py-16">
            <div
              className={cn(
                "order-2 space-y-6 lg:order-1",
                isLight ? "text-slate-900" : "text-white"
              )}
            >
              <Badge
                className={cn(
                  "px-4 py-2 text-sm font-medium",
                  isLight
                    ? "border border-primary/20 bg-primary/10 text-[#0b3db8] hover:bg-primary/15"
                    : "border border-white/30 bg-white/10 text-white hover:bg-white/15"
                )}
              >
                <Tv className="mr-2 h-4 w-4 opacity-90" />
                Media Booking Platform
              </Badge>
              <h2
                className={cn(
                  "text-3xl font-bold leading-tight md:text-4xl lg:text-5xl",
                  isLight ? "text-slate-900" : "text-white"
                )}
              >
                Powerful Media Features for Your Campaigns
              </h2>
              <p
                className={cn(
                  "max-w-lg text-base leading-relaxed md:text-lg",
                  isLight ? "text-slate-600" : "text-white/85"
                )}
              >
                Book TV, Radio, Digital, and Billboard media with ease. Build
                custom packages, track performance, and get verified transmission
                certificates—all in one platform.
              </p>
              <div className="flex flex-wrap gap-3">
                {mediaTypes.map((type, idx) => (
                  <Badge
                    key={idx}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium",
                      isLight
                        ? "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-primary/30 hover:bg-white"
                        : "border border-white/35 bg-white/10 text-white hover:bg-white/15"
                    )}
                  >
                    <type.icon className="mr-1.5 h-3.5 w-3.5 opacity-90" />
                    {type.name}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "gap-2 rounded-lg font-semibold shadow-md",
                    isLight
                      ? "bg-[#0055ff] text-white hover:bg-[#003ecc]"
                      : "bg-white text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Link href="/media">
                    <Calendar className="h-5 w-5" />
                    Schedule Media
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className={cn(
                    "rounded-lg border-2 font-semibold",
                    isLight
                      ? "border-slate-300 bg-white text-slate-900 hover:border-primary/40 hover:bg-white hover:text-[#0b3db8]"
                      : "border-white/55 bg-transparent text-white hover:bg-white/15"
                  )}
                >
                  <Link href="/media/packages">
                    <Package className="h-5 w-5" />
                    View Packages
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative order-1 mb-10 flex w-full justify-center lg:order-2 lg:mb-0 lg:items-center lg:justify-end">
              <Image
                src="/icons/media.PNG"
                alt="Media booking"
                width={1200}
                height={800}
                className="h-auto w-full max-w-md object-contain lg:max-w-lg"
                unoptimized={true}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
