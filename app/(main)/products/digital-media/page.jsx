"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clapperboard,
  Instagram,
  MapPin,
  MonitorPlay,
  Search,
  Smartphone,
  Youtube,
} from "lucide-react";
import { siTiktok, siX } from "simple-icons";
import { getActiveMediaListings, getPublishedRateCards } from "@/actions/media-agency";
import InquiryFormModal from "@/components/InquiryFormModal";
import { ProductsChannelTopBar } from "@/components/products/products-channel-top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getHeaderImage } from "@/lib/getHeaderImage";
import { cn } from "@/lib/utils";

function BrandIcon({ path, className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d={path} />
    </svg>
  );
}

function TikTokIcon({ className }) {
  return <BrandIcon path={siTiktok.path} className={className} />;
}

function XIcon({ className }) {
  return <BrandIcon path={siX.path} className={className} />;
}

const SHOW_EXAMPLES = [
  {
    id: "morning-brief",
    name: "Morning Brief",
    hostLabel: "Daily digital show",
    icon: Youtube,
    platforms: ["YouTube", "Instagram"],
    audience: "Professionals · weekday mornings",
    formats: ["Sponsored segment", "Host read", "Product demo"],
    packages: [
      {
        name: "Single episode",
        price: "₵4,500",
        features: [
          "1 sponsored segment",
          "Show page mention",
          "Clip for brand reuse",
        ],
      },
      {
        name: "Weekly flight",
        price: "₵18,000",
        features: [
          "4 episode integrations",
          "Host-led brand moment",
          "Cross-post to Stories/Reels",
        ],
      },
      {
        name: "Season partner",
        price: "₵55,000",
        features: [
          "Season-long show partnership",
          "Opening billboard",
          "Recurring segment ownership",
        ],
      },
    ],
  },
  {
    id: "lifestyle-series",
    name: "City Lifestyle Series",
    hostLabel: "Vertical show format",
    icon: Instagram,
    platforms: ["Instagram", "TikTok"],
    audience: "Urban lifestyle · 18–34",
    formats: ["Episode takeover", "Creator co-host", "Story arc"],
    packages: [
      {
        name: "Episode feature",
        price: "₵3,200",
        features: [
          "1 episode integration",
          "On-screen brand moment",
          "Story highlights pack",
        ],
      },
      {
        name: "Mini series",
        price: "₵12,500",
        features: [
          "3 connected episodes",
          "Creator co-host appearance",
          "Saved series highlight",
        ],
      },
      {
        name: "Platform residency",
        price: "₵40,000",
        features: [
          "Month-long show residency",
          "Weekly branded episodes",
          "Community live session",
        ],
      },
    ],
  },
  {
    id: "live-talk",
    name: "After Dark Live",
    hostLabel: "Live talk show",
    icon: TikTokIcon,
    platforms: ["TikTok", "YouTube Live"],
    audience: "Night-time entertainment",
    formats: ["Live sponsorship", "Guest seat", "Poll moment"],
    packages: [
      {
        name: "Live drop-in",
        price: "₵2,800",
        features: [
          "Live sponsor shoutout",
          "Pinned comment",
          "Replay mention",
        ],
      },
      {
        name: "Guest episode",
        price: "₵9,500",
        features: [
          "Brand guest seat",
          "Live + replay cutdown",
          "Comment takeover window",
        ],
      },
      {
        name: "Live night partner",
        price: "₵28,000",
        features: [
          "Full live-night partnership",
          "Opening & closing billboards",
          "Interactive brand segment",
        ],
      },
    ],
  },
  {
    id: "newsroom-desk",
    name: "Newsroom Desk",
    hostLabel: "Short-form news show",
    icon: XIcon,
    platforms: ["X", "YouTube Shorts"],
    audience: "News & culture followers",
    formats: ["Desk sponsorship", "Topic segment", "Thread companion"],
    packages: [
      {
        name: "Desk mention",
        price: "₵2,000",
        features: [
          "Sponsored desk open",
          "Topic tag inclusion",
          "Companion post",
        ],
      },
      {
        name: "Topic week",
        price: "₵7,500",
        features: [
          "5 daily show integrations",
          "Branded topic framing",
          "Clip package for brand",
        ],
      },
      {
        name: "Desk franchise",
        price: "₵22,000",
        features: [
          "Named desk segment",
          "Multi-platform distribution",
          "Monthly franchise rights",
        ],
      },
    ],
  },
];

