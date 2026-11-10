import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, LayoutGrid, Trophy } from "lucide-react";
import { SPECIALTIES } from "@/lib/specialities";

export default function FindTalentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d28d9]">
            Find talents
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Browse by specialty
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            {SPECIALTIES.length} categories, or open All talents to see every verified creator.
          </p>
        </div>
        <Link
          href="/talents/leaderboard"
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-[#6d28d9] px-4 text-sm font-semibold text-white hover:bg-[#5b21b6] sm:self-auto"
        >
          <Trophy className="h-4 w-4" />
          View leaderboard
        </Link>
      </div>

      <div
        id="specialties"
        className="mt-8 grid scroll-mt-28 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <Link
          href="/talents/all"
          className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="relative aspect-[4/5] bg-slate-100">
            <Image
              src="/banner2.png"
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 90vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#6d28d9]/25 to-transparent" />
            <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 opacity-0 transition group-hover:opacity-100">
              <ArrowUpRight className="h-4 w-4" />
            </span>
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#5b21b6]">
              <LayoutGrid className="h-3.5 w-3.5" />
              Directory
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                All categories
              </p>
              <h2 className="mt-0.5 text-xl font-semibold text-white">All talents</h2>
            </div>
          </div>
        </Link>

        <Link
          href="/talents/leaderboard"
          className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="relative aspect-[4/5] bg-[#16142b]">
            <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_70%_20%,rgba(251,191,36,0.28),transparent_55%),radial-gradient(80%_60%_at_10%_80%,rgba(109,40,217,0.45),transparent_50%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 opacity-0 transition group-hover:opacity-100">
              <ArrowUpRight className="h-4 w-4" />
            </span>
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-2.5 py-1 text-[11px] font-semibold text-slate-950">
              <Trophy className="h-3.5 w-3.5" />
              Ranked
            </div>
            <div className="absolute inset-x-0 top-[28%] flex justify-center">
              <div className="flex items-end gap-2">
                <span className="h-14 w-10 rounded-t-lg bg-white/15 ring-1 ring-white/20" />
                <span className="h-20 w-10 rounded-t-lg bg-amber-300/90 ring-1 ring-amber-200" />
                <span className="h-11 w-10 rounded-t-lg bg-white/15 ring-1 ring-white/20" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                All categories
              </p>
              <h2 className="mt-0.5 text-xl font-semibold text-white">Leaderboard</h2>
            </div>
          </div>
        </Link>

        {SPECIALTIES.map((specialty) => {
          const href = `/talents/${encodeURIComponent(specialty.name.trim())}`;
          const label = specialty.name.trim();
          return (
            <Link
              key={specialty.name}
              href={href}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/5] bg-slate-100">
                {specialty.image ? (
                  <Image
                    src={specialty.image}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 90vw"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 opacity-0 transition group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                    Specialty
                  </p>
                  <h2 className="mt-0.5 text-xl font-semibold text-white">{label}</h2>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
