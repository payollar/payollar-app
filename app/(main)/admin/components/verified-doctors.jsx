"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check, Ban, Loader2, Search, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { updateDoctorActiveStatus } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PANEL =
  "rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

function formatExperience(experience) {
  if (experience === null || experience === undefined || experience === "") {
    return "Experience not listed";
  }
  const years = Number(experience);
  if (Number.isNaN(years)) return "Experience not listed";
  return `${years} ${years === 1 ? "year" : "years"} experience`;
}

export function VerifiedDoctors({ doctors }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [targetDoctor, setTargetDoctor] = useState(null);
  const [actionType, setActionType] = useState(null);

  const {
    loading,
    data,
    fn: submitStatusUpdate,
  } = useFetch(updateDoctorActiveStatus);

  const filteredDoctors = doctors.filter((doctor) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      doctor.name?.toLowerCase().includes(query) ||
      doctor.specialty?.toLowerCase().includes(query) ||
      doctor.email?.toLowerCase().includes(query)
    );
  });

  const handleStatusChange = async (doctor, suspend) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${suspend ? "suspend" : "reinstate"} ${
        doctor.name || "this talent"
      }?`
    );
    if (!confirmed || loading) return;

    const formData = new FormData();
    formData.append("doctorId", doctor.id);
    formData.append("suspend", suspend ? "true" : "false");

    setTargetDoctor(doctor);
    setActionType(suspend ? "SUSPEND" : "REINSTATE");

    await submitStatusUpdate(formData);
  };

  useEffect(() => {
    if (data?.success && targetDoctor && actionType) {
      const actionVerb = actionType === "SUSPEND" ? "Suspended" : "Reinstated";
      toast.success(
        `${actionVerb} ${targetDoctor.name || "talent"} successfully!`
      );
      setTargetDoctor(null);
      setActionType(null);
    }
  }, [data]);

  return (
    <div className="-m-3 min-h-full min-w-0 space-y-4 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:space-y-5 md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-950 md:text-xl">
            Talents
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage all verified talents on the platform.
          </p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, specialty, or email..."
            className="h-10 rounded-full border-slate-200 bg-white pl-9 text-sm text-slate-900 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <section className={cn(PANEL, "overflow-hidden")}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 md:px-5">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Verified talents
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {filteredDoctors.length}{" "}
              {filteredDoctors.length === 1 ? "result" : "results"}
              {searchTerm ? " matching your search" : ""}
            </p>
          </div>
        </div>

        <div className="p-3 md:p-4">
          {filteredDoctors.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              {searchTerm
                ? "No talents match your search criteria."
                : "No verified talents available."}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDoctors.map((doctor) => {
                const isSuspended = doctor.verificationStatus === "REJECTED";
                const isBusy = loading && targetDoctor?.id === doctor.id;

                return (
                  <article
                    key={doctor.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50/70"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                          {doctor.imageUrl ? (
                            <Image
                              src={doctor.imageUrl}
                              alt={doctor.name || "Talent"}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-950 text-white">
                              <span className="text-sm font-semibold">
                                {(doctor.name || doctor.email || "T")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-950">
                            {doctor.name || "Unnamed talent"}
                          </h3>
                          <p className="mt-0.5 truncate text-sm text-slate-500">
                            {doctor.specialty || "Specialty not listed"}
                            {" · "}
                            {formatExperience(doctor.experience)}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="truncate">{doctor.email}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            isSuspended
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          )}
                        >
                          {isSuspended ? "Suspended" : "Active"}
                        </Badge>

                        {isSuspended ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(doctor, false)}
                            disabled={loading}
                            className="h-9 rounded-full border-slate-200 px-3 text-slate-700 hover:bg-slate-100"
                          >
                            {isBusy ? (
                              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="mr-1.5 h-4 w-4" />
                            )}
                            Reinstate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(doctor, true)}
                            disabled={loading}
                            className="h-9 rounded-full border-rose-200 px-3 text-rose-700 hover:bg-rose-50"
                          >
                            {isBusy ? (
                              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                              <Ban className="mr-1.5 h-4 w-4" />
                            )}
                            Suspend
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
