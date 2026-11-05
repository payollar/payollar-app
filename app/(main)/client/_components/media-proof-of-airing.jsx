"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Radio,
  Tv,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clientCardClass } from "./client-page-shell";

const REPORT_CHECKLIST = [
  {
    id: "schedule",
    label: "Booking schedule and agreed rate version",
    ready: (ctx) => ctx.bookings.length > 0,
  },
  {
    id: "proof",
    label: "Proof of airing & transmission certificates",
    ready: (ctx) => ctx.certificates.length > 0,
  },
  {
    id: "metrics",
    label: "Audience / reach metrics from supported sources",
    ready: () => false,
    pendingLabel: "Not provided",
  },
];

function moneyGhs(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "GH₵ 0";
  return `GH₵ ${n.toLocaleString("en-GH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatFileType(type) {
  if (type?.includes("pdf")) return "PDF";
  if (type?.includes("image")) return "Image";
  return type?.split("/")[1]?.toUpperCase() || "File";
}

function plannedSpots(booking) {
  const slots = Number(booking.slots ?? booking.quantity ?? 0);
  if (Number.isFinite(slots) && slots > 0) return slots;
  return 1;
}

function bookingTitle(booking) {
  return (
    booking.packageName ||
    booking.listing?.name ||
    booking.rateCard?.title ||
    "Media booking"
  );
}

function certsForBooking(certificates, bookingId) {
  return certificates.filter((cert) => cert.bookingId === bookingId);
}

export function MediaProofOfAiring({
  bookings = [],
  certificates = [],
  reports = [],
}) {
  const activeBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        ["PENDING", "CONFIRMED", "COMPLETED"].includes(
          String(booking.status || "").toUpperCase()
        )
      ),
    [bookings]
  );

  const stats = useMemo(() => {
    const planned = activeBookings.reduce(
      (sum, booking) => sum + plannedSpots(booking),
      0
    );
    const verified = certificates.length;
    const spend = activeBookings.reduce(
      (sum, booking) => sum + Number(booking.totalAmount || booking.packagePrice || 0),
      0
    );
    return {
      planned,
      verified,
      pending: Math.max(planned - verified, 0),
      spend,
      reports: reports.length,
    };
  }, [activeBookings, certificates, reports]);

  const checklistCtx = { bookings: activeBookings, certificates, reports };
  const checklistReady = REPORT_CHECKLIST.filter((item) =>
    item.ready(checklistCtx)
  ).length;
  const canGenerate = checklistReady >= 2;

  const flightRows = useMemo(() => {
    const rows = [];
    for (const booking of activeBookings) {
      const related = certsForBooking(certificates, booking.id);
      const spots = plannedSpots(booking);
      for (let index = 0; index < spots; index += 1) {
        const cert = related[index] || null;
        rows.push({
          id: `${booking.id}-${index}`,
          booking,
          spotLabel: `Spot ${String(index + 1).padStart(2, "0")} / ${String(spots).padStart(2, "0")}`,
          cert,
        });
      }
    }
    return rows;
  }, [activeBookings, certificates]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Tv}
          label="Planned airings"
          value={String(stats.planned)}
          hint={`${activeBookings.length} media booking${activeBookings.length === 1 ? "" : "s"}`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Verified airings"
          value={`${stats.verified} / ${Math.max(stats.planned, stats.verified)}`}
          hint={
            stats.verified === 0
              ? "Waiting on station evidence"
              : `${stats.pending} still pending`
          }
          accent={stats.verified > 0 ? "emerald" : "amber"}
        />
        <StatCard
          icon={Wallet}
          label="Booked spend"
          value={moneyGhs(stats.spend)}
          hint="Across confirmed media bookings"
        />
        <StatCard
          icon={FileText}
          label="Agency reports"
          value={String(stats.reports)}
          hint={
            stats.reports > 0
              ? "Narrative reports from stations"
              : "No performance report yet"
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-5">
          <section className={cn(clientCardClass, "overflow-hidden")}>
            <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
              <h2 className="text-base font-semibold text-slate-950">
                Flight calendar & delivery evidence
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                A booked spot is not automatically an aired spot. Stations must supply
                transmission proof before fulfillment counts.
              </p>
            </div>

            {flightRows.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">No media bookings yet</p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
                  When you book TV or radio inventory, planned spots and proof of airing show
                  up here.
                </p>
                <Button asChild variant="black" className="mt-4 rounded-full">
                  <Link href="/products">Browse media inventory</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3 sm:px-5">Spot</th>
                      <th className="px-4 py-3">Booking</th>
                      <th className="px-4 py-3">Scheduled</th>
                      <th className="px-4 py-3">Transmission proof</th>
                      <th className="px-4 py-3 sm:px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {flightRows.map((row) => {
                      const listingType = row.booking.listing?.listingType;
                      const StationIcon = listingType === "RADIO" ? Radio : Tv;
                      const start =
                        row.booking.startDate || row.booking.createdAt || null;
                      return (
                        <tr key={row.id} className="align-top">
                          <td className="px-4 py-3.5 font-medium text-slate-950 sm:px-5">
                            {row.spotLabel}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-start gap-2">
                              <StationIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900">
                                  {bookingTitle(row.booking)}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                  {row.booking.agency?.agencyName || "Media agency"}
                                  {listingType ? ` · ${listingType}` : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            {start ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                {format(new Date(start), "MMM d, yyyy")}
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Awaiting station schedule
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {row.cert ? (
                              <div className="space-y-1">
                                <p className="font-medium text-slate-900">
                                  {row.cert.stationName || "Station proof uploaded"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {row.cert.airDate
                                    ? format(new Date(row.cert.airDate), "MMM d, yyyy")
                                    : "Air date on file"}
                                  {row.cert.airTime ? ` · ${row.cert.airTime}` : ""}
                                </p>
                                {row.cert.fileUrl ? (
                                  <a
                                    href={row.cert.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-950 hover:underline"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    {formatFileType(row.cert.fileType)} proof
                                  </a>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-slate-400">Not uploaded</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 sm:px-5">
                            {row.cert ? (
                              <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-800">
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-800">
                                Pending
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {flightRows.length > 0 ? (
              <div className="border-t border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-950 sm:px-5">
                Station evidence is required before an airing counts as fulfilled on Payollar.
              </div>
            ) : null}
          </section>

          <section className={cn(clientCardClass, "p-4 sm:p-5")}>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Report builder</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Checklist for a media proof-of-airing pack.
                </p>
              </div>
              <p className="text-xs font-medium text-slate-500">
                {checklistReady}/{REPORT_CHECKLIST.length} ready
              </p>
            </div>
            <ul className="mt-4 space-y-2.5">
              {REPORT_CHECKLIST.map((item) => {
                const ready = item.ready(checklistCtx);
                return (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3"
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                          ready
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-white text-slate-400 ring-1 ring-slate-200"
                        )}
                      >
                        {ready ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Clock3 className="h-4 w-4" />
                        )}
                      </span>
                      <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 rounded-full",
                        ready
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : item.pendingLabel
                            ? "border-orange-200 bg-orange-50 text-orange-800"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                      )}
                    >
                      {ready ? "Ready" : item.pendingLabel || "Pending"}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </section>

          {certificates.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    Transmission certificates
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Station-uploaded proof files linked to your bookings.
                  </p>
                </div>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/client/media">Open media library</Link>
                </Button>
              </div>
              <ul className="space-y-2.5">
                {certificates.slice(0, 6).map((cert) => (
                  <li
                    key={cert.id}
                    className={cn(
                      clientCardClass,
                      "flex flex-wrap items-center justify-between gap-3 p-4"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">{cert.fileName}</p>
                      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        {cert.stationName ? <span>{cert.stationName}</span> : null}
                        {cert.airDate ? (
                          <span>
                            Aired {format(new Date(cert.airDate), "MMM d, yyyy")}
                          </span>
                        ) : null}
                        {cert.agency?.agencyName ? (
                          <span>by {cert.agency.agencyName}</span>
                        ) : null}
                      </p>
                    </div>
                    {cert.fileUrl ? (
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="rounded-full">
                          <a href={cert.fileUrl} target="_blank" rel="noreferrer">
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </a>
                        </Button>
                        <Button asChild variant="black" size="sm" className="rounded-full">
                          <a href={cert.fileUrl} download target="_blank" rel="noreferrer">
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        </Button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className={cn(clientCardClass, "p-4 sm:p-5")}>
            <h3 className="text-sm font-semibold text-slate-950">Final report checklist</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                Station name and booking ID
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                Air logs, clips, and certificates
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                Reach when measurable
              </li>
            </ul>
            <Button
              asChild={canGenerate}
              variant="black"
              className="mt-4 w-full rounded-full"
              disabled={!canGenerate}
            >
              {canGenerate ? (
                <Link href="/client/media">Review media library</Link>
              ) : (
                "Generate report when verified"
              )}
            </Button>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              Do not treat pending spots as aired. Wait for station proof before sharing
              fulfillment numbers.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, accent }) {
  return (
    <div
      className={cn(
        clientCardClass,
        "p-4",
        accent === "amber" && "ring-1 ring-amber-200",
        accent === "emerald" && "ring-1 ring-emerald-100"
      )}
    >
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