export default function DigitalMediaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [registeredListings, setRegisteredListings] = useState([]);
  const [rateCards, setRateCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const headerImage = getHeaderImage("/products/digital-media");

  useEffect(() => {
    getActiveMediaListings("DIGITAL").then((result) => {
      if (result.success && result.listings?.length) {
        setRegisteredListings(result.listings);
      }
    });
    getPublishedRateCards("DIGITAL").then((result) => {
      if (result.success && result.rateCards?.length) {
        setRateCards(result.rateCards);
      }
    });
  }, []);

  const handlePackageClick = (showName, pkg) => {
    setSelectedPackage({
      name: `${showName} — ${pkg.name}`,
      price: pkg.price,
      details: pkg.features.join(", "),
    });
    setIsModalOpen(true);
  };

  const filteredShows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SHOW_EXAMPLES.filter((show) => {
      const matchesQuery =
        !q ||
        show.name.toLowerCase().includes(q) ||
        show.hostLabel.toLowerCase().includes(q) ||
        show.platforms.some((platform) => platform.toLowerCase().includes(q)) ||
        show.formats.some((format) => format.toLowerCase().includes(q));
      const matchesPlatform =
        platformFilter === "all" ||
        show.platforms.some((platform) =>
          platform.toLowerCase().includes(platformFilter)
        );
      const matchesFormat =
        formatFilter === "all" ||
        show.formats.some((format) =>
          format.toLowerCase().includes(formatFilter)
        );
      return matchesQuery && matchesPlatform && matchesFormat;
    });
  }, [searchQuery, platformFilter, formatFilter]);

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
      <ProductsChannelTopBar
        title="Digital Media"
        icon={Smartphone}
        variant="light"
        showChannelLabel={false}
      />

      <section className="relative h-64 w-full overflow-hidden md:h-80">
        <img
          src={headerImage}
          alt="Digital platform shows"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/35 to-slate-950/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
              Digital media
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Book digital platform shows
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-base">
              Sponsor or integrate into digital shows that run on social
              platforms — YouTube, Instagram, TikTok, and more. Not social ads.
              Show inventory.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              icon: Clapperboard,
              title: "Shows & series",
              body: "Morning shows, lifestyle series, live talk, and short-form desks.",
            },
            {
              icon: MonitorPlay,
              title: "Social distribution",
              body: "Formats built for the platforms audiences already watch daily.",
            },
            {
              icon: Smartphone,
              title: "Bookable inventory",
              body: "Browse digital platforms, rate cards, and sponsorship packages.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-[#f7f8fc] px-4 py-4"
            >
              <item.icon className="h-5 w-5 text-slate-700" />
              <p className="mt-3 text-sm font-semibold text-slate-950">
                {item.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search shows, platforms, or formats…"
                className="h-11 rounded-xl border-slate-200 bg-white pl-10"
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All platforms</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="x">X</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Show format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All formats</SelectItem>
                <SelectItem value="sponsored">Sponsored segment</SelectItem>
                <SelectItem value="host">Host read</SelectItem>
                <SelectItem value="live">Live sponsorship</SelectItem>
                <SelectItem value="guest">Guest seat</SelectItem>
                <SelectItem value="desk">Desk sponsorship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {rateCards.length > 0 ? (
        <section className="pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Digital platform rate cards
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Published show and platform inventory from media agencies.
                </p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rateCards.map((rateCard) => (
                <Link key={rateCard.id} href={`/rate-cards/${rateCard.id}`}>
                  <Card className="h-full overflow-hidden border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md">
                    {rateCard.imageUrl ? (
                      <div className="relative h-40 w-full overflow-hidden">
                        <img
                          src={rateCard.imageUrl}
                          alt={rateCard.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                      </div>
                    ) : null}
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-slate-950">
                          {rateCard.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className="rounded-full border-slate-200"
                        >
                          Rate card
                        </Badge>
                      </div>
                      {rateCard.agency?.agencyName ? (
                        <p className="mt-1 text-sm text-slate-500">
                          {rateCard.agency.agencyName}
                        </p>
                      ) : null}
                      {rateCard.location ? (
                        <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {rateCard.location}
                        </p>
                      ) : null}
                      {rateCard.description ? (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                          {rateCard.description}
                        </p>
                      ) : null}
                      <Button
                        className="mt-4 w-full rounded-full"
                        variant="outline"
                      >
                        View rate card
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {registeredListings.length > 0 ? (
        <section className="pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Digital platforms
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Registered digital show platforms you can schedule with.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {registeredListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="overflow-hidden border-slate-200 bg-white"
                >
                  {listing.imageUrl ? (
                    <div className="relative h-36 w-full overflow-hidden">
                      <img
                        src={listing.imageUrl}
                        alt={listing.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-950">
                      {listing.name}
                    </h3>
                    {listing.agency?.agencyName ? (
                      <p className="text-sm text-slate-500">
                        {listing.agency.agencyName}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                      {listing.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.location}
                        </span>
                      ) : null}
                      {listing.reach ? <span>{listing.reach}</span> : null}
                      {listing.priceRange ? (
                        <span>{listing.priceRange}</span>
                      ) : null}
                    </div>
                    <Button asChild className="mt-4 w-full rounded-full" size="sm">
                      <Link
                        href={`/media/schedule?type=DIGITAL&listing=${listing.id}`}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule show
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Example show formats
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              These are digital shows distributed on social platforms — episode
              integrations, live sponsorships, and show partnerships. Not paid
              social ad campaigns.
            </p>
          </div>

          <div className="space-y-6">
            {filteredShows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No shows match those filters
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try another platform or format.
                </p>
              </div>
            ) : (
              filteredShows.map((show) => {
                const IconComponent = show.icon;
                return (
                  <Card
                    key={show.id}
                    className="overflow-hidden border-slate-200 bg-white"
                  >
                    <div className="grid gap-6 p-5 lg:grid-cols-3 lg:p-6">
                      <div className="space-y-4 lg:col-span-1">
                        <div className="flex items-start gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                            <IconComponent className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-xl font-semibold text-slate-950">
                              {show.name}
                            </h3>
                            <p className="mt-0.5 text-sm text-slate-500">
                              {show.hostLabel}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {show.platforms.map((platform) => (
                            <Badge
                              key={platform}
                              variant="outline"
                              className="rounded-full border-slate-200 bg-[#f7f8fc]"
                            >
                              {platform}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm text-slate-500">{show.audience}</p>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Integration formats
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {show.formats.map((format) => (
                              <Badge
                                key={format}
                                variant="outline"
                                className="rounded-full border-slate-200 text-xs text-slate-600"
                              >
                                {format}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2">
                        <h4 className="mb-4 text-sm font-semibold text-slate-950">
                          Sponsorship packages
                        </h4>
                        <div className="grid gap-4 md:grid-cols-3">
                          {show.packages.map((pkg) => (
                            <Card
                              key={pkg.name}
                              className={cn(
                                "border-slate-200 bg-[#f7f8fc] transition hover:border-slate-300 hover:bg-white"
                              )}
                            >
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">
                                  {pkg.name}
                                </CardTitle>
                                <div className="text-2xl font-semibold text-slate-950">
                                  {pkg.price}
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <ul className="space-y-1.5 text-xs text-slate-500">
                                  {pkg.features.map((feature) => (
                                    <li
                                      key={feature}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                                <Button
                                  className="w-full rounded-full"
                                  size="sm"
                                  onClick={() =>
                                    handlePackageClick(show.name, pkg)
                                  }
                                >
                                  Inquire about show
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </section>

      <InquiryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageInfo={selectedPackage}
      />
    </div>
  );
}
