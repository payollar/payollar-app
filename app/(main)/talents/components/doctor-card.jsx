import {
  User,
  Star,
  MapPin,
  DollarSign,
  Check,
  Clock,
  Eye,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getDisplaySkillLabels } from "@/lib/skill-labels";

const MAX_VISIBLE_SKILLS = 3;

export function DoctorCard({ doctor }) {
  const profileBase = `/talents/${encodeURIComponent(String(doctor.specialty ?? "").trim())}/${doctor.id}`;

  const skillLabels = getDisplaySkillLabels(doctor.skills);
  const visibleSkills = skillLabels.slice(0, MAX_VISIBLE_SKILLS);
  const hiddenSkillCount = Math.max(0, skillLabels.length - visibleSkills.length);
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
        "group gap-0 overflow-hidden rounded-2xl border border-border bg-card py-0 shadow-md",
        "transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/45 hover:shadow-xl hover:shadow-primary/12"
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
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
            <div className="rounded-full bg-primary/10 p-4">
              <User className="h-10 w-10 text-primary/70" />
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

      <CardContent className="min-w-0 space-y-3 p-4">
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold leading-tight tracking-tight text-foreground">
            {doctor.name || "Talent"}
          </h3>
          <p className="text-sm leading-snug text-muted-foreground">
            {experienceText}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border/60 pb-3 text-xs">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 text-muted-foreground">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/80">
              <MapPin className="h-3.5 w-3.5 text-primary" />
            </span>
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
            </span>
            <span>{rate}</span>
          </div>
        </div>

        {skillLabels.length > 0 && (
          <div className="min-w-0 rounded-lg border border-border/50 bg-muted/20 p-2.5">
            <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">
              <Sparkles className="h-3 w-3 shrink-0 text-white/80" aria-hidden />
              Skills
            </p>
            <div className="flex min-w-0 max-w-full flex-wrap gap-1.5">
              {visibleSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="max-w-full shrink whitespace-normal break-words border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium leading-snug text-white"
                >
                  {skill}
                </Badge>
              ))}
              {hiddenSkillCount > 0 && (
                <Badge
                  variant="secondary"
                  className="shrink-0 border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white/70"
                >
                  +{hiddenSkillCount} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            asChild
            size="sm"
            variant="marketing"
            className="h-9 flex-1 rounded-full text-sm font-semibold shadow-md shadow-primary/15"
          >
            <Link href={profileBase}>Book now</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="marketing"
            className="h-9 flex-1 rounded-full text-sm font-semibold shadow-md shadow-primary/15"
          >
            <Link href={profileBase} className="gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
