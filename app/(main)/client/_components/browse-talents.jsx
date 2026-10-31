"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ClipboardPenLine, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientPageShell } from "./client-page-shell";

function money(rate, rateType) {
  const amount = `GH₵ ${Number(rate || 0).toLocaleString("en-GH")}`;
  if (rateType === "PER_HOUR") return `${amount}/hr`;
  if (rateType === "PER_SESSION") return `${amount}/session`;
  return amount;
}

export function BrowseTalents({ talents = [], categories = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const availableSpecialties = useMemo(() => {
    return [...new Set(talents.map((talent) => talent.specialty).filter(Boolean))].sort();
  }, [talents]);

  const filteredTalents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return talents.filter((talent) => {
      const matchesSearch =
        query === "" ||
        talent.name?.toLowerCase().includes(query) ||
        talent.specialty?.toLowerCase().includes(query) ||
        talent.description?.toLowerCase().includes(query);
      const matchesSpecialty = specialtyFilter === "all" || talent.specialty === specialtyFilter;
      const matchesCategory =
        categoryFilter === "all" || talent.services?.some((service) => service.category === categoryFilter);
      return matchesSearch && matchesSpecialty && matchesCategory;
    });
  }, [talents, searchQuery, specialtyFilter, categoryFilter]);

  return (
    <ClientPageShell
      eyebrow="Discover"
      title="Browse talents"
      description="Verified creators and the services they actually list."
      actions={
        <Link
          href="/talents"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0055ff] px-4 text-sm font-semibold text-white hover:bg-[#003ecc]"
        >
          <Search className="h-4 w-4" />
          Public directory
        </Link>
      }
    >
      <div className="rounded-[22px] bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, specialty, or description"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 border-slate-200 bg-[#f7f8fc] pl-10 text-slate-900"
            />
          </div>
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="h-11 w-full border-slate-200 bg-[#f7f8fc] text-slate-900 lg:w-[200px]">
              <SelectValue placeholder="All specialties" />
            </SelectTrigger>
            <SelectContent data-theme="light">
              <SelectItem value="all">All specialties</SelectItem>
              {availableSpecialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-11 w-full border-slate-200 bg-[#f7f8fc] text-slate-900 lg:w-[200px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent data-theme="light">
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        {filteredTalents.length} {filteredTalents.length === 1 ? "talent" : "talents"}
      </p>

      {filteredTalents.length > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTalents.map((talent) => (
            <TalentCard key={talent.id} talent={talent} />
          ))}
        </div>
      ) : (
        <div className="rounded-[22px] bg-white px-6 py-16 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <Search className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="font-medium text-slate-900">No talents match this search</p>
          <p className="mt-1 text-sm text-slate-500">Try another name, specialty, or category.</p>
        </div>
      )}
    </ClientPageShell>
  );
}

function TalentCard({ talent }) {
  const services = talent.services || [];
  const servicesCount = talent._count?.services ?? services.length;
  const shownServices = services.slice(0, 1);
  const skills = (talent.skills || []).slice(0, 2);
  const extraSkills = Math.max(0, (talent.skills || []).length - skills.length);
  const profileHref = `/talents/${encodeURIComponent(talent.specialty || "all")}/${talent.id}`;

  const service = shownServices[0];
  const moreServices = Math.max(0, servicesCount - (service ? 1 : 0));

  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex h-11 items-center gap-2.5">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#e8f0ff]">
          {talent.imageUrl ? (
            <Image src={talent.imageUrl} alt="" fill className="object-cover" sizes="40px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[#0055ff]">
              <User className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold leading-5 text-slate-950">{talent.name || "Creator"}</h2>
          <div className="mt-0.5 flex h-4 min-w-0 items-center gap-1.5">
            {talent.specialty ? (
              <span className="truncate rounded-full bg-[#e8f0ff] px-1.5 py-0.5 text-[10px] font-medium leading-none text-[#0b3db8]">
                {talent.specialty}
              </span>
            ) : (
              <span className="text-[10px] text-slate-300">Specialty not set</span>
            )}
            {talent.experience ? (
              <span className="shrink-0 text-[11px] text-slate-400">{talent.experience}y</span>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-2 h-8 overflow-hidden text-xs leading-4 text-slate-500">
        <span className="line-clamp-2">{talent.description || "No bio yet."}</span>
      </p>

      <div className="mt-2">
        <p className="mb-1 flex h-4 items-center gap-1 text-[11px] font-semibold text-slate-600">
          <ClipboardPenLine className="h-3 w-3 text-[#0055ff]" />
          Services ({servicesCount})
        </p>
        <div className="flex h-8 items-center justify-between gap-2 rounded-lg bg-[#f7f8fc] px-2">
          {service ? (
            <>
              <p className="min-w-0 truncate text-xs font-medium text-slate-900">{service.title}</p>
              <p className="shrink-0 text-[11px] font-semibold tabular-nums text-[#0055ff]">
                {money(service.rate, service.rateType)}
                {moreServices > 0 ? <span className="ml-1 font-medium text-slate-400">+{moreServices}</span> : null}
              </p>
            </>
          ) : (
            <p className="truncate text-xs text-slate-400">No service listed</p>
          )}
        </div>
      </div>

      <div className="mt-2 flex h-5 min-w-0 items-center gap-1 overflow-hidden">
        {skills.length > 0 ? (
          <>
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="min-w-0 truncate rounded-full border border-slate-200 px-1.5 py-0.5 text-[10px] leading-none text-slate-600"
              >
                {skill.name}
              </span>
            ))}
            {extraSkills > 0 ? (
              <span className="shrink-0 rounded-full border border-slate-200 px-1.5 py-0.5 text-[10px] leading-none text-slate-500">
                +{extraSkills}
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-[10px] text-slate-300">No skills yet</span>
        )}
      </div>

      <Link
        href={profileHref}
        className="mt-3 inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-[#0055ff] text-xs font-semibold text-white hover:bg-[#003ecc]"
      >
        View profile
      </Link>
    </article>
  );
}
