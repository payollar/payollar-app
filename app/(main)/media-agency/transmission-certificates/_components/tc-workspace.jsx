"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransmissionCertificateForm } from "./tc-upload-form";
import { TransmissionCertificatesList } from "./tc-list";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

export function TransmissionCertificatesWorkspace({
  mediaAgencyId,
  availableBookings = [],
  certificates = [],
}) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams?.get("bookingId")) {
      setOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {certificates.length} certificate
          {certificates.length === 1 ? "" : "s"}
          {availableBookings.length
            ? ` · ${availableBookings.length} booking${
                availableBookings.length === 1 ? "" : "s"
              } available to link`
            : ""}
        </p>
        <Button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "h-10 rounded-full px-5 text-sm font-semibold shadow-none",
            open
              ? "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              : "bg-[#0055ff] text-white hover:bg-[#003ecc]"
          )}
        >
          {open ? (
            <>
              <ChevronDown className="mr-1.5 h-4 w-4 rotate-180" />
              Hide form
            </>
          ) : (
            <>
              <Upload className="mr-1.5 h-4 w-4" />
              Upload certificate
            </>
          )}
        </Button>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              DASHBOARD_CARD_CLASS,
              "mb-5 p-5 md:p-6",
              open ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-950">
                New certificate
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                PDF or image proof of airtime — link a booking when you can.
              </p>
            </div>
            <TransmissionCertificateForm
              mediaAgencyId={mediaAgencyId}
              availableBookings={availableBookings}
              onCancel={() => setOpen(false)}
              onCreated={() => setOpen(false)}
            />
          </div>
        </div>
      </div>

      <TransmissionCertificatesList
        certificates={certificates}
        onUploadClick={() => setOpen(true)}
      />
    </div>
  );
}
