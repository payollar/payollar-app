"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, isPast } from "date-fns";
import {
  ArrowRight,
  ArrowUpRight,
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
  Sparkles,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const TABS = [
  { id: "open", label: "Open campaigns" },
  { id: "mine", label: "My applications" },
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
    <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_10%_0%,rgba(0,85,255,0.35),transparent_55%),linear-gradient(145deg,#0f172a,#1e293b_48%,#312e81)]">
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10" />
      <div className="absolute bottom-3 left-3 text-xl font-semibold text-white/85">
        {letter}
      </div>
    </div>
  );
}

function CampaignCover({ campaign, className, sizes = "(max-width: 768px) 100vw, 280px" }) {
  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      {campaign?.imageUrl ? (
        <Image
          src={campaign.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes={sizes}
        />
      ) : (
        <CampaignArt title={campaign?.brand || campaign?.title || "C"} />
      )}
    </div>
  );
}

export function CreatorApplications({
  applications = [],
  openCampaigns = [],
}) {
  const router = useRouter();
  const [tab, setTab] = useState(applications.length === 0 ? "open" : "mine");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startingId, setStartingId] = useState(null);
  const [pending, startTransition] = useTransition();

  const appliedIds = useMemo(
    () => new Set(applications.map((app) => app.campaignId || app.campaign?.id).filter(Boolean)),
    [applications]
  );

  const discoverCampaigns = useMemo(() => {
    return openCampaigns.filter((campaign) => {
      if (!campaign?.id) return false;
      if (appliedIds.has(campaign.id)) return false;
      if (campaign.deadline && isPast(new Date(campaign.deadline))) return false;
      return true;
    });
  }, [openCampaigns, appliedIds]);

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

  const filteredApplications = useMemo(() => {
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
      return matchesStatus && (!query || haystack.includes(query));
    });
  }, [applications, searchQuery, statusFilter]);

  const filteredOpen = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return discoverCampaigns;
    return discoverCampaigns.filter((campaign) => {
      const haystack = [campaign.title, campaign.brand, campaign.category, campaign.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [discoverCampaigns, searchQuery]);

  return (
    <CreatorPageShell
      eyebrow="Creator"
      title="Campaigns"
      description="Browse open briefs and track every campaign you’ve applied to."
      actions={
        <Button asChild variant="black" className="rounded-full">
          <Link href="/campaigns">
            <Megaphone className="mr-1.5 h-4 w-4" />
            Browse all
          </Link>
        </Button>
      }
    >
      <div className="space-y-5">
        <div className={`${creatorCardClass} grid grid-cols-2 overflow-hidden lg:grid-cols-5`}>
          {[
            {
              label: "Open now",
              value: discoverCampaigns.length,
              tone: "text-[#0055ff]",
              hint: "Ready to apply",
            },
            {
              label: "Applied",
              value: counts.total,
              tone: "text-slate-950",
              hint: "Your pipeline",
            },
            {
              label: "Pending",
              value: counts.pending,
              tone: "text-amber-700",
              hint: "Awaiting review",
            },
            {
              label: "Accepted",
              value: counts.accepted,
              tone: "text-emerald-700",
              hint: "You’re in",
            },
            {
              label: "Rejected",
              value: counts.rejected,
              tone: "text-rose-700",
              hint: "Closed out",
              className: "hidden lg:block",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "border-b border-slate-100 px-4 py-4 sm:border-r sm:last:border-r-0 lg:border-b-0",
                stat.className
              )}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p className={cn("mt-1 text-2xl font-semibold tabular-nums", stat.tone)}>
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{stat.hint}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            {TABS.map((item) => {
              const count =
                item.id === "open" ? discoverCampaigns.length : applications.length;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition",
                    tab === item.id
                      ? "bg-slate-950 text-white"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                      tab === item.id ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={
                  tab === "open"
                    ? "Search open campaigns"
                    : "Search your applications"
                }
                className="h-10 rounded-full border-slate-200 bg-white pl-9 shadow-sm"
              />
            </div>
            {tab === "mine" ? (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full rounded-full border-slate-200 bg-white shadow-sm sm:w-40">
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
            ) : null}
          </div>
        </div>

        {tab === "open" ? (
          filteredOpen.length === 0 ? (
            <EmptyPanel
              icon={Sparkles}
              title={
                discoverCampaigns.length === 0
                  ? "No open campaigns right now"
                  : "No matching campaigns"
              }
              description={
                discoverCampaigns.length === 0
                  ? "Check back soon, or browse the full marketplace for new briefs."
                  : "Try another search term."
              }
              action={
                <Button asChild variant="black" className="rounded-full">
                  <Link href="/campaigns">
                    Browse marketplace
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,240px))] gap-3">
              {filteredOpen.slice(0, 12).map((campaign) => (
                <OpenCampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )
        ) : filteredApplications.length === 0 ? (
          <EmptyPanel
            icon={FileText}
            title={
              applications.length === 0
                ? "No applications yet"
                : "No matching applications"
            }
            description={
              applications.length === 0
                ? "Apply to an open campaign and it will show up here with its review status."
                : "Try another search or status filter."
            }
            action={
              applications.length === 0 ? (
                <Button
                  type="button"
                  variant="black"
                  className="rounded-full"
                  onClick={() => setTab("open")}
                >
                  View open campaigns
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : null
            }
          />
        ) : (
          <ul className="space-y-3">
            {filteredApplications.map((application) => (
              <ApplicationRow
                key={application.id}
                application={application}
                pending={pending}
                startingId={startingId}
                onOpenReport={openReport}
              />
            ))}
          </ul>
        )}
      </div>
    </CreatorPageShell>
  );
}

function EmptyPanel({ icon: Icon, title, description, action }) {
  return (
    <div className={cn(creatorCardClass, "flex flex-col items-center px-6 py-16 text-center")}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff]">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

function OpenCampaignCard({ campaign }) {
  return (
    <article
      className={cn(
        creatorCardClass,
        "group flex h-full flex-col overflow-hidden border-0 transition hover:shadow-md"
      )}
    >
      <CampaignCover
        campaign={campaign}
        className="aspect-[16/9] w-full shrink-0"
        sizes="240px"
      />
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {campaign.brand || "Brand"}
            </p>
            <h3 className="mt-0.5 min-h-[2.5rem] line-clamp-2 text-sm font-semibold leading-snug text-slate-950">
              {campaign.title}
            </h3>
          </div>
          <Link
            href={`/campaigns/${campaign.id}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition group-hover:border-[#0055ff]/30 group-hover:text-[#0055ff]"
            aria-label={`Open ${campaign.title}`}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-2 flex min-h-[22px] items-center gap-1 overflow-hidden">
          {campaign.category ? (
            <Badge className="max-w-[70%] truncate rounded-full border-0 bg-slate-100 px-2 py-0 text-[10px] font-medium text-slate-600">
              {campaignCategoryLabel(campaign)}
            </Badge>
          ) : null}
          <Badge className="shrink-0 rounded-full border-0 bg-emerald-50 px-2 py-0 text-[10px] font-medium text-emerald-700">
            Open
          </Badge>
        </div>

        <div className="mt-2 space-y-1 text-[11px] text-slate-500">
          <p className="flex items-center gap-1 truncate">
            <Wallet className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="truncate">{formatBudget(campaign)}</span>
          </p>
          <p className="flex items-center gap-1 truncate">
            <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="truncate">
              {campaign.deadline
                ? `Apply by ${format(new Date(campaign.deadline), "MMM d, yyyy")}`
                : "No deadline"}
            </span>
          </p>
          <p className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="truncate">{campaignPlaceLabel(campaign)}</span>
          </p>
        </div>

        <div className="mt-auto pt-3">
          <Button
            asChild
            size="sm"
            className="h-8 w-full rounded-full bg-[#0055ff] text-xs text-white hover:bg-[#0046d4]"
          >
            <Link href={`/campaigns/${campaign.id}`}>
              View & apply
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function ApplicationRow({ application, pending, startingId, onOpenReport }) {
  const campaign = application.campaign;
  const status = statusMeta(application.status);
  const StatusIcon = status.icon;
  const closed =
    !campaign ||
    campaign.status !== "ACTIVE" ||
    (campaign.deadline ? isPast(new Date(campaign.deadline)) : false);

  return (
    <li className={cn(creatorCardClass, "overflow-hidden border-0")}>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:p-4">
        <CampaignCover
          campaign={campaign}
          className="h-36 w-full shrink-0 rounded-xl sm:h-auto sm:w-40"
        />

        <div className="flex min-w-0 flex-1 flex-col">
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
                  <Badge className="rounded-full border-0 bg-slate-100 text-slate-600">
                    {campaignCategoryLabel(campaign)}
                  </Badge>
                ) : null}
                <Badge
                  variant="outline"
                  className={cn("gap-1 rounded-full font-medium", status.className)}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </Badge>
                {closed ? (
                  <Badge className="rounded-full border-0 bg-slate-100 text-slate-500">
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
                  onClick={() => onOpenReport(application)}
                >
                  {pending && startingId === application.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <ClipboardList className="h-3.5 w-3.5" />
                      {application.deliveryReport?.id ? "Open report" : "Delivery report"}
                    </>
                  )}
                </Button>
              ) : null}
              {campaign?.id ? (
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={`/campaigns/${campaign.id}`}>
                    View
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
                Deadline {format(new Date(campaign.deadline), "MMM d, yyyy")}
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
        </div>
      </div>
    </li>
  );
}
