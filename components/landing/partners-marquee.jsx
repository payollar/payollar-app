"use client";

export function PartnersMarquee() {
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

  return (
    <section className="py-16 md:py-20 bg-background border-y border-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs md:text-sm text-muted-foreground mb-3 font-medium uppercase tracking-widest">
            Media ecosystem preview
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Built for{" "}
            <span className="bg-linear-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
              how media runs today
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
            Names below are placeholder examples for illustration — not affiliated stations or partners.
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Minimal Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-24 bg-linear-to-r from-background via-background/50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-24 bg-linear-to-l from-background via-background/50 to-transparent z-10 pointer-events-none" />

          {/* Marquee */}
          <div className="flex overflow-hidden marquee-container">
            <div className="flex animate-marquee whitespace-nowrap">
              {partners.map((partner, index) => (
                <div
                  key={`${partner}-${index}`}
                  className="mx-3 md:mx-4 flex-shrink-0"
                >
                  <div className="px-4 md:px-5 py-2 md:py-3 bg-card/60 border border-border/80 rounded-xl cursor-default backdrop-blur-sm">
                    <span className="text-base md:text-lg lg:text-xl font-semibold text-foreground/85">
                      {partner}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex animate-marquee whitespace-nowrap" aria-hidden="true">
              {partners.map((partner, index) => (
                <div
                  key={`${partner}-duplicate-${index}`}
                  className="mx-3 md:mx-4 flex-shrink-0"
                >
                  <div className="px-4 md:px-5 py-2 md:py-3 bg-card/60 border border-border/80 rounded-xl cursor-default backdrop-blur-sm">
                    <span className="text-base md:text-lg lg:text-xl font-semibold text-foreground/85">
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
