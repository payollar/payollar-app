"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  Check,
  Clock,
  Copy,
  Link2,
  Play,
  Star,
  User,
} from "lucide-react";
import { siFacebook, siInstagram, siTiktok, siWhatsapp, siX, siYoutube } from "simple-icons";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { getDisplaySkillLabels } from "@/lib/skill-labels";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SlotPicker } from "./slot-picker";
import { AppointmentForm } from "./appointment-form";
import { BookingAgreementModal } from "./booking-agreement-modal";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "reviews", label: "Reviews" },
  { id: "availability", label: "Availability" },
];

function formatCedis(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "GH₵ —";
  const whole = Math.abs(number - Math.round(number)) < 0.001;
  const formatted = whole
    ? Math.round(number).toLocaleString("en-GH")
    : number.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `GH₵ ${formatted}`;
}

function rateTypeLabel(rateType) {
  switch (rateType) {
    case "PER_HOUR":
      return "/ hour";
    case "PER_SESSION":
      return "/ session";
    case "FIXED":
      return "fixed";
    default:
      return "";
  }
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function socialKind(url) {
  const host = hostOf(url);
  if (host.includes("tiktok")) return "tiktok";
  if (host.includes("instagram")) return "instagram";
  if (host.includes("youtube") || host.includes("youtu.be")) return "youtube";
  if (host === "x.com" || host.includes("twitter")) return "x";
  if (host.includes("linkedin")) return "linkedin";
  if (host.includes("facebook") || host === "fb.watch") return "facebook";
  return "link";
}

function coverLinkFromUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  const parts = parsed.pathname.split("/").filter(Boolean);
  const reel = (label = "Watch reel") => ({ url, label, isReel: true });
  const profile = (label) => ({ url, label, isReel: false });

  if (host === "youtu.be" || host.includes("youtube")) {
    const isVideo =
      host === "youtu.be" ||
      parsed.searchParams.has("v") ||
      ["shorts", "embed", "watch", "live"].includes(parts[0]);
    return isVideo ? reel() : profile("YouTube");
  }
  if (host.includes("tiktok")) {
    return parts.includes("video") ? reel() : profile("TikTok");
  }
  if (host.includes("instagram")) {
    const isVideo = parts.some((part) => ["reel", "reels", "p", "tv"].includes(part));
    return isVideo ? reel() : profile("Instagram");
  }
  if (host === "fb.watch" || host.includes("facebook")) {
    const isVideo = host === "fb.watch" || parts.some((part) => ["reel", "videos", "watch"].includes(part));
    return isVideo ? reel() : profile("Facebook");
  }
  return null;
}

function featuredCoverLink(portfolios, links) {
  const video = portfolios.find((item) => item.fileType?.startsWith("video/") && item.url);
  if (video) return { url: video.url, label: "Watch reel", isReel: true };
  const classified = links.map(coverLinkFromUrl).filter(Boolean);
  return classified.find((item) => item.isReel) || classified[0] || null;
}

function usableImage(url) {
  if (!url || /placeholder\.svg/i.test(url)) return null;
  return url;
}

function coverLine(doctor) {
  return doctor.specialty?.trim() || null;
}

function servicePoints(service) {
  const points = [];
  if (service.duration) points.push(`${service.duration} min session`);
  if (service.rateType === "PER_HOUR") points.push("Hourly rate");
  else if (service.rateType === "PER_SESSION") points.push("Per session");
  else if (service.rateType === "FIXED") points.push("Fixed price");
  const lines = String(service.description || "")
    .split(/\n+/)
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter((line) => line && line.length <= 80);
  for (const line of lines) {
    if (points.length >= 3) break;
    points.push(line);
  }
  return points.slice(0, 3);
}

function Stars({ value, size = "h-4 w-4" }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index + 1 <= Math.round(Number(value) || 0);
        return (
          <Star
            key={index}
            className={cn(size, filled ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")}
          />
        );
      })}
    </span>
  );
}

