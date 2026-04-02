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

export function MediaFeaturesSection() {
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
        <div className="relative overflow-hidden rounded-3xl bg-black shadow-xl">
          <SectionParticles className="inset-0" opacityClass="opacity-[0.12]" quantity={40} />
          <div className="relative z-10 px-6 py-12 sm:px-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-12 lg:py-16">
          {/* Left: Copy + CTA */}
          <div className="order-2 space-y-6 text-white lg:order-1">
            <Badge className="border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15">
              <Tv className="mr-2 h-4 w-4 opacity-90" />
              Media Booking Platform
            </Badge>
            <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              Powerful Media Features for Your Campaigns
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
              Book TV, Radio, Digital, and Billboard media with ease. Build custom packages, track performance, and get
              verified transmission certificates—all in one platform.
            </p>
            <div className="flex flex-wrap gap-3">
              {mediaTypes.map((type, idx) => (
                <Badge
                  key={idx}
                  className="border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
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
                className="gap-2 rounded-lg bg-white font-semibold text-gray-900 shadow-md hover:bg-gray-100"
              >
                <Link href="/media/schedule">
                  <Calendar className="h-5 w-5" />
                  Schedule Media
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-lg border-2 border-white/55 bg-transparent font-semibold text-white hover:bg-white/15"
              >
                <Link href="/media/packages">
                  <Package className="h-5 w-5" />
                  View Packages
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Media image */}
          <div className="relative order-1 mb-10 flex w-full justify-center lg:order-2 lg:mb-0 lg:justify-end lg:items-center">
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
