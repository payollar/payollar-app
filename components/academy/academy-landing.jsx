"use client";

import { AcademyNav } from "@/components/academy/academy-nav";
import { AcademySections } from "@/components/academy/academy-sections";
import { AcademyStudio } from "@/components/academy/academy-studio";

export function AcademyLanding() {
  return (
    <div className="min-h-dvh scroll-smooth bg-[#07080d] text-white antialiased">
      <AcademyNav />
      <div>
        <AcademyStudio />
        <AcademySections />
      </div>
    </div>
  );
}
