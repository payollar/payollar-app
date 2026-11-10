import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { getDoctorsBySpecialty } from "@/actions/doctors-listing";
import { DoctorCard } from "../components/doctor-card";
import { getSpecialtyBySlug } from "@/lib/specialities";

export default async function DoctorSpecialtyPage({ params }) {
  const { specialty } = await params;

  if (!specialty) {
    redirect("/talents");
  }

  const { doctors, error } = await getDoctorsBySpecialty(specialty);

  if (error) {
    console.error("Error fetching doctors:", error);
  }

  const title = decodeURIComponent(String(specialty).replace(/\+/g, " ")).trim();
  const meta = getSpecialtyBySlug(specialty);
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
        {meta?.image ? (
          <div className="absolute inset-y-0 right-0 hidden w-[46%] md:block">
            <Image src={meta.image} alt="" fill className="object-cover" sizes="640px" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-[#16142b] via-[#16142b]/80 to-[#16142b]/20" />
          </div>
        ) : null}
        <div className="relative max-w-xl px-6 py-8 md:px-10 md:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">Specialty</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Verified creators in this category. Open a profile to see services, prices, and open times.
          </p>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2 text-sm text-slate-600">
          <Users className="h-4 w-4 text-[#6d28d9]" />
          {count === 0 ? "No talents listed yet" : count === 1 ? "1 talent in this specialty" : `${count} talents in this specialty`}
        </p>
        <Link
          href="/talents#specialties"
          className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-[#6d28d9]"
        >
          Browse other categories
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
          <h2 className="text-lg font-semibold">No talents in this specialty yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Check another category. New creators show up here after they are verified.
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
