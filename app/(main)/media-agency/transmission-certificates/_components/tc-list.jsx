"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  ImageIcon,
  Link2,
  Plus,
  Radio,
  Tv,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";

function formatFileType(type) {
  if (type?.includes("pdf")) return "PDF";
  if (type?.includes("image")) return "Image";
  return type?.split("/")[1]?.toUpperCase() || "File";
}

function formatFileSize(bytes) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isTvStation(name = "") {
  const n = name.toLowerCase();
  return n.includes("tv") || n.includes("television") || n.includes("channel");
}

function CertificateCard({ cert }) {
  const isPdf = cert.fileType?.includes("pdf");
  const sizeLabel = formatFileSize(cert.fileSize);

  return (
    <div className="rounded-2xl border border-slate-100 bg-[#f7f8fc]/80 p-4 transition hover:border-slate-200 hover:bg-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#0055ff] shadow-sm ring-1 ring-slate-100">
            {isPdf ? (
              <FileText className="h-5 w-5" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-sm font-semibold text-slate-950">
                {cert.fileName || "Certificate"}
              </h4>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {formatFileType(cert.fileType)}
              </span>
              {sizeLabel ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  {sizeLabel}
                </span>
              ) : null}
              {cert.bookingId ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f0ff] px-2 py-0.5 text-[11px] font-semibold text-[#0b3db8]">
                  <Link2 className="h-3 w-3" />
                  Linked
                </span>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {format(new Date(cert.airDate), "d MMM yyyy")}
              </span>
              {cert.airTime ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {cert.airTime}
                </span>
              ) : null}
              {cert.stationName ? (
                <span className="inline-flex items-center gap-1">
                  {isTvStation(cert.stationName) ? (
                    <Tv className="h-3.5 w-3.5" />
                  ) : (
                    <Radio className="h-3.5 w-3.5" />
                  )}
                  {cert.stationName}
                </span>
              ) : null}
            </div>

            <p className="mt-2 font-mono text-[11px] text-slate-400">
              {cert.campaignRefId}
            </p>
            {cert.notes ? (
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                {cert.notes}
              </p>
            ) : null}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-9 shrink-0 rounded-full border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50"
        >
          <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            View
          </a>
        </Button>
      </div>
    </div>
  );
}

export function TransmissionCertificatesList({
  certificates = [],
  onUploadClick,
}) {
  const stats = useMemo(() => {
    let linked = 0;
    let pdf = 0;
    for (const cert of certificates) {
      if (cert.bookingId) linked += 1;
      if (cert.fileType?.includes("pdf")) pdf += 1;
    }
    return { total: certificates.length, linked, pdf };
  }, [certificates]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-xs text-slate-500">Total</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-slate-950">
            {stats.total}
          </p>
        </div>
        <div className="rounded-2xl border border-white bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-xs text-slate-500">Linked</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-slate-950">
            {stats.linked}
          </p>
        </div>
        <div className="rounded-2xl border border-white bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-xs text-slate-500">PDFs</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-slate-950">
            {stats.pdf}
          </p>
        </div>
      </div>

      <div className={cn(DASHBOARD_CARD_CLASS, "overflow-hidden")}>
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-950">
            Uploaded certificates
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Proof of airtime for clients and campaigns
          </p>
        </div>

        <div className="p-4 sm:p-5">
          {certificates.length === 0 ? (
            <div className="flex min-h-[14rem] flex-col items-center justify-center rounded-2xl bg-[#f7f8fc] px-6 py-10 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100">
                <FileText className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-slate-800">
                No certificates yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Upload a PDF or image that confirms when and where the spot aired.
              </p>
              {onUploadClick ? (
                <Button
                  type="button"
                  onClick={onUploadClick}
                  className="mt-4 h-10 rounded-full bg-[#0055ff] px-5 text-sm font-semibold text-white hover:bg-[#003ecc]"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Upload certificate
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2.5">
              {certificates.map((cert) => (
                <CertificateCard key={cert.id} cert={cert} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
