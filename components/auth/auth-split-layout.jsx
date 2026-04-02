"use client";

import LandingBackground from "@/components/landing/landing-background";
import { Particles } from "@/components/ui/particles";
import { cn } from "@/lib/utils";

/**
 * Auth shell: grid background, particles, glass form card (navbar from auth layout).
 */
export function AuthSplitLayout({ children, className }) {
  return (
    <div
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col justify-center overflow-hidden bg-background text-foreground",
        className
      )}
    >
      <LandingBackground />

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-16 top-0 h-72 w-[min(100%,28rem)] opacity-[0.28] md:opacity-[0.38]">
          <Particles
            className="absolute inset-0"
            quantity={42}
            color="#0055ff"
            staticity={55}
            ease={45}
          />
        </div>
        <div className="absolute -left-24 bottom-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-border/50 bg-card/85 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
