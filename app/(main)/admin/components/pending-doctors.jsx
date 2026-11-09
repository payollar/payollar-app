"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Medal,
  FileText,
  ExternalLink,
  Clock3,
  Mail,
  Eye,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { updateDoctorStatus } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
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

function TalentAvatar({ doctor, size = "md" }) {
  const sizeClass = size === "lg" ? "h-20 w-20 sm:h-24 sm:w-24" : "h-12 w-12";
  const textClass = size === "lg" ? "text-2xl sm:text-3xl" : "text-sm";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100",
        sizeClass
      )}
    >
      {doctor.imageUrl ? (
        <Image
          src={doctor.imageUrl}
          alt={doctor.name || "Talent"}
          fill
          className="object-cover"
          sizes={size === "lg" ? "96px" : "48px"}
          unoptimized={doctor.imageUrl?.startsWith("http")}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-950 text-white">
          <span className={cn("font-semibold", textClass)}>
            {(doctor.name || doctor.email || "T").charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

export function PendingDoctors({ doctors }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const {
    loading,
    data,
    fn: submitStatusUpdate,
  } = useFetch(updateDoctorStatus);

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleCloseDialog = () => {
    setSelectedDoctor(null);
  };

  const handleUpdateStatus = async (doctorId, status) => {
    if (loading) return;

    const formData = new FormData();
    formData.append("doctorId", doctorId);
    formData.append("status", status);

    await submitStatusUpdate(formData);
  };

  useEffect(() => {
    if (data?.success) {
      handleCloseDialog();
    }
  }, [data]);

  return (
    <div className="-m-3 min-h-full min-w-0 space-y-4 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:space-y-5 md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-950 md:text-xl">
            Verifications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review talent applications and approve or reject credentials.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <Clock3 className="h-4 w-4 text-amber-600" />
          <span className="font-semibold tabular-nums text-slate-950">
            {doctors.length}
          </span>
          <span>pending</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <section className={cn(PANEL, "p-4")}>
          <p className="text-xs font-medium text-slate-500">In queue</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
            {doctors.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Awaiting review</p>
        </section>
        <section className={cn(PANEL, "p-4")}>
          <p className="text-xs font-medium text-slate-500">With credentials</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
            {doctors.filter((d) => Boolean(d.credentialUrl)).length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Portfolio / docs linked</p>
        </section>
        <section className={cn(PANEL, "p-4")}>
          <p className="text-xs font-medium text-slate-500">Oldest request</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
            {doctors.length
              ? format(
                  new Date(
                    Math.min(...doctors.map((d) => new Date(d.createdAt).getTime()))
                  ),
                  "MMM d"
                )
              : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-400">Submitted date</p>
        </section>
      </div>

      <section className={cn(PANEL, "overflow-hidden")}>
        <div className="border-b border-slate-100 px-4 py-4 md:px-5">
          <h2 className="text-base font-semibold text-slate-950">
            Pending talent verifications
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Open an application to review specialty, experience, and credentials.
          </p>
        </div>

        <div className="p-3 md:p-4">
          {doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-16 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-slate-950">
                Queue is clear
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                No pending verification requests at this time. New talent
                applications will show up here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <article
                  key={doctor.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50/70"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <TalentAvatar doctor={doctor} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-950">
                            {doctor.name || "Unnamed talent"}
                          </h3>
                          <Badge
                            variant="outline"
                            className="rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"
                          >
                            Pending
                          </Badge>
                        </div>
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
                      <p className="mr-auto text-xs text-slate-400 sm:mr-2">
                        Applied {format(new Date(doctor.createdAt), "MMM d, yyyy")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(doctor)}
                        className="h-9 rounded-full border-slate-200 px-3 text-slate-700 hover:bg-slate-100"
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        Review
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedDoctor ? (
        <Dialog open={!!selectedDoctor} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-slate-200 bg-white text-slate-900">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-950 sm:text-xl">
                Talent verification
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Review the creator&apos;s information carefully before making a
                decision.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              <div className="flex flex-col items-center gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start">
                <TalentAvatar doctor={selectedDoctor} size="lg" />
                <div className="min-w-0 text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-slate-950 sm:text-xl">
                    {selectedDoctor.name || "Unnamed talent"}
                  </h3>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {selectedDoctor.email}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Badge
                      variant="outline"
                      className="rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"
                    >
                      Pending
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
                    >
                      Applied {format(new Date(selectedDoctor.createdAt), "PPP")}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4 text-slate-700" />
                  <h3 className="text-sm font-semibold text-slate-950">
                    Professional information
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Specialty</p>
                    <p className="mt-1 text-sm font-medium text-slate-950">
                      {selectedDoctor.specialty || "Not listed"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Experience</p>
                    <p className="mt-1 text-sm font-medium text-slate-950">
                      {formatExperience(selectedDoctor.experience)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                    <p className="text-xs text-slate-500">Credentials</p>
                    {selectedDoctor.credentialUrl ? (
                      <a
                        href={selectedDoctor.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-950 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-950"
                      >
                        View credentials
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        No credentials linked
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-700" />
                  <h3 className="text-sm font-semibold text-slate-950">
                    Service description
                  </h3>
                </div>
                <p className="whitespace-pre-line rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {selectedDoctor.description || "No description provided."}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-950" />
              </div>
            ) : null}

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  handleUpdateStatus(selectedDoctor.id, "REJECTED")
                }
                disabled={loading}
                className="h-10 w-full rounded-full border-rose-200 text-rose-700 hover:bg-rose-50 sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={() =>
                  handleUpdateStatus(selectedDoctor.id, "VERIFIED")
                }
                disabled={loading}
                className="h-10 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 sm:w-auto"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
