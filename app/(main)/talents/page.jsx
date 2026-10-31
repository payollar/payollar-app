import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SPECIALTIES } from "@/lib/specialities";

export default function FindTalentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d28d9]">Find talents</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Browse by specialty</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-500">
          {SPECIALTIES.length} categories. Open one to see verified creators, their services, and open times.
        </p>
      </div>

      <div id="specialties" className="mt-8 grid scroll-mt-28 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {SPECIALTIES.map((specialty) => {
          const href = `/talents/${encodeURIComponent(specialty.name.trim())}`;
          const label = specialty.name.trim();
          return (
            <Link key={specialty.name} href={href} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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
                  <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">Specialty</p>
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
