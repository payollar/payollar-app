import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles, Users } from "lucide-react";
import { getDoctorsBySpecialty } from "@/actions/doctors-listing";
import { DoctorCard } from "../components/doctor-card";
import { getSpecialtyBySlug } from "@/lib/specialities";
import { SectionShell } from "@/components/landing/section-shell";
import { Particles } from "@/components/ui/particles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <Particles
          className="absolute inset-0 opacity-[0.38]"
          quantity={88}
          color="#0055ff"
          staticity={46}
          ease={48}
        />
        <div className="absolute inset-0 grid-pattern opacity-[0.07]" />
      </div>

      <SectionShell className="relative z-10 max-w-[90rem] pb-20 pt-2 md:pb-28 md:pt-4">
        <div className="mb-8">
          <Button
            asChild
            variant="glass"
            size="sm"
            className="rounded-full border-border/60"
          >
            <Link href="/talents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All specialties
            </Link>
          </Button>
        </div>

        {meta?.image ? (
          <div className="relative mb-10 overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-xl shadow-black/10">
            <div className="relative aspect-[20/9] min-h-[200px] w-full md:aspect-[2.8/1] md:min-h-[260px]">
              <Image
                src={meta.image}
                alt={title}
                fill
                priority
                className="object-cover opacity-45"
                sizes="(min-width: 1280px) 90rem, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/94 via-black/55 to-black/35" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10">
                <Badge
                  variant="glow"
                  className="mb-4 border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md"
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                  Talent specialty
                </Badge>
                <h1 className="text-balance text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-pretty text-base text-white/85 md:text-lg">
                  Verified talents in this category. Book a session or open a profile
                  to see availability and details.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-10 rounded-2xl border border-border/80 bg-card/50 p-6 shadow-lg shadow-black/5 backdrop-blur-sm md:p-8">
            <Badge variant="glow" className="mb-4 px-3 py-1.5 text-xs font-medium">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
              Talent specialty
            </Badge>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-muted-foreground md:text-lg">
              Verified talents in this category. Book a session or open a profile to see
              availability and details.
            </p>
          </div>
        )}

        <div className="mb-8 flex flex-col gap-3 border-b border-border/60 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4 shrink-0 text-primary" />
            {count === 0
              ? "No talents listed yet"
              : count === 1
                ? "1 talent in this specialty"
                : `${count} talents in this specialty`}
          </p>
          <Button asChild variant="outline" size="sm" className="w-fit rounded-full">
            <Link href="/talents#specialties">Browse other categories</Link>
          </Button>
        </div>

        {list.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center shadow-inner backdrop-blur-sm md:px-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              No talents in this specialty yet
            </h2>
            <p className="mx-auto mb-8 max-w-md text-pretty text-muted-foreground">
              Check back soon or explore another category—new creators join Payollar
              regularly.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="marketing" className="rounded-full">
                <Link href="/talents#specialties">Browse specialties</Link>
              </Button>
              <Button asChild variant="glass" className="rounded-full">
                <Link href="/talents">Back to Find talents</Link>
              </Button>
            </div>
          </div>
        )}
      </SectionShell>
    </div>
  );
}
