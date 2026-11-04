"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, isPast } from "date-fns";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Megaphone,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
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
import { startDeliveryReportFromApplication } from "@/actions/delivery-reports";
import { campaignCategoryLabel } from "@/lib/campaign-categories";
import { campaignPlaceLabel } from "@/lib/campaign-places";
import { cn } from "@/lib/utils";
import { CreatorPageShell, creatorCardClass } from "./creator-page-shell";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "ACCEPTED", label: "Accepted" },
  { id: "REJECTED", label: "Rejected" },
  { id: "REDRAWN", label: "Redrawn" },
];

function asMoney(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatBudget(campaign) {
  if (!campaign) return "Budget not set";
  const min = asMoney(campaign.budgetMin);
  const max = asMoney(campaign.budgetMax);
  if (min != null && max != null) {
    return `GH₵ ${min.toLocaleString("en-GH")} – ${max.toLocaleString("en-GH")}`;
  }
  if (min != null) return `From GH₵ ${min.toLocaleString("en-GH")}`;
  if (max != null) return `Up to GH₵ ${max.toLocaleString("en-GH")}`;
  return "Budget not set";
}

function statusMeta(status) {
  if (status === "ACCEPTED") {
    return {
      label: "Accepted",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }
  if (status === "REJECTED") {
    return {
      label: "Rejected",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      icon: XCircle,
    };
  }
  if (status === "REDRAWN") {
    return {
      label: "Redrawn",
      className: "border-slate-200 bg-slate-100 text-slate-700",
      icon: XCircle,
    };
  }
  return {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
  };
}

function CampaignArt({ title }) {
  const letter = (title || "C").trim().charAt(0).toUpperCase() || "C";
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#4c1d95] to-[#6d28d9]">
      <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-white/15" />
      <div className="absolute bottom-2 left-2.5 text-lg font-semibold text-white/80">
        {letter}
      </div>
    </div>
  );
}

export function CreatorApplications({ applications = [] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startingId, setStartingId] = useState(null);
  const [pending, startTransition] = useTransition();

  const openReport = (application) => {
    if (application.deliveryReport?.id) {
      router.push(`/creator/reports/${application.deliveryReport.id}`);
      return;
    }
    setStartingId(application.id);
    startTransition(async () => {
      try {
        const result = await startDeliveryReportFromApplication(application.id);
        router.push(`/creator/reports/${result.reportId}`);
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Could not open report");
      } finally {
        setStartingId(null);
      }
    });
  };

  const counts = useMemo(() => {
    return applications.reduce(
      (acc, application) => {
        acc.total += 1;
        if (application.status === "PENDING") acc.pending += 1;
        if (application.status === "ACCEPTED") acc.accepted += 1;
        if (application.status === "REJECTED") acc.rejected += 1;
        return acc;
      },
      { total: 0, pending: 0, accepted: 0, rejected: 0 }
    );
  }, [applications]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return applications.filter((application) => {
      const campaign = application.campaign;
      const matchesStatus =
        statusFilter === "all" || application.status === statusFilter;
      const haystack = [
        campaign?.title,
        campaign?.brand,
        campaign?.category,
        application.experience,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [applications, searchQuery, statusFilter]);

  return (
    <CreatorPageShell
      eyebrow="Creator"
      title="Campaigns"
      description="Track every campaign you’ve applied to, and jump back into open briefs."
      actions={
        <Button asChild variant="black" className="rounded-full">
          <Link href="/campaigns">
            <Megaphone className="mr-1.5 h-4 w-4" />
            Browse campaigns
          </Link>
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total",
            value: counts.total,
            tone: "text-slate-900",
            chip: "bg-slate-100 text-slate-600",
          },
          {
            label: "Pending",
            value: counts.pending,
            tone: "text-amber-700",
            chip: "bg-amber-50 text-amber-700",
          },
          {
            label: "Accepted",
            value: counts.accepted,
            tone: "text-emerald-700",
            chip: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Rejected",
            value: counts.rejected,
            tone: "text-rose-700",
            chip: "bg-rose-50 text-rose-700",
          },
        ].map((stat) => (
          <Card key={stat.label} className={cn(creatorCardClass, "border-0")}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {stat.label}
                </p>
                <p className={cn("mt-1 text-2xl font-semibold", stat.tone)}>
                  {stat.value}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  stat.chip
                )}
              >
                {stat.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className={cn(creatorCardClass, "border-0")}>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by campaign, brand, or notes"
              className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((filter) => (
                <SelectItem key={filter.id} value={filter.id}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className={cn(creatorCardClass, "border-0")}>
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff]">
              <FileText className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-950">
              {applications.length === 0
                ? "No applications yet"
                : "No matching applications"}
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              {applications.length === 0
                ? "When you apply to a campaign, it will show up here with its review status."
                : "Try another search or status filter."}
            </p>
            {applications.length === 0 ? (
              <Button
                asChild
                variant="black"
                className="mt-5 rounded-full"
              >
                <Link href="/campaigns">
                  Find campaigns to apply
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((application) => {
            const campaign = application.campaign;
            const status = statusMeta(application.status);
            const StatusIcon = status.icon;
            const closed =
              !campaign ||
              campaign.status !== "ACTIVE" ||
              isPast(new Date(campaign.deadline));

            return (
              <li key={application.id}>
                <Card className={cn(creatorCardClass, "border-0 overflow-hidden")}>
                  <CardContent className="p-0">
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
                      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-36">
                        {campaign?.imageUrl ? (
                          <Image
                            src={campaign.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="144px"
                          />
                        ) : (
                          <CampaignArt
                            title={campaign?.brand || campaign?.title || "C"}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-500">
                              {campaign?.brand || "Brand"}
                            </p>
                            <h3 className="truncate text-lg font-semibold text-slate-950">
                              {campaign?.title || "Campaign unavailable"}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {campaign?.category ? (
                                <Badge
                                  variant="secondary"
                                  className="rounded-full bg-slate-100 text-slate-600"
                                >
                                  {campaignCategoryLabel(campaign)}
                                </Badge>
                              ) : null}
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
                              {closed ? (
                                <Badge
                                  variant="outline"
                                  className="rounded-full border-slate-200 bg-slate-50 text-slate-500"
                                >
                                  Campaign closed
                                </Badge>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-wrap gap-2">
                            {application.status === "ACCEPTED" ? (
                              <Button
                                type="button"
                                variant="black"
                                size="sm"
                                className="rounded-full"
                                disabled={pending && startingId === application.id}
                                onClick={() => openReport(application)}
                              >
                                {pending && startingId === application.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <ClipboardList className="h-3.5 w-3.5" />
                                    {application.deliveryReport?.id
                                      ? "Open report"
                                      : "Delivery report"}
                                  </>
                                )}
                              </Button>
                            ) : null}
                            {campaign?.id ? (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                              >
                                <Link href={`/campaigns/${campaign.id}`}>
                                  View campaign
                                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Applied {format(new Date(application.createdAt), "MMM d, yyyy")}
                          </span>
                          {campaign?.deadline ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 className="h-3.5 w-3.5" />
                              Deadline{" "}
                              {format(new Date(campaign.deadline), "MMM d, yyyy")}
                            </span>
                          ) : null}
                          {campaign ? (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {campaignPlaceLabel(campaign)}
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1.5">
                            <Wallet className="h-3.5 w-3.5" />
                            {application.rate != null
                              ? `Your rate GH₵ ${Number(application.rate).toLocaleString("en-GH")}`
                              : formatBudget(campaign)}
                          </span>
                        </div>

                        {application.experience ? (
                          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                            {application.experience}
                          </p>
                        ) : null}

                        {application.portfolio ? (
                          <p className="mt-2 truncate text-xs text-slate-500">
                            Portfolio: {application.portfolio}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </CreatorPageShell>
  );
}
