"use client";

export function PartnersMarquee() {
  const partners = [
    "TV3",
    "JoyFM",
    "Adom FM",
    "Joy Prime",
    "Citi FM",
    "Peace FM",
    "Starr FM",
    "Class FM",
    "YFM",
    "Hitz FM",
    "Pluzz FM",
    "Okay FM",
    "Radio Gold",
    "Asempa FM",
    "Happy FM",
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-slate-900 via-slate-800/95 to-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs md:text-sm text-gray-500 mb-3 font-medium uppercase tracking-widest">
            Trusted Partners & Brands
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            We Work With{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Industry Leaders
            </span>
          </h2>
        </div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Minimal Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-24 bg-gradient-to-r from-slate-900/95 via-slate-900/40 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-24 bg-gradient-to-l from-slate-900/95 via-slate-900/40 to-transparent z-10 pointer-events-none"></div>

          {/* Marquee */}
          <div className="flex overflow-hidden marquee-container">
            <div className="flex animate-marquee whitespace-nowrap">
              {partners.map((partner, index) => (
                <div
                  key={`${partner}-${index}`}
                  className="mx-4 md:mx-6 flex-shrink-0"
                >
                  <div className="px-8 md:px-10 py-5 md:py-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl cursor-default">
                    <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-white/90">
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
                  className="mx-4 md:mx-6 flex-shrink-0"
                >
                  <div className="px-8 md:px-10 py-5 md:py-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl cursor-default">
                    <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-white/90">
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
