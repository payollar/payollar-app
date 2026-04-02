import {
  User,
  Star,
  MapPin,
  DollarSign,
  Check,
  Clock,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function DoctorCard({ doctor }) {
  const profileBase = `/talents/${encodeURIComponent(String(doctor.specialty ?? "").trim())}/${doctor.id}`;

  const skills = doctor.skills?.map((skill) => skill.name) || [];
  const isAvailable =
    doctor.availabilities && doctor.availabilities.length > 0;

  const rating = 4.9;
  const reviews = 127;

  const location = "Available Worldwide";
  const rate = "Book to see rates";

  const experienceText = doctor.experience
    ? `${doctor.experience} years experience`
    : doctor.specialty || "Talent";

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border border-border bg-card shadow-md",
        "transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/45 hover:shadow-xl hover:shadow-primary/12"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {doctor.imageUrl ? (
          <Image
            src={doctor.imageUrl}
            alt={doctor.name || "Talent"}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/8 to-muted">
            <div className="rounded-full bg-primary/10 p-6">
              <User className="h-12 w-12 text-primary/70" />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        {doctor.verificationStatus === "VERIFIED" && (
          <div className="absolute left-3 top-3 z-[1]">
            <Badge className="flex items-center gap-1 rounded-full border border-white/20 bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm backdrop-blur-sm">
              <Check className="h-3 w-3" />
              Verified
            </Badge>
          </div>
        )}

        {isAvailable && (
          <div className="absolute right-3 top-3 z-[1]">
            <Badge className="flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <Clock className="h-3 w-3" />
              Available
            </Badge>
          </div>
        )}

        <div className="absolute bottom-3 left-3 z-[1]">
          <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/65 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
            <span className="font-semibold tabular-nums">{rating}</span>
            <span className="text-white/65">({reviews})</span>
          </div>
        </div>

        <Link
          href={profileBase}
          className="absolute right-3 bottom-3 z-[1] flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white opacity-0 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-white/25 group-hover:opacity-100"
          aria-label={`View ${doctor.name || "talent"} profile`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <CardContent className="space-y-4 p-5 md:p-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold leading-tight tracking-tight text-foreground md:text-[1.35rem]">
            {doctor.name || "Talent"}
          </h3>
          <p className="text-sm leading-snug text-muted-foreground md:text-base">
            {experienceText}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/60 pb-4 text-sm">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-muted-foreground">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/80">
              <MapPin className="h-4 w-4 text-primary" />
            </span>
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </span>
            <span className="text-sm md:text-base">{rate}</span>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="inline-flex rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-foreground/90"
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
          <Button
            asChild
            variant="marketing"
            className="flex-1 rounded-full font-semibold shadow-md shadow-primary/15"
          >
            <Link href={profileBase}>Book now</Link>
          </Button>
          <Button
            asChild
            variant="glass"
            className="flex-1 rounded-full border-border/70 font-semibold"
          >
            <Link href={profileBase} className="gap-2">
              <Eye className="h-4 w-4" />
              Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
