"use client";

import LandingBackground from "@/components/landing/landing-background";
import { Particles } from "@/components/ui/particles";
import { cn } from "@/lib/utils";

const WIDTH_CLASS = {
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
};

/**
 * Auth shell: grid background, particles, glass form card (navbar from auth layout).
 * @param {"md"|"lg"|"xl"|"2xl"} [size="md"] - card max width
 * @param {"default"|"light"} [theme="default"] - force white theme for agency portal, etc.
 */
export function AuthSplitLayout({
  children,
  className,
  size = "md",
  contentClassName,
  theme = "default",
}) {
  const isLight = theme === "light";

  return (
    <div
      data-theme={isLight ? "light" : undefined}
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col justify-center overflow-hidden",
        isLight ? "bg-transparent text-slate-900" : "bg-background text-foreground",
        className
      )}
    >
      {isLight ? <LightAuthBackground /> : <LandingBackground />}

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className={cn(
            "absolute -right-16 top-0 h-72 w-[min(100%,28rem)]",
            isLight ? "opacity-[0.18] md:opacity-[0.24]" : "opacity-[0.28] md:opacity-[0.38]"
          )}
        >
          <Particles
            className="absolute inset-0"
            quantity={isLight ? 28 : 42}
            color="#0055ff"
            staticity={55}
            ease={45}
          />
        </div>
        <div
          className={cn(
            "absolute -left-24 bottom-20 h-56 w-56 rounded-full blur-3xl",
            isLight ? "bg-[#0055ff]/[0.08]" : "bg-primary/15"
          )}
        />
        <div
          className={cn(
            "absolute right-1/4 top-1/3 h-40 w-40 rounded-full blur-2xl",
            isLight ? "bg-sky-300/25" : "bg-primary/10"
          )}
        />
      </div>

      <div
        className={cn(
          "relative z-10 mx-auto flex w-full flex-col justify-center px-4 py-10 sm:px-6",
          WIDTH_CLASS[size] || WIDTH_CLASS.md
        )}
      >
        <div
          className={cn(
            "rounded-2xl border backdrop-blur-xl sm:p-8 p-6",
            isLight
              ? "border-slate-200/90 bg-white/95 shadow-[0_24px_64px_-28px_rgba(15,23,42,0.28)]"
              : "border-border/50 bg-card/85 shadow-2xl shadow-black/25",
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function LightAuthBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#f4f6fb]" />
      <div className="absolute inset-x-0 top-0 h-[36rem] bg-gradient-to-b from-[#eef3fb] via-[#f4f6fb] to-transparent" />
      <div className="absolute -left-28 -top-16 h-[34rem] w-[34rem] rounded-full bg-[#0055ff]/[0.10] blur-[7.5rem]" />
      <div className="absolute -right-24 top-8 h-[28rem] w-[28rem] rounded-full bg-sky-300/30 blur-[6.5rem]" />
      <div className="absolute bottom-24 left-[32%] h-[22rem] w-[22rem] rounded-full bg-indigo-200/35 blur-[5.5rem]" />
      <div
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(15,23,42,0.045) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
