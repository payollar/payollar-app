"use client";

import { useLandingTheme } from "@/components/landing/landing-theme";
import { cn } from "@/lib/utils";

export function PartnersMarquee() {
  const { theme } = useLandingTheme();
  const isLight = theme === "light";

  /** Illustrative fictional brands for layout only — not real partners. */
  const partners = [
    "Meridian Broadcasting",
    "Coastline Radio",
    "Volt Media Network",
    "Pulse Digital Studios",
    "Horizon TV",
    "Echo FM",
    "Nexus News Group",
    "Starfield Communications",
    "Catalyst Media Group",
    "PrimeWave Radio",
    "Summit Studios",
    "Aurora Network",
    "Keystone Broadcasting",
    "Velocity Digital",
    "Lighthouse Media",
  ];

  const chipClass = cn(
    "cursor-default rounded-xl border px-4 py-2 backdrop-blur-sm md:px-5 md:py-3",
    isLight
      ? "border-slate-200/90 bg-white shadow-sm"
      : "border-border/80 bg-card/60"
  );

  return (
    <section
      className={cn(
        "overflow-hidden border-y py-16 md:py-20",
        isLight
          ? "border-slate-200/80 bg-white/55"
          : "border-border/40 bg-background"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground md:text-sm">
            Media ecosystem preview
          </p>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Built for{" "}
            <span className="bg-linear-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
              how media runs today
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
            Names below are placeholder examples for illustration — not
            affiliated stations or partners.
          </p>
        </div>

        <div className="relative">
          <div
            className={cn(
              "pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-20 bg-linear-to-r to-transparent md:w-24",
              isLight
                ? "from-[#f4f6fb] via-[#f4f6fb]/70"
                : "from-background via-background/50"
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-20 bg-linear-to-l to-transparent md:w-24",
              isLight
                ? "from-[#f4f6fb] via-[#f4f6fb]/70"
                : "from-background via-background/50"
            )}
          />

          <div className="marquee-container flex overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {partners.map((partner, index) => (
                <div
                  key={`${partner}-${index}`}
                  className="mx-3 flex-shrink-0 md:mx-4"
                >
                  <div className={chipClass}>
                    <span
                      className={cn(
                        "text-base font-semibold md:text-lg lg:text-xl",
                        isLight ? "text-slate-700" : "text-foreground/85"
                      )}
                    >
                      {partner}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="flex animate-marquee whitespace-nowrap"
              aria-hidden="true"
            >
              {partners.map((partner, index) => (
                <div
                  key={`${partner}-duplicate-${index}`}
                  className="mx-3 flex-shrink-0 md:mx-4"
                >
                  <div className={chipClass}>
                    <span
                      className={cn(
                        "text-base font-semibold md:text-lg lg:text-xl",
                        isLight ? "text-slate-700" : "text-foreground/85"
                      )}
                    >
                      {partner}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
