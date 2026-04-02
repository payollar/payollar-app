import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Particles } from "@/components/ui/particles";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowUpRight, Users, Search } from "lucide-react";
import { SPECIALTIES } from "@/lib/specialities";
import { SectionShell } from "@/components/landing/section-shell";

export default function FindTalentsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <Particles
          className="absolute inset-0 opacity-[0.4]"
          quantity={90}
          color="#0055ff"
          staticity={45}
          ease={48}
        />
        <div className="absolute inset-0 grid-pattern opacity-[0.07]" />
      </div>

      <SectionShell className="relative z-10 max-w-[90rem] pb-20 pt-2 md:pb-28 md:pt-4">
        {/* Hero */}
        <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
          <Badge variant="glow" className="mb-5 px-4 py-2 text-sm font-medium">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Talent marketplace
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Find{" "}
            <span className="mt-1 inline-block rounded-xl bg-primary px-3 py-1.5 text-white shadow-lg shadow-primary/30 md:mt-0 md:px-4 md:py-2">
              top talents
            </span>
          </h1>
          <p className="mt-5 text-pretty text-lg text-muted-foreground md:text-xl">
            Browse by specialty—DJs, artists, hosts, creators, and more. Book sessions or view profiles in a few clicks.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="marketing" size="lg" className="rounded-full shadow-lg shadow-primary/20">
              <Link href="#specialties">
                <Users className="mr-2 h-5 w-5" />
                Browse specialties
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link href="/products">
                <Search className="mr-2 h-5 w-5" />
                Browse services
              </Link>
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div id="specialties" className="scroll-mt-28">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Browse by specialty</h2>
              <p className="mt-1 text-muted-foreground">
                {SPECIALTIES.length} categories · tap a card to see talents
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SPECIALTIES.map((specialty) => {
              const href = `/talents/${encodeURIComponent(specialty.name.trim())}`;
              const label = specialty.name.trim();
              return (
                <Link key={specialty.name} href={href} className="group block h-full">
                  <Card className="h-full overflow-hidden border border-border bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-xl hover:shadow-primary/15">
                    <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4]">
                      {specialty.image ? (
                        <Image
                          src={specialty.image}
                          alt={label}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 90vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                          No image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                      <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                        <ArrowUpRight className="h-5 w-5 text-primary" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 pt-12">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/80">Specialty</p>
                        <h3 className="mt-0.5 text-lg font-semibold leading-snug text-white md:text-xl">{label}</h3>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
