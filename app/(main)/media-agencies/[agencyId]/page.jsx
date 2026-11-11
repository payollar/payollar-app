import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Building2,
  Globe,
  Radio,
} from "lucide-react";
import { db } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { agencyId } = await params;
  const agency = await db.mediaAgency.findUnique({
    where: { id: agencyId },
    select: { agencyName: true, description: true },
  });
  if (!agency) return { title: "Media profile - Payollar" };
  return {
    title: `${agency.agencyName} - Payollar`,
    description:
      agency.description ||
      `Stations and rate cards from ${agency.agencyName}`,
  };
}

function buyHref(listing, rateCardId) {
  if (listing.listingType === "TV") {
    const qs = new URLSearchParams({
      listing: listing.id,
      agency: listing.agencyId,
      station: listing.name,
    });
    if (rateCardId) qs.set("rateCard", rateCardId);
    return `/products/tv-media?${qs}`;
  }
  if (listing.listingType === "RADIO") {
    const qs = new URLSearchParams({
      listing: listing.id,
      agency: listing.agencyId,
      station: listing.name,
    });
    if (rateCardId) qs.set("rateCard", rateCardId);
    return `/products/radio-media?${qs}`;
  }
  return `/media/schedule?type=${listing.listingType}&listing=${listing.id}`;
}

export default async function MediaAgencyProfilePage({ params }) {
  const { agencyId } = await params;

  const agency = await db.mediaAgency.findUnique({
    where: { id: agencyId },
    select: {
      id: true,
      agencyName: true,
      description: true,
      logoUrl: true,
      city: true,
      region: true,
      country: true,
      website: true,
      verificationStatus: true,
    },
  });

  if (!agency) notFound();

  const [listings, rateCards] = await Promise.all([
    db.mediaListing.findMany({
      where: { agencyId, status: "ACTIVE" },
      orderBy: [{ listingType: "asc" }, { name: "asc" }],
      select: {
        id: true,
        agencyId: true,
        name: true,
        listingType: true,
        location: true,
        frequency: true,
        reach: true,
        priceRange: true,
        imageUrl: true,
      },
    }),
    db.rateCard.findMany({
      where: { agencyId, isPublished: true },
      select: {
        id: true,
        title: true,
        listingId: true,
        listingType: true,
      },
      orderBy: { lastUpdated: "desc" },
    }),
  ]);

  const rateCardByListingId = {};
  for (const card of rateCards) {
    if (card.listingId && !rateCardByListingId[card.listingId]) {
      rateCardByListingId[card.listingId] = card;
    }
  }

  const place = [agency.city || agency.region, agency.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← Browse media
        </Link>
      </div>

      <header className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div
          className="h-1 bg-gradient-to-r from-[#0055ff] via-[#3b82f6] to-[#0055ff]"
          aria-hidden
        />
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
          <div className="flex min-w-0 flex-1 gap-4">
            {agency.logoUrl ? (
              <div className="shrink-0 self-start rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={agency.logoUrl}
                  alt={agency.agencyName}
                  className="h-16 w-16 rounded-xl object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff] sm:h-[4.5rem] sm:w-[4.5rem]">
                <Building2 className="h-7 w-7" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#0055ff]">
                  Media profile
                </span>
                {agency.verificationStatus === "VERIFIED" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </span>
                ) : null}
              </div>
              <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {agency.agencyName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-[15px]">
                {agency.description ||
                  `Stations and rates from ${agency.agencyName}`}
              </p>
              <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                {place ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {place}
                  </span>
                ) : null}
                {agency.website ? (
                  <a
                    href={
                      agency.website.startsWith("http")
                        ? agency.website
                        : `https://${agency.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-[#0055ff] hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {agency.website.replace(/^https?:\/\//, "")}
                  </a>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5" />
                  {listings.length} station{listings.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-5 overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Stations</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Listings on Browse · rates from published smart rate cards
              </p>
            </div>
            <p className="text-sm tabular-nums text-slate-400">
              {listings.length}
            </p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500 sm:px-6">
            No active stations yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {listings.map((listing) => {
              const card = rateCardByListingId[listing.id];
              const href = buyHref(listing, card?.id);
              return (
                <li
                  key={listing.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100"
                      )}
                    >
                      {listing.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={listing.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Radio className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {listing.name}
                        </p>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                          {String(listing.listingType).replaceAll("_", " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {[listing.location, listing.frequency, listing.reach]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                      {card ? (
                        <p className="mt-1 text-xs font-medium text-[#0055ff]">
                          Rate card: {card.title}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">
                          No published rate card linked
                        </p>
                      )}
                      {listing.priceRange ? (
                        <p className="mt-1 text-xs font-semibold tabular-nums text-slate-700">
                          From {listing.priceRange}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {card ? (
                      <Button
                        asChild
                        variant="outline"
                        className="h-9 rounded-full border-slate-200 px-4 text-xs"
                      >
                        <Link href={`/rate-cards/${card.id}`}>View rates</Link>
                      </Button>
                    ) : null}
                    <Button
                      asChild
                      className="h-9 rounded-full bg-slate-950 px-4 text-xs text-white hover:bg-slate-800"
                    >
                      <Link href={href}>
                        Buy
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
