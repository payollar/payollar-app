"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  DollarSign,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  redrawCampaignApplication,
  updateApplicationStatus,
} from "@/actions/campaigns";
import { startCampaignApplicationChat } from "@/actions/booking-chat";
import { cn } from "@/lib/utils";
import { ClientPageShell, clientCardClass } from "./client-page-shell";
import { MediaAgencyPageShell } from "@/app/(main)/media-agency/_components/media-agency-page-shell";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { campaignCategoryLabel } from "@/lib/campaign-categories";
import { campaignPlaceLabel } from "@/lib/campaign-places";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "PENDING", label: "Pending", tone: "amber" },
  { id: "ACCEPTED", label: "Accepted", tone: "emerald" },
  { id: "REJECTED", label: "Rejected", tone: "rose" },
  { id: "REDRAWN", label: "Redrawn", tone: "slate" },
];

const STATUS_META = {
  PENDING: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  REJECTED: {
    label: "Rejected",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
  REDRAWN: {
    label: "Redrawn",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

function money(n) {
  const value = Number(n);
  if (!Number.isFinite(value)) return null;
  return `₵${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function budgetLabel(campaign) {
  if (campaign.budgetMin && campaign.budgetMax) {
    return `${money(campaign.budgetMin)} – ${money(campaign.budgetMax)}`;
  }
  if (campaign.budgetMin) return `${money(campaign.budgetMin)}+`;
  if (campaign.budgetMax) return `Up to ${money(campaign.budgetMax)}`;
  return null;
}

function talentProfileHref(talent, { book = false, campaignTitle } = {}) {
  if (!talent?.id) return null;
  const base = `/talents/${encodeURIComponent(talent.specialty || "all")}/${talent.id}`;
  if (!book) return base;
  const params = new URLSearchParams();
  if (campaignTitle) params.set("campaign", campaignTitle);
  const qs = params.toString();
  return `${base}${qs ? `?${qs}` : ""}#booking-section`;
}

function messageHref({ email, campaignTitle, applicantName }) {
  if (!email) return null;
  const subject = encodeURIComponent(`Re: ${campaignTitle || "your campaign application"}`);
  const body = encodeURIComponent(
    `Hi ${applicantName || "there"},\n\nThanks for applying to ${campaignTitle || "our campaign"}. `
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

function whatsappHref({ phone, campaignTitle, applicantName }) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return null;
  const text = encodeURIComponent(
    `Hi ${applicantName || "there"}, thanks for applying to ${campaignTitle || "our campaign"} on Payollar.`
  );
  return `https://wa.me/${digits}?text=${text}`;
}

export function CampaignApplications({ campaign, variant = "client" }) {
  const router = useRouter();
  const isMediaAgency = variant === "media-agency";
  const backHref = isMediaAgency ? "/media-agency/campaigns" : "/client/campaigns";
  const cardClass = isMediaAgency ? DASHBOARD_CARD_CLASS : clientCardClass;

  const [applications, setApplications] = useState(campaign?.applications || []);
  const [updatingId, setUpdatingId] = useState(null);
  const [messagingId, setMessagingId] = useState(null);
  const [redrawId, setRedrawId] = useState(null);
  const [redrawNote, setRedrawNote] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const apps = campaign?.applications || [];
    setApplications(apps);
    const pending = apps.filter((a) => a.status === "PENDING").length;
    const accepted = apps.filter((a) => a.status === "ACCEPTED").length;
    setFilter(pending > 0 ? "PENDING" : accepted > 0 ? "ACCEPTED" : "all");
    setExpandedId(null);
    setRedrawId(null);
    setRedrawNote("");
  }, [campaign]);

  const counts = useMemo(() => {
    const next = { PENDING: 0, ACCEPTED: 0, REJECTED: 0, REDRAWN: 0 };
    for (const app of applications) {
      if (next[app.status] != null) next[app.status] += 1;
    }
    return next;
  }, [applications]);

  const filtered = useMemo(() => {
    if (filter === "all") return applications;
    return applications.filter((app) => app.status === filter);
  }, [applications, filter]);

  const handleApplicationStatus = async (applicationId, status) => {
    setUpdatingId(applicationId);
    try {
      const formData = new FormData();
      formData.append("applicationId", applicationId);
      formData.append("status", status);

      const result = await updateApplicationStatus(formData);

      if (result?.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
        );
        toast.success(
          status === "ACCEPTED"
            ? "Accepted — message or pay the creator next"
            : "Application rejected"
        );
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update application status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMessageApplicant = async (applicationId) => {
    setMessagingId(applicationId);
    try {
      const result = await startCampaignApplicationChat(applicationId);
      if (result?.code === "UNAUTHENTICATED") {
        toast.error(result.error || "Sign in to message this creator.");
        router.push(
          `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`
        );
        return;
      }
      if (result?.error || !result?.appointmentId) {
        toast.error(result?.error || "Could not open the chat.");
        return;
      }
      router.push(`/messages/${result.appointmentId}`);
    } catch (error) {
      toast.error(error.message || "Could not open the chat.");
    } finally {
      setMessagingId(null);
    }
  };

  const handleRedrawApplicant = async (applicationId) => {
    setUpdatingId(applicationId);
    try {
      const result = await redrawCampaignApplication(applicationId, redrawNote);
      if (result?.success) {
        setApplications((prev) => {
          const next = prev.map((app) =>
            app.id === applicationId ? { ...app, status: "REDRAWN" } : app
          );
          const pendingLeft = next.filter((app) => app.status === "PENDING").length;
          setFilter(pendingLeft > 0 ? "PENDING" : "all");
          return next;
        });
        setRedrawId(null);
        setRedrawNote("");
        toast.success("Hire redrawn — you can accept another applicant");
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to redraw application");
    } finally {
      setUpdatingId(null);
    }
  };

  const content = (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start xl:grid-cols-[300px_minmax(0,1fr)]">
      <CampaignBrief campaign={campaign} cardClass={cardClass} backHref={backHref} />

      <div className="min-w-0 space-y-4">
        <div className={`${cardClass} flex flex-wrap items-center gap-2 p-2 sm:p-2.5`}>
          {FILTERS.map((item) => {
            const count = item.id === "all" ? applications.length : counts[item.id] || 0;
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  "inline-flex min-w-[4.5rem] flex-1 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition sm:flex-none sm:min-w-[7.5rem]",
                  active
                    ? "bg-slate-950 text-white"
                    : "bg-slate-50 text-slate-700 ring-1 ring-slate-200/80 hover:bg-white"
                )}
              >
                <span className="text-xs font-semibold">{item.label}</span>
                <span
                  className={cn(
                    "text-lg font-semibold tabular-nums leading-none",
                    active ? "text-white" : "text-slate-950"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {counts.PENDING > 0 && filter !== "PENDING" ? (
          <button
            type="button"
            onClick={() => setFilter("PENDING")}
            className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-left text-sm text-amber-900 transition hover:bg-amber-100/70"
          >
            <span className="font-semibold">{counts.PENDING} pending</span>
            <span className="text-amber-800/80"> — review and accept creators first</span>
          </button>
        ) : null}

        {applications.length === 0 ? (
          <EmptyState campaignId={campaign.id} cardClass={cardClass} />
        ) : filtered.length === 0 ? (
          <div className={`${cardClass} px-5 py-12 text-center text-sm text-slate-500`}>
            No applications in this view.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                campaignTitle={campaign.title}
                busy={updatingId === application.id}
                messaging={messagingId === application.id}
                redrawOpen={redrawId === application.id}
                redrawNote={redrawId === application.id ? redrawNote : ""}
                onRedrawNoteChange={setRedrawNote}
                onOpenRedraw={() => {
                  setRedrawId(application.id);
                  setRedrawNote("");
                }}
                onCancelRedraw={() => {
                  setRedrawId(null);
                  setRedrawNote("");
                }}
                onConfirmRedraw={() => handleRedrawApplicant(application.id)}
                expanded={expandedId === application.id}
                onToggleExpand={() =>
                  setExpandedId((prev) => (prev === application.id ? null : application.id))
                }
                onAccept={() => handleApplicationStatus(application.id, "ACCEPTED")}
                onReject={() => handleApplicationStatus(application.id, "REJECTED")}
                onMessage={() => handleMessageApplicant(application.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" className="rounded-full lg:hidden">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
          Campaigns
        </Link>
      </Button>
      <Button asChild variant="outline" className="rounded-full">
        <Link href={`/campaigns/${campaign.id}`} target="_blank">
          <ExternalLink className="h-4 w-4" />
          Public page
        </Link>
      </Button>
    </div>
  );

  if (isMediaAgency) {
    return (
      <MediaAgencyPageShell
        eyebrow="Talent outreach"
        title={campaign.title}
        description="Review applicants, message them, and fund accepted hires."
        actions={actions}
      >
        {content}
      </MediaAgencyPageShell>
    );
  }

  return (
    <ClientPageShell
      eyebrow="Campaign applications"
      title={campaign.title}
      description="Review applicants, message them, and fund accepted hires."
      actions={actions}
    >
      {content}
    </ClientPageShell>
  );
}

function CampaignBrief({ campaign, cardClass, backHref }) {
  const budget = budgetLabel(campaign);
  const place = campaignPlaceLabel(campaign);
  const category = campaign.category ? campaignCategoryLabel(campaign) : null;

  return (
    <aside className={`${cardClass} overflow-hidden lg:sticky lg:top-6`}>
      {campaign.imageUrl ? (
        <div className="relative aspect-[16/10] w-full bg-slate-100">
          <Image
            src={campaign.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="300px"
          />
        </div>
      ) : null}

      <div className="space-y-4 p-4">
        <div>
          <Link
            href={backHref}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All campaigns
          </Link>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Brief</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
            {campaign.title}
          </h2>
          {campaign.brand ? (
            <p className="mt-0.5 text-sm text-slate-500">{campaign.brand}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="rounded-full capitalize">
              {String(campaign.status || "").toLowerCase()}
            </Badge>
            {category ? (
              <Badge variant="outline" className="rounded-full">
                {category}
              </Badge>
            ) : null}
          </div>
        </div>

        {campaign.description ? (
          <p className="line-clamp-4 text-sm leading-relaxed text-slate-600">
            {campaign.description}
          </p>
        ) : null}

        <dl className="space-y-2.5 border-t border-slate-100 pt-3 text-sm">
          {budget ? (
            <div className="flex items-start gap-2 text-slate-600">
              <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Budget
                </dt>
                <dd className="font-medium text-slate-900">{budget}</dd>
              </div>
            </div>
          ) : null}
          {place ? (
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Location
                </dt>
                <dd className="text-slate-800">{place}</dd>
              </div>
            </div>
          ) : null}
          {campaign.deadline ? (
            <div className="flex items-start gap-2 text-slate-600">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Deadline
                </dt>
                <dd className="text-slate-800">
                  {format(new Date(campaign.deadline), "MMM d, yyyy")}
                </dd>
              </div>
            </div>
          ) : null}
          <div className="flex items-start gap-2 text-slate-600">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Applicants
              </dt>
              <dd className="text-slate-800">
                {campaign.applicants ?? campaign.applications?.length ?? 0}
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </aside>
  );
}

function EmptyState({ campaignId, cardClass }) {
  return (
    <div className={`${cardClass} px-5 py-14 text-center`}>
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <User className="h-5 w-5" />
      </span>
      <h3 className="text-base font-semibold text-slate-900">No applications yet</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        Share the live campaign so creators can apply. New pitches show up here.
      </p>
      <Button asChild variant="black" className="mt-5 rounded-full">
        <Link href={`/campaigns/${campaignId}`}>Open public campaign page</Link>
      </Button>
    </div>
  );
}

function ApplicationCard({
  application,
  campaignTitle,
  onAccept,
  onReject,
  onMessage,
  onOpenRedraw,
  onCancelRedraw,
  onConfirmRedraw,
  onRedrawNoteChange,
  redrawNote = "",
  redrawOpen = false,
  busy = false,
  messaging = false,
  expanded = false,
  onToggleExpand,
}) {
  const talent = application.talent;
  const status = STATUS_META[application.status] || STATUS_META.PENDING;
  const applicantName = application.name || talent?.name || "Creator";
  const profileHref = talentProfileHref(talent);
  const payHref = talentProfileHref(talent, { book: true, campaignTitle });
  const mailHref = messageHref({
    email: application.email,
    campaignTitle,
    applicantName,
  });
  const chatHref = whatsappHref({
    phone: application.phone,
    campaignTitle,
    applicantName,
  });
  const rateLabel = money(application.rate);
  const isAccepted = application.status === "ACCEPTED";
  const isPending = application.status === "PENDING";
  const isRedrawn = application.status === "REDRAWN";
  const canMessage = Boolean(talent?.id);
  const hasDetails = Boolean(
    application.portfolio ||
      application.experience ||
      application.additionalInfo ||
      application.availability
  );

  return (
    <li
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
        isAccepted ? "border-emerald-200/80" : "border-slate-200/90"
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
            {talent?.imageUrl ? (
              <Image
                src={talent.imageUrl}
                alt={talent.name || "Talent"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-base font-semibold text-slate-600">
                {applicantName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-semibold text-slate-950 sm:text-lg">
                    {applicantName}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn("rounded-full font-medium", status.className)}
                  >
                    {status.label}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">
                  {talent?.specialty || "Creator"}
                  {application.createdAt
                    ? ` · ${format(new Date(application.createdAt), "MMM d, yyyy")}`
                    : ""}
                </p>
              </div>
              {rateLabel ? (
                <div className="rounded-xl bg-slate-950 px-3 py-1.5 text-right text-white">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-white/60">
                    Asked
                  </p>
                  <p className="text-sm font-semibold tabular-nums">{rateLabel}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {application.email ? (
                <a
                  href={mailHref || undefined}
                  className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-white hover:text-slate-950"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{application.email}</span>
                </a>
              ) : null}
              {application.phone ? (
                <a
                  href={chatHref || `tel:${application.phone}`}
                  target={chatHref ? "_blank" : undefined}
                  rel={chatHref ? "noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-white hover:text-slate-950"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {application.phone}
                </a>
              ) : null}
              {application.location ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200/80">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {application.location}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {isAccepted ? (
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            <div className="grid gap-2 sm:grid-cols-[1fr_1.15fr]">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full"
                disabled={!canMessage || messaging || busy}
                onClick={onMessage}
              >
                {messaging ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                {messaging ? "Opening chat…" : "Message"}
              </Button>
              {payHref ? (
                <Button asChild variant="black" className="h-11 rounded-full">
                  <Link href={payHref}>
                    <DollarSign className="h-4 w-4" />
                    {rateLabel ? `Pay ${rateLabel}` : "Book & pay"}
                  </Link>
                </Button>
              ) : (
                <Button variant="black" className="h-11 rounded-full" disabled>
                  Profile unavailable
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              {chatHref ? (
                <a
                  href={chatHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-slate-950"
                >
                  <Phone className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              ) : null}
              {mailHref ? (
                <a
                  href={mailHref}
                  className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-slate-950"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
              ) : null}
              {profileHref ? (
                <Link
                  href={profileHref}
                  className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-slate-950"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Profile
                </Link>
              ) : null}
              {hasDetails ? (
                <button
                  type="button"
                  onClick={onToggleExpand}
                  className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-slate-950"
                >
                  {expanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                  {expanded ? "Hide pitch" : "View pitch"}
                </button>
              ) : null}
              <span className="text-slate-400">
                Chat in Payollar, then pay on their booking page.
              </span>
            </div>

            {redrawOpen ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <p className="text-sm font-semibold text-slate-950">Redraw this hire?</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Use this if you couldn&apos;t reach an agreement. The creator is released and you
                  can accept another applicant.
                </p>
                <Textarea
                  value={redrawNote}
                  onChange={(event) => onRedrawNoteChange?.(event.target.value)}
                  placeholder="Optional note (shared in chat if one exists)"
                  className="mt-3 min-h-[72px] rounded-xl border-slate-200 bg-white text-sm"
                  maxLength={500}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
                    disabled={busy || messaging}
                    onClick={onConfirmRedraw}
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Confirm redraw
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full text-slate-600"
                    disabled={busy}
                    onClick={onCancelRedraw}
                  >
                    Keep hire
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenRedraw}
                disabled={busy || messaging}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-rose-700 disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                No agreement? Redraw hire
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
            {isPending ? (
              <>
                <Button
                  type="button"
                  variant="black"
                  className="rounded-full"
                  disabled={busy || messaging}
                  onClick={onAccept}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Accept
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
                  disabled={busy || messaging}
                  onClick={onReject}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </>
            ) : null}

            {isRedrawn ? (
              <p className="w-full text-sm text-slate-500">
                This hire was redrawn after no agreement. Message stays available if you still want
                to talk.
              </p>
            ) : null}

            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={!canMessage || messaging || busy}
              onClick={onMessage}
            >
              {messaging ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              {messaging ? "Opening chat…" : "Message"}
            </Button>

            {profileHref ? (
              <Button asChild variant="ghost" className="rounded-full text-slate-600">
                <Link href={profileHref}>
                  <ExternalLink className="h-4 w-4" />
                  Profile
                </Link>
              </Button>
            ) : null}

            {hasDetails || application.phone ? (
              <Button
                type="button"
                variant="ghost"
                className="rounded-full text-slate-600"
                onClick={onToggleExpand}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide pitch
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    View pitch
                  </>
                )}
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {expanded ? (
        <div className="space-y-3 border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-5">
          {application.availability ? (
            <DetailRow icon={Clock3} label="Availability" value={application.availability} />
          ) : null}
          {application.portfolio ? (
            <DetailBlock label="Portfolio / links" value={application.portfolio} />
          ) : null}
          {application.experience ? (
            <DetailBlock label="Experience" value={application.experience} />
          ) : null}
          {application.additionalInfo ? (
            <DetailBlock label="Additional info" value={application.additionalInfo} />
          ) : null}
          {!application.availability &&
          !application.portfolio &&
          !application.experience &&
          !application.additionalInfo ? (
            <p className="text-sm text-slate-500">No extra pitch details provided.</p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function DetailBlock({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{value}</p>
    </div>
  );
}
