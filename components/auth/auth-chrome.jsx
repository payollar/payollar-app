"use client";

import { LandingNavbar } from "@/components/landing/landing-navbar";

/** Shared landing marketing navbar + content area below fixed header (matches /campaigns). */
export function AuthChrome({ children }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingNavbar />
      <div className="relative z-10 flex w-full flex-1 flex-col pt-[5.25rem] md:pt-28">
        {children}
      </div>
    </div>
  );
}