const BRAND_ICONS = {
  instagram: siInstagram,
  tiktok: siTiktok,
  youtube: siYoutube,
  x: siX,
  facebook: siFacebook,
  whatsapp: siWhatsapp,
};

const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

function SocialIcon({ kind, className = "h-4 w-4" }) {
  const path = kind === "linkedin" ? LINKEDIN_PATH : BRAND_ICONS[kind]?.path;
  if (!path) return <Link2 className={className} aria-hidden />;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d={path} />
    </svg>
  );
}

const SERVICE_WASHES = [
  "from-[#ede9fe] via-[#f5f3ff] to-[#e0e7ff]",
  "from-[#f3e8ff] via-[#faf5ff] to-[#e0f2fe]",
  "from-[#e0e7ff] via-[#eef2ff] to-[#fae8ff]",
  "from-[#fae8ff] via-[#f5f3ff] to-[#ede9fe]",
];

function serviceWash(value) {
  const text = String(value || "service");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash + text.charCodeAt(index) * (index + 1)) % SERVICE_WASHES.length;
  }
  return SERVICE_WASHES[hash];
}

function ServiceArt({ service }) {
  const title = service.title?.trim() || "Service";
  const category = service.category?.trim() || "";
  const showCategory = category && category.toLowerCase() !== title.toLowerCase();
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-gradient-to-br", serviceWash(title))}>
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/80" />
      <div className="absolute -bottom-12 left-4 h-28 w-28 rounded-full bg-[#6d28d9]/10" />
      <div className="absolute bottom-5 right-6 h-8 w-8 rounded-full bg-[#6d28d9]/20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-6xl font-semibold tracking-tight text-[#6d28d9]/30">{title.charAt(0).toUpperCase()}</span>
      </div>
      {showCategory ? (
        <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          {category}
        </span>
      ) : null}
    </div>
  );
}

