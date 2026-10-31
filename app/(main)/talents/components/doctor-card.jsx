import { BadgeCheck, Clock, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getDisplaySkillLabels } from "@/lib/skill-labels";

function shortRate(service) {
  const number = Number(service?.rate);
  if (!Number.isFinite(number)) return null;
  const amount = number.toLocaleString("en-GH");
  if (service.rateType === "PER_SESSION") return `GH₵ ${amount}/session`;
  if (service.rateType === "FIXED") return `GH₵ ${amount}`;
  return `GH₵ ${amount}/hr`;
}

export function DoctorCard({ doctor }) {
  const profileBase = `/talents/${encodeURIComponent(String(doctor.specialty ?? "").trim())}/${doctor.id}`;
  const skills = getDisplaySkillLabels(doctor.skills);
  const isAvailable = doctor.availabilities && doctor.availabilities.length > 0;
  const price = shortRate(doctor.services?.[0]);
  const name = doctor.name || "Talent";
  const verified = doctor.verificationStatus === "VERIFIED";

  return (
    <article className="flex h-full flex-col rounded-[1.35rem] border border-slate-200 bg-white p-2.5 shadow-sm">
      <Link href={profileBase} className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
        {doctor.imageUrl ? (
          <Image src={doctor.imageUrl} alt="" fill className="object-cover" sizes="240px" />
        ) : (
          <span className="flex h-full items-center justify-center bg-gradient-to-br from-[#ede9fe] via-white to-[#e0e7ff] text-[#6d28d9]">
            <User className="h-7 w-7" />
          </span>
        )}
        {verified ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-slate-800">
            <BadgeCheck className="h-3 w-3 text-sky-500" />
            Verified
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-slate-950">{name}</h3>
          {isAvailable ? <Clock className="h-3.5 w-3.5 shrink-0 text-[#6d28d9]" aria-label="Open slots" /> : null}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {(skills.length ? skills : doctor.specialty ? [doctor.specialty] : []).slice(0, 3).map((skill) => (
            <span
              key={skill}
              title={skill}
              className="max-w-full truncate rounded-full bg-[#f3eefe] px-2 py-0.5 text-[11px] font-medium leading-4 text-[#5b21b6]"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium leading-4 text-slate-500">
              +{skills.length - 3}
            </span>
          ) : null}
        </div>
        {price ? <p className="mt-2 text-sm font-semibold text-[#6d28d9]">{price}</p> : <span className="mt-2" />}
        <Link
          href={profileBase}
          className="mt-3 inline-flex h-8 items-center justify-center rounded-full bg-[#6d28d9] text-xs font-semibold text-white hover:bg-[#5b21b6]"
        >
          Book
        </Link>
      </div>
    </article>
  );
}
