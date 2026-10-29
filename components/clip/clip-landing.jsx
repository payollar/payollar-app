"use client";

import { ClipHero } from "@/components/clip/clip-hero";
import { ClipNav } from "@/components/clip/clip-nav";
import { ClipSections } from "@/components/clip/clip-sections";

export function ClipLanding() {
  return (
    <div className="min-h-dvh scroll-smooth bg-[#07080d] text-white antialiased">
      <ClipNav />
      <div>
        <ClipHero />
        <ClipSections />
      </div>
    </div>
  );
}
