"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  FolderOpen,
  MapPin,
  Radio,
  Search,
  Tv,
  TrendingUp,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ClientPageShell, clientCardClass } from "./client-page-shell";

const TABS = [
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "certificates", label: "Certificates", icon: FileText },
];

function formatFileType(type) {
  if (type?.includes("pdf")) return "PDF";
  if (type?.includes("image")) return "Image";
  return type?.split("/")[1]?.toUpperCase() || "File";
}

function formatFileSize(bytes) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusMeta(status) {
  if (status === "CONFIRMED") {
    return {
      label: "Confirmed",
      className: "border-sky-200 bg-sky-50 text-sky-700",
      icon: CheckCircle2,
    };
  }
  if (status === "COMPLETED") {
    return {
      label: "Completed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }
  if (status === "CANCELLED") {
    return {
      label: "Cancelled",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      icon: XCircle,
    };
  }
  return {
    label: status || "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: AlertCircle,
  };
}

function mediaTypeIcon(type) {
  if (type === "TV") return Tv;
  if (type === "RADIO") return Radio;
  return FolderOpen;
}

function StatCard({ label, value, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-slate-100 text-slate-950",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <Card className={cn(clientCardClass, "border-0")}>
      <CardContent className="flex items-center justify-between p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950 sm:text-3xl">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            tones[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}) {
  return (
    <Card className={cn(clientCardClass, "border-0")}>
      <CardContent className="flex flex-col items-center px-6 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-950">
          <Icon className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
          {description}
        </p>
        {actionLabel && actionHref ? (
          <Button
            asChild
            className="mt-6 rounded-full bg-slate-950 hover:bg-slate-800"
          >
            <Link href={actionHref}>
              {actionLabel}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FilterBar({
  searchQuery,
  setSearchQuery,
  searchPlaceholder,
  statusFilter,
  setStatusFilter,
  mediaTypeFilter,
  setMediaTypeFilter,
  showStatus = false,
  showMediaType = false,
}) {
  return (
    <Card className={cn(clientCardClass, "border-0")}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9"
          />
        </div>
        {showStatus ? (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        ) : null}
        {showMediaType ? (
          <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
            <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white sm:w-44">
              <SelectValue placeholder="Media type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="TV">TV</SelectItem>
              <SelectItem value="RADIO">Radio</SelectItem>
              <SelectItem value="BILLBOARD">Billboard</SelectItem>
              <SelectItem value="DIGITAL">Digital</SelectItem>
            </SelectContent>
          </Select>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function MediaLibrary({
  bookings = [],
  certificates = [],
  reports = [],
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("bookings");

  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(
      (booking) =>
        booking.status === "CONFIRMED" &&
        new Date(booking.endDate || booking.startDate || Date.now()) >= new Date()
    ).length;
    const completedBookings = bookings.filter(
      (booking) => booking.status === "COMPLETED"
    ).length;

    return {
      totalBookings,
      activeBookings,
      completedBookings,
      totalCertificates: certificates.length,
      totalReports: reports.length,
    };
  }, [bookings, certificates, reports]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        searchQuery === "" ||
        booking.listing?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.agency?.agencyName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.packageName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      const matchesMediaType =
        mediaTypeFilter === "all" ||
        booking.listing?.listingType === mediaTypeFilter;

      return matchesSearch && matchesStatus && matchesMediaType;
    });
  }, [bookings, searchQuery, statusFilter, mediaTypeFilter]);

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        searchQuery === "" ||
        cert.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.agency?.agencyName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        cert.campaignRefId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.fileName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMediaType =
        mediaTypeFilter === "all" ||
        (mediaTypeFilter === "TV" &&
          (cert.stationName?.toLowerCase().includes("tv") ||
            cert.stationName?.toLowerCase().includes("television"))) ||
        (mediaTypeFilter === "RADIO" &&
          cert.stationName?.toLowerCase().includes("radio"));

      return matchesSearch && matchesMediaType;
    });
  }, [certificates, searchQuery, mediaTypeFilter]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      return (
        searchQuery === "" ||
        report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.agency?.agencyName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        report.reportType?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [reports, searchQuery]);

  const tabCounts = {
    bookings: bookings.length,
    reports: reports.length,
    certificates: certificates.length,
  };

  return (
    <ClientPageShell
      eyebrow="Library"
      title="Media Library"
      description="Track media bookings, campaign reports, and transmission certificates in one place."
      actions={
        <Button asChild className="rounded-full bg-slate-950 hover:bg-slate-800">
          <Link href="/products">
            Browse media
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total bookings"
            value={stats.totalBookings}
            icon={Calendar}
            tone="blue"
          />
          <StatCard
            label="Active"
            value={stats.activeBookings}
            icon={TrendingUp}
            tone="amber"
          />
          <StatCard
            label="Completed"
            value={stats.completedBookings}
            icon={CheckCircle2}
            tone="emerald"
          />
          <StatCard
            label="Certificates"
            value={stats.totalCertificates}
            icon={FileText}
            tone="violet"
          />
          <StatCard
            label="Reports"
            value={stats.totalReports}
            icon={BarChart3}
            tone="slate"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery("");
                    setStatusFilter("all");
                    setMediaTypeFilter("all");
                  }}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-slate-950 text-white shadow-md shadow-slate-900/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {tabCounts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "bookings" ? (
          <div className="space-y-4">
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchPlaceholder="Search bookings, agencies, or packages"
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              mediaTypeFilter={mediaTypeFilter}
              setMediaTypeFilter={setMediaTypeFilter}
              showStatus
              showMediaType
            />

            {filteredBookings.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={bookings.length === 0 ? "No bookings yet" : "No matching bookings"}
                description={
                  bookings.length === 0
                    ? "Book TV, radio, digital, or outdoor media and everything will show up here."
                    : "Try another search or clear your filters."
                }
                actionLabel={bookings.length === 0 ? "Browse media services" : null}
                actionHref={bookings.length === 0 ? "/products" : null}
              />
            ) : (
              <ul className="space-y-3">
                {filteredBookings.map((booking) => {
                  const status = statusMeta(booking.status);
                  const StatusIcon = status.icon;
                  const MediaIcon = mediaTypeIcon(booking.listing?.listingType);
                  const relatedCerts = certificates.filter(
                    (cert) => cert.bookingId === booking.id
                  );
                  const relatedReports = reports.filter(
                    (report) => report.bookingId === booking.id
                  );

                  return (
                    <li key={booking.id}>
                      <Card className={cn(clientCardClass, "border-0 overflow-hidden")}>
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-24 sm:w-36">
                              {booking.listing?.imageUrl ? (
                                <Image
                                  src={booking.listing.imageUrl}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="144px"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                                  <MediaIcon className="h-8 w-8" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="truncate text-lg font-semibold text-slate-950">
                                      {booking.listing?.name || "Media listing"}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "rounded-full gap-1 font-medium",
                                        status.className
                                      )}
                                    >
                                      <StatusIcon className="h-3.5 w-3.5" />
                                      {status.label}
                                    </Badge>
                                    {booking.listing?.listingType ? (
                                      <Badge
                                        variant="secondary"
                                        className="rounded-full bg-slate-100 text-slate-600"
                                      >
                                        {booking.listing.listingType}
                                      </Badge>
                                    ) : null}
                                  </div>
                                  <p className="mt-1 text-sm text-slate-500">
                                    {booking.agency?.agencyName || "Media agency"}
                                    {booking.packageName
                                      ? ` · ${booking.packageName}`
                                      : ""}
                                  </p>
                                </div>
                                {booking.totalAmount != null ? (
                                  <p className="text-lg font-semibold tabular-nums text-slate-950">
                                    ₵{Number(booking.totalAmount).toLocaleString()}
                                  </p>
                                ) : null}
                              </div>

                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                                {booking.listing?.location ? (
                                  <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {booking.listing.location}
                                  </span>
                                ) : null}
                                {booking.startDate ? (
                                  <span className="inline-flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(new Date(booking.startDate), "MMM d, yyyy")}
                                    {booking.endDate
                                      ? ` – ${format(new Date(booking.endDate), "MMM d, yyyy")}`
                                      : ""}
                                  </span>
                                ) : null}
                                {booking.duration ? (
                                  <span className="inline-flex items-center gap-1.5">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {booking.duration}
                                  </span>
                                ) : null}
                                {booking.slots ? (
                                  <span>{booking.slots} spots</span>
                                ) : null}
                              </div>

                              {(relatedCerts.length > 0 || relatedReports.length > 0) && (
                                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                                  {relatedCerts.length > 0 ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-950">
                                      <FileText className="h-3.5 w-3.5" />
                                      {relatedCerts.length} certificate
                                      {relatedCerts.length === 1 ? "" : "s"}
                                    </span>
                                  ) : null}
                                  {relatedReports.length > 0 ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                      <BarChart3 className="h-3.5 w-3.5" />
                                      {relatedReports.length} report
                                      {relatedReports.length === 1 ? "" : "s"}
                                    </span>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}

        {activeTab === "reports" ? (
          <div className="space-y-4">
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchPlaceholder="Search reports by title, agency, or type"
            />

            {filteredReports.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title={reports.length === 0 ? "No reports yet" : "No matching reports"}
                description={
                  reports.length === 0
                    ? "Campaign performance reports shared by media agencies will appear here."
                    : "Try another search term."
                }
              />
            ) : (
              <ul className="space-y-3">
                {filteredReports.map((report) => (
                  <li key={report.id}>
                    <Card className={cn(clientCardClass, "border-0")}>
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-950">
                                {report.title}
                              </h3>
                              {report.reportType ? (
                                <Badge
                                  variant="secondary"
                                  className="rounded-full bg-slate-100 text-slate-600"
                                >
                                  {report.reportType}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                              {report.agency?.agencyName || "Media agency"}
                            </p>
                          </div>
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-950">
                            <BarChart3 className="h-4 w-4" />
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                          {report.startDate && report.endDate ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(report.startDate), "MMM d, yyyy")} –{" "}
                              {format(new Date(report.endDate), "MMM d, yyyy")}
                            </span>
                          ) : null}
                          {report.createdAt ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 className="h-3.5 w-3.5" />
                              Shared{" "}
                              {format(new Date(report.createdAt), "MMM d, yyyy")}
                            </span>
                          ) : null}
                        </div>

                        {report.content ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                            {report.content}
                          </p>
                        ) : null}

                        {report.metrics && Object.keys(report.metrics).length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {Object.entries(report.metrics)
                              .slice(0, 6)
                              .map(([key, value]) => (
                                <span
                                  key={key}
                                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                                >
                                  {key}: {String(value)}
                                </span>
                              ))}
                            {Object.keys(report.metrics).length > 6 ? (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                +{Object.keys(report.metrics).length - 6} more
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {activeTab === "certificates" ? (
          <div className="space-y-4">
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchPlaceholder="Search certificates, stations, or campaign IDs"
              mediaTypeFilter={mediaTypeFilter}
              setMediaTypeFilter={setMediaTypeFilter}
              showMediaType
            />

            {filteredCertificates.length === 0 ? (
              <EmptyState
                icon={FileText}
                title={
                  certificates.length === 0
                    ? "No certificates yet"
                    : "No matching certificates"
                }
                description={
                  certificates.length === 0
                    ? "Transmission certificates uploaded by agencies after your ads air will show up here."
                    : "Try another search or media type filter."
                }
              />
            ) : (
              <ul className="space-y-3">
                {filteredCertificates.map((cert) => {
                  const isTV =
                    cert.stationName?.toLowerCase().includes("tv") ||
                    cert.stationName?.toLowerCase().includes("television");
                  const StationIcon = isTV ? Tv : Radio;

                  return (
                    <li key={cert.id}>
                      <Card className={cn(clientCardClass, "border-0")}>
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 flex-1 gap-3">
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-950">
                                {cert.fileType?.includes("pdf") ? (
                                  <FileText className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="truncate text-base font-semibold text-slate-950">
                                    {cert.fileName}
                                  </h3>
                                  <Badge
                                    variant="secondary"
                                    className="rounded-full bg-slate-100 text-slate-600"
                                  >
                                    {formatFileType(cert.fileType)}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="rounded-full border-slate-200 text-slate-500"
                                  >
                                    {formatFileSize(cert.fileSize)}
                                  </Badge>
                                </div>

                                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                                  {cert.airDate ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <Calendar className="h-3.5 w-3.5" />
                                      Aired{" "}
                                      {format(new Date(cert.airDate), "MMM d, yyyy")}
                                    </span>
                                  ) : null}
                                  {cert.airTime ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <Clock3 className="h-3.5 w-3.5" />
                                      {cert.airTime}
                                    </span>
                                  ) : null}
                                  {cert.stationName ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <StationIcon className="h-3.5 w-3.5" />
                                      {cert.stationName}
                                    </span>
                                  ) : null}
                                  {cert.campaignRefId ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <FileText className="h-3.5 w-3.5" />
                                      <span className="font-mono">
                                        {cert.campaignRefId}
                                      </span>
                                    </span>
                                  ) : null}
                                </div>

                                {cert.notes ? (
                                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                    {cert.notes}
                                  </p>
                                ) : null}

                                <p className="mt-2 text-xs text-slate-400">
                                  Uploaded{" "}
                                  {format(new Date(cert.createdAt), "MMM d, yyyy")}
                                  {cert.agency?.agencyName
                                    ? ` by ${cert.agency.agencyName}`
                                    : ""}
                                </p>
                              </div>
                            </div>

                            {cert.fileUrl ? (
                              <Button
                                asChild
                                variant="outline"
                                className="shrink-0 rounded-full border-slate-200"
                              >
                                <a
                                  href={cert.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="mr-1.5 h-4 w-4" />
                                  View
                                </a>
                              </Button>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </ClientPageShell>
  );
}