function ServiceCard({ service, onBook }) {
  const points = servicePoints(service);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] bg-slate-100">
        {usableImage(service.imageUrl) ? (
          <Image src={service.imageUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 280px" />
        ) : (
          <ServiceArt service={service} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-semibold leading-snug text-slate-900">{service.title}</h3>
        <p className="mt-2 text-sm font-semibold text-slate-800">
          {formatCedis(service.rate)}
          {rateTypeLabel(service.rateType) ? (
            <span className="ml-1 text-xs font-medium text-slate-500">{rateTypeLabel(service.rateType)}</span>
          ) : null}
        </p>
        {points.length > 0 ? (
          <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <button
          type="button"
          onClick={() => onBook(service)}
          className="mt-4 w-full rounded-xl bg-[#6d28d9] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5b21b6]"
        >
          Book Now
        </button>
      </div>
    </article>
  );
}

function PortfolioTile({ item }) {
  const isImage = item.fileType?.startsWith("image/");
  const isVideo = item.fileType?.startsWith("video/");
  return (
    <figure className="overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.title || "Portfolio"} className="h-full w-full object-cover" />
        ) : isVideo ? (
          <video src={item.url} className="h-full w-full object-cover" controls preload="metadata" />
        ) : (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex h-full items-center justify-center px-3 text-center text-sm font-medium text-[#6d28d9]">
            {item.title || "Open file"}
          </a>
        )}
        {isVideo ? (
          <span className="pointer-events-none absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white">
            <Play className="h-3.5 w-3.5 fill-white" />
          </span>
        ) : null}
      </div>
      {item.title ? <figcaption className="mt-2 text-sm font-medium text-slate-800">{item.title}</figcaption> : null}
      {item.description ? <p className="text-xs text-slate-500">{item.description}</p> : null}
    </figure>
  );
}

export function DoctorProfile({ doctor, availableDays }) {
  const router = useRouter();
  const { data: session } = useSession();
  const sessionUser = session?.user;
  const canReview = sessionUser?.role === "CLIENT";

  const [tab, setTab] = useState("overview");
  const [showBooking, setShowBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [bookingServiceNote, setBookingServiceNote] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const reviewsStorageKey = doctor?.id ? `creator-reviews:${doctor.id}` : null;
  const services = doctor.services || [];
  const portfolios = doctor.portfolios || [];
  const products = doctor.digitalProducts || [];
  const skillLabels = getDisplaySkillLabels(doctor.skills);
  const links = (doctor.portfolioUrls || []).filter(Boolean);
  const socials = links
    .map((url) => ({ url, kind: socialKind(url) }))
    .filter((item, index, all) => all.findIndex((other) => other.kind === item.kind && other.kind !== "link") === index || item.kind === "link")
    .slice(0, 5);

  const coverLink = useMemo(() => featuredCoverLink(portfolios, links), [portfolios, links]);

  const coverImage =
    usableImage(portfolios.find((item) => item.fileType?.startsWith("image/"))?.url) ||
    usableImage(doctor.imageUrl);
  const line = coverLine(doctor);
  const backHref = `/talents/${encodeURIComponent(String(doctor.specialty ?? "").trim())}`;

  const totalSlots = (availableDays || []).reduce((total, day) => total + (day.slots?.length || 0), 0);
  const firstOpenDay = (availableDays || []).find((day) => day.slots?.length);
  const hoursLabel = firstOpenDay
    ? `${firstOpenDay.displayDate.split(",")[0]} · ${firstOpenDay.slots[0].formatted.split(" - ")[0]} – ${firstOpenDay.slots[firstOpenDay.slots.length - 1].formatted.split(" - ")[1]}`
    : "No open times in the next few days";

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length : 0;

  useEffect(() => {
    if (!reviewsStorageKey) return;
    try {
      const raw = window.localStorage.getItem(reviewsStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setReviews(Array.isArray(parsed) ? parsed : []);
    } catch {
      setReviews([]);
    }
  }, [reviewsStorageKey]);

  useEffect(() => {
    if (!sessionUser?.id) return;
    const mine = reviews.find((review) => review.clientId === sessionUser.id);
    if (!mine) return;
    setSelectedRating(mine.rating || 0);
    setReviewComment(mine.comment || "");
  }, [sessionUser?.id, reviews]);

  const openBooking = (service) => {
    const title = service?.title?.trim();
    setBookingServiceNote(title ? `Service: ${title}` : null);
    if (service?.id) setSelectedServiceId(service.id);
    if (showBooking) {
      document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setIsAgreementOpen(true);
  };

  const handleAgreementAccept = () => {
    setShowBooking(true);
    setIsAgreementOpen(false);
    setTab("availability");
    setTimeout(() => {
      document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const handleSubmitReview = () => {
    if (!reviewsStorageKey || !sessionUser?.id) {
      toast.error("Please sign in to leave a review.");
      return;
    }
    if (!canReview) {
      toast.error("Only clients can leave reviews.");
      return;
    }
    if (!selectedRating) {
      toast.error("Please select a rating.");
      return;
    }
    if (reviewComment.trim().length < 3) {
      toast.error("Please add a short comment.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const mine = {
        id: `${sessionUser.id}:${doctor.id}`,
        clientId: sessionUser.id,
        clientName: sessionUser.name || "Client",
        rating: selectedRating,
        comment: reviewComment.trim(),
        createdAt: new Date().toISOString(),
      };
      const next = reviews.some((review) => review.clientId === sessionUser.id)
        ? reviews.map((review) => (review.clientId === sessionUser.id ? mine : review))
        : [mine, ...reviews];
      setReviews(next);
      window.localStorage.setItem(reviewsStorageKey, JSON.stringify(next));
      toast.success("Review submitted.");
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const share = (network) => {
    const url = window.location.href;
    const text = doctor.name ? `${doctor.name} on Payollar` : "Payollar creator";
    const targets = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    if (network === "copy") {
      navigator.clipboard.writeText(url).then(
        () => toast.success("Profile link copied."),
        () => toast.error("Could not copy the link.")
      );
      return;
    }
    window.open(targets[network], "_blank", "noopener,noreferrer");
  };

  const visibleServices = tab === "services" ? services : services.slice(0, 4);
  const visiblePortfolio = tab === "portfolio" ? portfolios : portfolios.slice(0, 4);
  const visibleReviews = tab === "reviews" ? reviews : reviews.slice(0, 3);
  const highlights = skillLabels.slice(0, 4);

  return (
    <div className="-mt-[5.25rem] bg-[#f5f6fb] pb-20 text-slate-900 md:-mt-28">
      <section className="relative h-72 overflow-hidden bg-slate-900 sm:h-80 md:h-[22rem]">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" className="h-full w-full object-cover object-[center_20%]" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-700 to-violet-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25" />
        <div className="absolute inset-x-0 top-24 flex items-start justify-between p-4 md:top-28 md:p-6">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-sm text-white backdrop-blur-sm hover:bg-black/55"
          >
            <ArrowLeft className="h-4 w-4" />
            {doctor.specialty || "Talents"}
          </Link>
          {coverLink ? (
            <a
              href={coverLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/70"
            >
              {coverLink.isReel ? (
                <Play className="h-3.5 w-3.5 fill-white" />
              ) : (
                <SocialIcon kind={socialKind(coverLink.url)} className="h-3.5 w-3.5" />
              )}
              {coverLink.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
        {line ? (
          <p
            className="pointer-events-none absolute right-5 top-40 max-w-[16rem] text-right text-3xl leading-tight text-white drop-shadow-sm sm:right-10 sm:top-44 sm:max-w-sm sm:text-4xl md:text-[2.6rem]"
            style={{ fontFamily: "var(--font-handwriting), cursive" }}
          >
            {line}
          </p>
        ) : null}
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-5 px-4 md:px-6 lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:gap-6">
        <div className="contents lg:block lg:min-w-0 lg:space-y-8">
        <section className="relative z-10 order-1 -mt-16 h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="relative -mt-14 h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md sm:h-28 sm:w-28">
              {usableImage(doctor.imageUrl) ? (
                <Image src={doctor.imageUrl} alt="" fill className="object-cover" sizes="112px" priority />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-violet-50 text-violet-700">
                  <User className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{doctor.name}</h1>
                    <BadgeCheck className="h-5 w-5 text-sky-500" aria-label="Verified creator" />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {[doctor.specialty, doctor.experience != null ? `${doctor.experience} years` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {socials.length > 0 ? (
                  <div className="flex items-center gap-2">
                    {socials.map((item) => (
                      <a
                        key={item.url}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-0.5 rounded-full px-1.5 text-slate-700 hover:bg-slate-100"
                        aria-label={hostOf(item.url) || "Profile link"}
                      >
                        <SocialIcon kind={item.kind} />
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                {doctor.description?.trim() ||
                  "This creator hasn’t added a bio yet. Their services and portfolio are below."}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified creator
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BriefStat label={services.length === 1 ? "Service" : "Services"} value={services.length} />
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Stars value={avgRating} />
                  <span className="font-medium text-slate-800">
                    {reviews.length ? avgRating.toFixed(1) : "New"}
                  </span>
                  <span className="text-slate-400">
                    {reviews.length ? `(${reviews.length})` : ""}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>


        <div className="order-3 min-w-0 space-y-8">
          <div className="flex gap-6 overflow-x-auto border-b border-slate-200">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "shrink-0 border-b-2 pb-3 text-sm font-medium",
                  tab === item.id
                    ? "border-[#6d28d9] text-slate-950"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {(tab === "overview" || tab === "services") && (
            <section>
              <SectionHead
                title="Services & packages"
                action={services.length > 4 && tab === "overview" ? "View all services" : null}
                onAction={() => setTab("services")}
              />
              <p className="mt-1 text-sm text-slate-500">Choose a package, then pick a time.</p>
              {visibleServices.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {visibleServices.map((service) => (
                    <ServiceCard key={service.id} service={service} onBook={openBooking} />
                  ))}
                </div>
              ) : (
                <EmptyNote>No active services yet.</EmptyNote>
              )}
            </section>
          )}

          {(tab === "overview" || tab === "portfolio") && (
            <section>
              <SectionHead
                title="Portfolio"
                action={portfolios.length > 4 && tab === "overview" ? "View all work" : null}
                onAction={() => setTab("portfolio")}
              />
              {visiblePortfolio.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {visiblePortfolio.map((item) => (
                    <PortfolioTile key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <EmptyNote>No portfolio uploads yet.</EmptyNote>
              )}
              {tab === "portfolio" && links.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {links.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-[#6d28d9]"
                    >
                      {hostOf(url) || url}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              ) : null}
              {tab === "portfolio" && products.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {products.map((product) => (
                    <a key={product.id} href="/products" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="relative h-36 bg-slate-100">
                        {usableImage(product.imageUrl) ? (
                          <Image src={product.imageUrl} alt="" fill className="object-cover" sizes="320px" />
                        ) : null}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">{product.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.description}</p>
                        <p className="mt-2 text-sm font-semibold">{formatCedis(product.price)}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : null}
            </section>
          )}

          {(tab === "overview" || tab === "reviews") && (
            <section>
              <SectionHead
                title="Reviews"
                action={reviews.length > 3 && tab === "overview" ? "View all reviews" : null}
                onAction={() => setTab("reviews")}
              />
              {visibleReviews.length > 0 ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleReviews
                    .slice()
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((review) => (
                      <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                            {(review.clientName || "C").slice(0, 1)}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">{review.clientName || "Client"}</p>
                            <Stars value={review.rating} size="h-3.5 w-3.5" />
                          </div>
                        </div>
                        {review.comment ? (
                          <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                        ) : null}
                        {review.createdAt ? (
                          <p className="mt-3 text-xs text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString("en-GH", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        ) : null}
                      </article>
                    ))}
                </div>
              ) : (
                <EmptyNote>No reviews yet.</EmptyNote>
              )}

              {tab === "reviews" ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  {!sessionUser ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sign in to leave a review</p>
                      <Button type="button" className="rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6]" onClick={() => router.push("/sign-in")}>
                        Sign in
                      </Button>
                    </div>
                  ) : !canReview ? (
                    <p className="text-sm text-slate-500">Only client accounts can rate creators.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => {
                          const star = index + 1;
                          const on = star <= selectedRating;
                          return (
                            <button key={star} type="button" onClick={() => setSelectedRating(star)} aria-label={`${star} stars`} className="p-1">
                              <Star className={cn("h-6 w-6", on ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                            </button>
                          );
                        })}
                      </div>
                      <Textarea
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                        placeholder="What should other clients know?"
                        className="min-h-24 resize-none"
                      />
                      <Button
                        type="button"
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview}
                        className="rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6]"
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit review"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}
            </section>
          )}

          {tab === "availability" && !showBooking ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Open times</h2>
              <p className="mt-2 text-sm text-slate-500">
                {totalSlots > 0
                  ? `${totalSlots} slots are open over the next few days. Book a service to choose one.`
                  : "This creator has no open slots in the next few days."}
              </p>
              {totalSlots > 0 ? (
                <button
                  type="button"
                  onClick={() => openBooking(services.find((service) => service.id === selectedServiceId))}
                  className="mt-4 rounded-xl bg-[#6d28d9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5b21b6]"
                >
                  Book a time
                </button>
              ) : null}
            </section>
          ) : null}

          {showBooking ? (
            <section id="booking-section" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Book a session</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Pick a time and describe the project. You can message them before you pay.
                  </p>
                  {bookingServiceNote ? <p className="mt-2 text-sm font-medium text-[#6d28d9]">{bookingServiceNote}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowBooking(false);
                    setSelectedSlot(null);
                    setBookingServiceNote(null);
                  }}
                  className="text-sm text-slate-500 hover:text-slate-800"
                >
                  Close
                </button>
              </div>
              {totalSlots > 0 ? (
                selectedSlot ? (
                  <AppointmentForm
                    doctorId={doctor.id}
                    slot={selectedSlot}
                    onBack={() => setSelectedSlot(null)}
                    onComplete={() => router.push("/appointments")}
                    initialSessionNote={bookingServiceNote}
                  />
                ) : (
                  <SlotPicker days={availableDays} onSelectSlot={setSelectedSlot} />
                )
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">No bookable slots in the coming days.</p>
              )}
            </section>
          ) : null}
        </div>
        </div>

        <aside className="order-2 h-fit space-y-4 self-start lg:sticky lg:top-28 lg:-mt-20">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Book a service</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a service to get started. You can add project details when you book.
            </p>
            <label className="mt-4 block text-xs font-medium text-slate-500" htmlFor="service-select">
              Service
            </label>
            <select
              id="service-select"
              value={selectedServiceId}
              onChange={(event) => setSelectedServiceId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#6d28d9]"
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => openBooking(services.find((service) => service.id === selectedServiceId))}
              className="mt-3 w-full rounded-xl bg-[#6d28d9] py-3 text-sm font-semibold text-white hover:bg-[#5b21b6]"
            >
              Book Now
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              {totalSlots > 0
                ? `${totalSlots} open slot${totalSlots === 1 ? "" : "s"} in the next few days`
                : "No open slots right now"}
            </p>
          </div>

          {highlights.length > 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold">Why work with me?</h2>
              <ul className="mt-3 space-y-2.5">
                {highlights.map((label) => (
                  <li key={label} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6d28d9]" />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold">Creator stats</h2>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat value={doctor.experience != null ? String(doctor.experience) : "—"} label="Years" />
              <Stat value={String(services.length)} label="Services" />
              <Stat value={reviews.length ? avgRating.toFixed(1) : "—"} label="Rating" />
            </dl>
          </div>

          <div className="rounded-3xl border border-violet-100 bg-violet-50/70 p-5">
            <h2 className="text-base font-semibold">Need a custom request?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Have a brief that doesn’t match a package? Book a session and describe it there.
            </p>
            <button
              type="button"
              onClick={() => openBooking(null)}
              className="mt-4 w-full rounded-xl border border-[#6d28d9] bg-white py-2.5 text-sm font-semibold text-[#6d28d9] hover:bg-violet-50"
            >
              Request a session
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold">Availability</h2>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{hoursLabel}</span>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  {totalSlots > 0
                    ? `${totalSlots} bookable slot${totalSlots === 1 ? "" : "s"}`
                    : "Check back for new times"}
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold">Share this creator</h2>
            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={() => share("copy")} aria-label="Copy link" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50">
                <Copy className="h-4 w-4" />
              </button>
              {[
                ["whatsapp", "WhatsApp"],
                ["x", "X"],
                ["facebook", "Facebook"],
                ["linkedin", "LinkedIn"],
              ].map(([network, label]) => (
                <button
                  key={network}
                  type="button"
                  onClick={() => share(network)}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <SocialIcon kind={network} />
                </button>
              ))}
            </div>
          </div>
        </aside>

      </div>

      <BookingAgreementModal
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        onAccept={handleAgreementAccept}
        creatorName={doctor.name}
        bookingContext={bookingServiceNote}
      />
    </div>
  );
}

function BriefStat({ value, label }) {
  return (
    <span>
      <span className="font-semibold text-slate-900">{value}</span> {label}
    </span>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <dt className="text-lg font-semibold text-slate-950">{value}</dt>
      <dd className="text-xs text-slate-500">{label}</dd>
    </div>
  );
}

function SectionHead({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {action ? (
        <button type="button" onClick={onAction} className="inline-flex items-center gap-1 text-sm font-medium text-[#6d28d9] hover:underline">
          {action}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function EmptyNote({ children }) {
  return <p className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">{children}</p>;
}
