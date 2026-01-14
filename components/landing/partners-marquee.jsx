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
    <section className="py-16 md:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs md:text-sm text-gray-500 mb-3 font-medium uppercase tracking-widest">
            Trusted Partners & Brands
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            We Work With{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              Industry Leaders
            </span>
          </h2>
        </div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Minimal Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-24 bg-gradient-to-r from-white via-white/40 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-24 bg-gradient-to-l from-white via-white/40 to-transparent z-10 pointer-events-none"></div>

          {/* Marquee */}
          <div className="flex overflow-hidden marquee-container">
            <div className="flex animate-marquee whitespace-nowrap">
              {partners.map((partner, index) => (
                <div
                  key={`${partner}-${index}`}
                  className="mx-3 md:mx-4 flex-shrink-0"
                >
                  <div className="px-4 md:px-5 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg cursor-default">
                    <span className="text-base md:text-lg lg:text-xl font-semibold text-gray-700">
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
                  <div className="px-4 md:px-5 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg cursor-default">
                    <span className="text-base md:text-lg lg:text-xl font-semibold text-gray-700">
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
