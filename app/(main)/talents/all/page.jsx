import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search, Users } from "lucide-react";
import { getAllVerifiedTalents } from "@/actions/doctors-listing";
import { DoctorCard } from "../components/doctor-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Talents - Payollar",
  description: "Browse all verified creators on Payollar.",
};

export default async function AllTalentsPage() {
  const { doctors, error } = await getAllVerifiedTalents();

  if (error) {
    console.error("Error fetching all talents:", error);
  }

  const list = doctors ?? [];
  const count = list.length;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <Link
        href="/talents"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        All specialties
      </Link>

      <section className="relative mt-4 overflow-hidden rounded-3xl bg-[#16142b] text-white">
        <div className="absolute inset-y-0 right-0 hidden w-[46%] md:block">
          <Image
            src="/banner2.png"
            alt=""
            fill
            className="object-cover"
            sizes="640px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#16142b] via-[#16142b]/80 to-[#16142b]/20" />
        </div>
        <div className="relative max-w-xl px-6 py-8 md:px-10 md:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">
            Directory
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">All talents</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Every verified creator on Payollar. Open a profile to see services, prices, and open
            times — or browse by specialty instead.
          </p>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2 text-sm text-slate-600">
          <Users className="h-4 w-4 text-[#6d28d9]" />
          {count === 0
            ? "No talents listed yet"
            : count === 1
              ? "1 verified talent"
              : `${count} verified talents`}
        </p>
        <Link
          href="/talents#specialties"
          className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-[#6d28d9]"
        >
          Browse by specialty
        </Link>
      </div>

      {list.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-300" />
          <h2 className="mt-3 text-lg font-semibold">No talents yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Verified creators will show up here. You can also browse specialty categories while the
            directory fills in.
          </p>
          <Link
            href="/talents#specialties"
            className="mt-6 inline-flex rounded-xl bg-[#6d28d9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5b21b6]"
          >
            Browse specialties
          </Link>
        </div>
      )}
    </div>
  );
}
