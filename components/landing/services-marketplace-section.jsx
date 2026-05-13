import Image from "next/image";
import Link from "next/link";
import { Briefcase, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionShell } from "@/components/landing/section-shell";
import { SectionParticles } from "@/components/landing/section-particles";
import { cn } from "@/lib/utils";

function formatServiceRate(service) {
  const rate = Number(service.rate || 0).toFixed(2);
  switch (service.rateType) {
    case "PER_HOUR":
      return `₵${rate}/hr`;
    case "PER_SESSION":
      return `₵${rate}/session`;
    case "FIXED":
      return `₵${rate}`;
    default:
      return `₵${rate}`;
  }
}

function talentProfileHref(creator) {
  const raw = String(creator?.specialty ?? "").trim();
  const segment = raw ? encodeURIComponent(raw) : "talent";
  return `/talents/${segment}/${creator.id}`;
}

function CategoryPill({ href, label, isActive }) {
  return (
    <Button
      asChild
      size="sm"
      variant={isActive ? "default" : "outline"}
      className={cn(
        "rounded-full border-border/60 px-4 shadow-none transition-colors",
        isActive && "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
      )}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}

/** Full-page services marketplace (used at `/services`, not embedded on the home page). */
export function ServicesMarketplaceSection({
  services = [],
  categories = [],
  hasUncategorized = false,
  activeCategory = null,
}) {
  const showCategoryRow = categories.length > 0 || hasUncategorized;

  return (
    <main className="relative overflow-hidden bg-muted/15 pb-16 pt-6 md:pb-24 md:pt-10">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <SectionParticles
          className="-left-8 top-24 h-[min(28rem,60vh)] w-[min(100%,22rem)] md:left-0"
          opacityClass="opacity-[0.12]"
          quantity={32}
        />
      </div>

      <SectionShell className="relative z-10 max-w-[90rem]">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <Badge
            variant="default"
            className="mb-4 rounded-full border-0 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/25"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Services marketplace
          </Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground [font-family:var(--font-heading)] md:text-4xl lg:text-5xl">
            Book creator{" "}
            <span className="bg-linear-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
              services
            </span>
          </h1>
          <p className="mt-4 text-pretty text-lg text-muted-foreground md:text-xl">
            Verified talents list bookable offerings—sessions, fixed packages, and hourly work. Open a profile to check
            availability and schedule.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="marketing" size="lg" className="rounded-full shadow-lg shadow-primary/20">
              <Link href="/talents">
                Browse all talents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-primary/35">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>

        {showCategoryRow ? (
          <div className="mb-12 md:mb-14">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Browse by category
            </p>
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2 px-1">
              <CategoryPill href="/services" label="All services" isActive={activeCategory == null} />
              {categories.map((cat) => (
                <CategoryPill
                  key={cat}
                  href={`/services?category=${encodeURIComponent(cat)}`}
                  label={cat}
                  isActive={activeCategory === cat}
                />
              ))}
              {hasUncategorized ? (
                <CategoryPill
                  href="/services?category=__none__"
                  label="Uncategorized"
                  isActive={activeCategory === "__none__"}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {services.length === 0 ? (
          <Card className="mx-auto max-w-xl border-border/60 bg-card/80 text-center shadow-sm backdrop-blur-sm">
            <CardContent className="p-10 md:p-12">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-60" />
              <h2 className="text-lg font-semibold text-foreground">
                {activeCategory != null ? "No services in this category" : "Services go live here"}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {activeCategory != null
                  ? "Try another category or browse all services again."
                  : "Once verified creators publish active services, they appear on this marketplace. You can still discover talents by specialty."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {activeCategory != null ? (
                  <Button asChild className="rounded-full" variant="marketing">
                    <Link href="/services">View all services</Link>
                  </Button>
                ) : null}
                <Button asChild className="rounded-full" variant={activeCategory != null ? "outline" : "marketing"}>
                  <Link href="/talents">Find talents</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service) => {
              const creator = service.creator;
              const profileHref = talentProfileHref(creator);
              return (
                <Card
                  key={service.id}
                  className={cn(
                    "group flex h-full flex-col overflow-hidden border-border/60 bg-card/90 shadow-sm backdrop-blur-sm",
                    "transition-all hover:border-primary/35 hover:shadow-lg hover:shadow-primary/[0.08]"
                  )}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    {service.imageUrl ? (
                      <Image
                        src={service.imageUrl}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 to-muted">
                        <Briefcase className="h-12 w-12 text-primary/50" />
                      </div>
                    )}
                  </div>
                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {service.category ? (
                        <Badge variant="secondary" className="text-xs font-medium">
                          {service.category}
                        </Badge>
                      ) : null}
                      <Badge variant="outline" className="border-primary/25 text-xs font-medium text-primary">
                        {formatServiceRate(service)}
                      </Badge>
                    </div>
                    <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-foreground">{service.title}</h3>
                    {service.description ? (
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{service.description}</p>
                    ) : (
                      <div className="flex-1" />
                    )}
                    <div className="mt-4 flex items-center gap-3 border-t border-border/50 pt-4">
                      {creator?.imageUrl ? (
                        <Image
                          src={creator.imageUrl}
                          alt={creator?.name ? `${creator.name} profile` : "Creator profile"}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-background"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                          {(creator?.name || "?").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{creator?.name || "Creator"}</p>
                        {creator?.specialty ? (
                          <p className="truncate text-xs text-muted-foreground">{creator.specialty}</p>
                        ) : null}
                      </div>
                    </div>
                    <Button asChild className="mt-4 w-full rounded-xl" variant="marketing">
                      <Link href={profileHref}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Book on profile
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </SectionShell>
    </main>
  );
}
