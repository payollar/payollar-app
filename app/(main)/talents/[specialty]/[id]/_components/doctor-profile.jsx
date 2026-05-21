"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  Clock,
  Medal,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Award,
  GalleryVertical,
  ShoppingBag,
  ExternalLink,
  DollarSign,
  Link2,
  Download,
  Briefcase,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Particles } from "@/components/ui/particles";
import { cn } from "@/lib/utils";
import { getDisplaySkillLabels } from "@/lib/skill-labels";
import { Textarea } from "@/components/ui/textarea";
import { SlotPicker } from "./slot-picker";
import { AppointmentForm } from "./appointment-form";
import { BookingAgreementModal } from "./booking-agreement-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

const cardSurface =
  "rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm";
const cardSurfaceInteractive =
  "rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:border-primary/35 hover:shadow-md";

function rateTypeLabel(rateType) {
  switch (rateType) {
    case "PER_HOUR":
      return "/hour";
    case "PER_SESSION":
      return "/session";
    case "FIXED":
      return "fixed";
    default:
      return "";
  }
}

function PublicServiceCard({ service, onBook }) {
  const hasImage = Boolean(service.imageUrl?.trim());

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-sm backdrop-blur-sm",
        "transition-all duration-300 hover:border-primary/45 hover:shadow-lg hover:shadow-primary/[0.07]"
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gradient-to-br from-muted to-muted/40">
        {hasImage ? (
          <Image
            src={service.imageUrl}
            alt={service.title ? `${service.title} — service image` : "Service image"}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/[0.12] via-primary/[0.06] to-transparent">
            <Briefcase
              className="h-14 w-14 text-primary/30 transition-transform duration-300 group-hover:scale-105"
              strokeWidth={1.25}
              aria-hidden
            />
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-90"
          aria-hidden
        />
        {service.category ? (
          <div className="absolute left-3 top-3 z-[1] flex flex-wrap gap-1.5">
            <Badge className="border-0 bg-background/75 text-xs font-medium text-foreground shadow-sm backdrop-blur-md">
              {service.category}
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4">
        <div className="min-w-0 flex-1 space-y-2">
          {!hasImage && service.category ? (
            <Badge variant="secondary" className="w-fit border-primary/20 bg-primary/10 text-xs font-medium text-primary">
              {service.category}
            </Badge>
          ) : null}
          <h4 className="text-lg font-semibold leading-snug tracking-tight text-foreground [font-family:var(--font-heading)]">
            {service.title}
          </h4>
          {service.description?.trim() ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground/75">Details available when you book.</p>
          )}
        </div>

        <div className="mt-5 space-y-3 rounded-xl border border-border/40 bg-muted/35 p-3.5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rate</p>
              <p className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
                <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
                  ₵{service.rate.toFixed(2)}
                </span>
                {rateTypeLabel(service.rateType) ? (
                  <span className="text-sm font-medium text-muted-foreground">
                    {rateTypeLabel(service.rateType)}
                  </span>
                ) : null}
              </p>
            </div>
            {service.duration ? (
              <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                <span className="tabular-nums">{service.duration} min</span>
              </div>
            ) : null}
          </div>
        </div>

        <Button
          type="button"
          variant="marketing"
          size="default"
          className="mt-4 w-full rounded-full shadow-sm"
          onClick={() => onBook(service)}
          aria-label={`Book ${service.title}`}
        >
          Book this service
          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        </Button>
      </div>
    </article>
  );
}

function ProfileParticles({ className }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute -right-4 -top-6 h-64 w-[min(100%,28rem)] opacity-[0.22] md:opacity-[0.32]",
        className
      )}
      aria-hidden
    >
      <Particles
        className="absolute inset-0"
        quantity={42}
        color="#0055ff"
        staticity={55}
        ease={45}
      />
    </div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
      <h3 className="text-base font-semibold tracking-tight text-foreground">{children}</h3>
    </div>
  );
}

export function DoctorProfile({ doctor, availableDays }) {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  /** Set when visitor clicks "Book this service" on a service card (prefills session notes) */
  const [bookingServiceNote, setBookingServiceNote] = useState(null);
  const router = useRouter();

  const { data: session } = useSession();
  const sessionUser = session?.user;
  const canReview = sessionUser?.role === "CLIENT";

  // Ratings/reviews (client-side for now; can be wired to DB later)
  const reviewsStorageKey = doctor?.id ? `creator-reviews:${doctor.id}` : null;
  const [reviews, setReviews] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!reviewsStorageKey) return;
    try {
      const raw = window.localStorage.getItem(reviewsStorageKey);
      if (!raw) {
        setReviews([]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setReviews(parsed);
      else setReviews([]);
    } catch {
      setReviews([]);
    }
  }, [reviewsStorageKey]);

  useEffect(() => {
    if (!sessionUser?.id || !reviewsStorageKey) return;
    const myReview = reviews.find((r) => r.clientId === sessionUser.id);
    if (!myReview) return;
    setSelectedRating(myReview.rating || 0);
    setReviewComment(myReview.comment || "");
  }, [sessionUser?.id, reviews, reviewsStorageKey]);

  const getSatisfactoryLabel = (rating) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very good";
      case 5:
        return "Excellent";
      default:
        return "Select a rating";
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
        reviews.length
      : 0;

  const handleSubmitReview = async () => {
    if (!reviewsStorageKey) return;
    if (!sessionUser?.id) {
      toast.error("Please sign in to leave a review.");
      return;
    }
    if (!canReview) {
      toast.error("Only clients can leave reviews.");
      return;
    }
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      toast.error("Please select a rating.");
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 3) {
      toast.error("Please add a short comment (at least 3 characters).");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const now = new Date().toISOString();
      const myName = sessionUser.name || "Client";
      const myReview = {
        id: `${sessionUser.id}:${doctor.id}`,
        clientId: sessionUser.id,
        clientName: myName,
        rating: selectedRating,
        comment: reviewComment.trim(),
        createdAt: now,
      };

      const existingIndex = reviews.findIndex((r) => r.clientId === sessionUser.id);
      const next =
        existingIndex >= 0
          ? reviews.map((r, idx) => (idx === existingIndex ? { ...r, ...myReview } : r))
          : [myReview, ...reviews];

      setReviews(next);
      window.localStorage.setItem(reviewsStorageKey, JSON.stringify(next));
      toast.success("Review submitted!");
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const totalSlots = availableDays?.reduce(
    (total, day) => total + day.slots.length,
    0
  );

  const handleBookSessionClick = () => {
    if (showBooking) {
      setShowBooking(false);
      setBookingServiceNote(null);
    } else {
      setBookingServiceNote(null);
      setIsAgreementOpen(true);
    }
  };

  const openBookingFromService = (service) => {
    const title = service?.title?.trim();
    setBookingServiceNote(title ? `Service: ${title}` : null);
    if (showBooking) {
      document.getElementById("booking-section")?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      setIsAgreementOpen(true);
    }
  };

  const handleAgreementAccept = () => {
    setShowBooking(true);
    setIsAgreementOpen(false);
    setTimeout(() => {
      document.getElementById("booking-section")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookingComplete = () => {
    router.push("/appointments");
  };

  const expYears =
    doctor.experience != null && doctor.experience !== ""
      ? `${doctor.experience} years experience`
      : null;

  const skillLabels = getDisplaySkillLabels(doctor.skills);

  return (
    <div className="relative">
      <ProfileParticles />

      <div className="relative z-[1] grid min-w-0 grid-cols-1 gap-8 md:grid-cols-3">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="md:sticky md:top-28">
            <Card className={cn(cardSurface, "overflow-hidden")}>
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "relative mb-5 h-36 w-36 rounded-full p-1",
                      "bg-gradient-to-br from-primary/50 via-primary/20 to-transparent"
                    )}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-muted ring-2 ring-border/80">
                      {doctor.imageUrl ? (
                        <Image
                          src={doctor.imageUrl}
                          alt={doctor.name}
                          fill
                          sizes="144px"
                          className="object-cover"
                          priority
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10">
                          <User className="h-16 w-16 text-primary/70" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
                    {doctor.specialty || "Talent"}
                  </p>
                  <h2 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">
                    {doctor.name}
                  </h2>

                  {expYears ? (
                    <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Medal className="h-4 w-4 shrink-0 text-primary" />
                      <span>{expYears}</span>
                    </div>
                  ) : (
                    <div className="mb-6 h-px w-12 bg-border/60" aria-hidden />
                  )}

                  <Button
                    type="button"
                    onClick={handleBookSessionClick}
                    variant={showBooking ? "marketingOutline" : "marketing"}
                    size="lg"
                    className="w-full rounded-full"
                  >
                    {showBooking ? (
                      <>
                        Hide booking
                        <ChevronUp className="ml-1 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Book a session
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {totalSlots > 0 ? (
                    <p className="mt-4 text-xs text-muted-foreground">
                      {totalSlots} slot{totalSlots === 1 ? "" : "s"} open in the next few days
                    </p>
                  ) : (
                    <p className="mt-4 text-xs text-muted-foreground">
                      No open slots right now — check back soon
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main */}
        <div className="min-w-0 space-y-6 md:col-span-2">
          <Card className={cn(cardSurface, "min-w-0 overflow-hidden")}>
            <CardHeader className="space-y-1 pb-2">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">About</p>
              <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                {doctor.name}
              </CardTitle>
              <CardDescription className="text-base">
                Professional background, services, and portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="min-w-0 space-y-8">
              <div className="space-y-3">
                <SectionTitle icon={FileText}>Bio</SectionTitle>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
                  {doctor.description?.trim()
                    ? doctor.description
                    : "This creator hasn’t added a bio yet. Explore their services and portfolio below, or book a session to connect."}
                </p>
              </div>

              <Separator className="bg-border/60" />

              <div className="min-w-0 space-y-3">
                <SectionTitle icon={Award}>Skills</SectionTitle>
                {skillLabels.length > 0 ? (
                  <div className="min-w-0 rounded-lg border border-border/50 bg-muted/20 p-2.5">
                    <div className="flex min-w-0 max-w-full flex-wrap gap-1.5">
                      {skillLabels.map((label) => (
                        <Badge
                          key={label}
                          variant="outline"
                          className="max-w-full shrink whitespace-normal break-words border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium leading-snug text-white"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills listed yet.</p>
                )}
              </div>

              <Separator className="bg-border/60" />

              <div className="space-y-4">
                <SectionTitle icon={Star}>Ratings & Reviews</SectionTitle>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => {
                          const starNum = idx + 1;
                          const isFilled = starNum <= Math.round(avgRating);
                          return (
                            <Star
                              key={starNum}
                              className={cn(
                                "h-4 w-4 transition-colors",
                                isFilled ? "text-primary fill-primary" : "text-muted-foreground/35"
                              )}
                              fill={isFilled ? "currentColor" : "transparent"}
                              aria-hidden
                            />
                          );
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reviews.length > 0 ? (
                          <>
                            <span className="font-semibold text-foreground">{avgRating.toFixed(1)}</span>{" "}
                            average
                          </>
                        ) : (
                          "No ratings yet"
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {reviews.length > 0
                        ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}`
                        : "Be the first to leave a review"}
                    </div>
                  </div>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews
                      .slice()
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((r) => (
                        <Card
                          key={r.id}
                          className="rounded-2xl border border-border/60 bg-card/70 shadow-sm backdrop-blur-sm"
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="text-sm font-semibold text-foreground">
                                  {r.clientName || "Client"}
                                </div>
                                <div className="mt-1 flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, idx) => {
                                    const starNum = idx + 1;
                                    const isFilled = starNum <= (Number(r.rating) || 0);
                                    return (
                                      <Star
                                        key={starNum}
                                        className={cn(
                                          "h-4 w-4",
                                          isFilled ? "text-primary fill-primary" : "text-muted-foreground/35"
                                        )}
                                        fill={isFilled ? "currentColor" : "transparent"}
                                        aria-hidden
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : null}
                              </div>
                            </div>
                            {r.comment ? (
                              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                                {r.comment}
                              </p>
                            ) : null}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : null}

                <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
                  {!sessionUser ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">Sign in to leave a review</div>
                      <p className="text-sm text-muted-foreground">
                        Rating and comments help other clients choose the right talent.
                      </p>
                      <Button
                        type="button"
                        variant="marketing"
                        className="w-full rounded-full"
                        onClick={() => router.push("/sign-in")}
                      >
                        Sign in
                      </Button>
                    </div>
                  ) : !canReview ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">Clients only</div>
                      <p className="text-sm text-muted-foreground">
                        You must be signed in as a client to rate creators.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-foreground">Your satisfaction level</div>
                          <div className="text-xs text-muted-foreground">{getSatisfactoryLabel(selectedRating || 0)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1" role="radiogroup" aria-label="Satisfaction rating">
                        {Array.from({ length: 5 }).map((_, idx) => {
                          const starNum = idx + 1;
                          const isSelected = starNum <= selectedRating;
                          return (
                            <button
                              key={starNum}
                              type="button"
                              className="rounded-full p-1 transition-colors hover:bg-primary/10"
                              onClick={() => setSelectedRating(starNum)}
                              aria-label={`${starNum} star${starNum === 1 ? "" : "s"}`}
                            >
                              <Star
                                className={cn(
                                  "h-6 w-6 transition-colors",
                                  isSelected ? "text-primary fill-primary" : "text-muted-foreground/40"
                                )}
                                fill={isSelected ? "currentColor" : "transparent"}
                                aria-hidden
                              />
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-foreground">Comments</div>
                        <Textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="What went well? What should others know?"
                          className="min-h-24 resize-none"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{reviewComment.trim().length ? `${reviewComment.trim().length} chars` : "Optional, but recommended"}</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="marketing"
                        className="w-full rounded-full"
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview}
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit review"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {doctor.services && doctor.services.length > 0 ? (
                <>
                  <Separator className="bg-border/60" />
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <SectionTitle icon={Briefcase}>Services</SectionTitle>
                      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Choose an offering, then pick a time. Your session notes can reference the service you
                        selected.
                      </p>
                    </div>
                    <ul className="grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
                      {doctor.services.map((service) => (
                        <li key={service.id} className="min-w-0">
                          <PublicServiceCard service={service} onBook={openBookingFromService} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}

              <Separator className="bg-border/60" />

              <div className="space-y-4">
                <SectionTitle icon={GalleryVertical}>Portfolio</SectionTitle>
                {doctor.portfolios?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {doctor.portfolios.map((item) => (
                      <div
                        key={item.id}
                        className="group overflow-hidden rounded-xl border border-border/50 bg-card/50 ring-1 ring-border/30 transition-all hover:border-primary/30 hover:ring-primary/20"
                      >
                        {item.fileType?.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded dynamic URLs
                          <img
                            src={item.url}
                            alt={item.title || "Portfolio item"}
                            className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        ) : item.fileType?.startsWith("video/") ? (
                          <video
                            src={item.url}
                            controls
                            preload="metadata"
                            className="aspect-[4/3] w-full bg-black object-cover"
                          />
                        ) : (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex aspect-[4/3] items-center justify-center p-4 text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                          >
                            {item.title || "View file"}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No portfolio uploads yet.</p>
                )}
              </div>

              {doctor.portfolioUrls && doctor.portfolioUrls.length > 0 ? (
                <>
                  <Separator className="bg-border/60" />
                  <div className="space-y-3">
                    <SectionTitle icon={Link2}>Links</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {doctor.portfolioUrls.map((url, index) => {
                        try {
                          const urlObj = new URL(url);
                          const domain = urlObj.hostname.replace("www.", "");
                          return (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                            >
                              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
                              {domain}
                            </a>
                          );
                        } catch {
                          return (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                            >
                              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
                              Link {index + 1}
                            </a>
                          );
                        }
                      })}
                    </div>
                  </div>
                </>
              ) : null}

              {doctor.digitalProducts && doctor.digitalProducts.length > 0 ? (
                <>
                  <Separator className="bg-border/60" />
                  <div className="space-y-4">
                    <SectionTitle icon={ShoppingBag}>Digital products</SectionTitle>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {doctor.digitalProducts.map((product) => (
                        <Card key={product.id} className={cn(cardSurfaceInteractive, "overflow-hidden")}>
                          <div className="relative h-40 w-full">
                            {product.imageUrl ? (
                              <Image
                                src={product.imageUrl}
                                alt={product.title}
                                fill
                                className="object-cover"
                                sizes="(max-width:768px) 100vw, 50vw"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/25 to-primary/5">
                                <ShoppingBag className="h-12 w-12 text-primary/40" />
                              </div>
                            )}
                            {product.category ? (
                              <div className="absolute left-2 top-2">
                                <Badge className="border-0 bg-black/55 text-xs text-white backdrop-blur-sm">
                                  {product.category}
                                </Badge>
                              </div>
                            ) : null}
                          </div>
                          <CardContent className="space-y-3 p-5">
                            <h4 className="line-clamp-1 font-semibold text-foreground">{product.title}</h4>
                            <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                            <div className="flex items-center justify-between border-t border-border/50 pt-3">
                              <div className="flex items-center gap-1 font-semibold tabular-nums text-foreground">
                                <DollarSign className="h-4 w-4 text-primary" />
                                ₵{product.price.toFixed(2)}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {product._count?.sales || 0} sales
                              </span>
                            </div>
                            <Button variant="marketing" className="w-full rounded-full" size="sm" asChild>
                              <a href="/products">
                                <Download className="mr-2 h-4 w-4" />
                                View & purchase
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              <Separator className="bg-border/60" />

              <div className="space-y-3">
                <SectionTitle icon={Clock}>Availability</SectionTitle>
                {totalSlots > 0 ? (
                  <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">{totalSlots} time slots</span> available
                      over the next few days. Open booking below to choose a time.
                    </p>
                  </div>
                ) : (
                  <Alert className="border-border/60 bg-card/60 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      No available slots for the next few days. Check back later or browse other talents.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {showBooking ? (
            <div id="booking-section">
              <Card className={cardSurface}>
                <CardHeader>
                  <p className="text-xs font-medium uppercase tracking-wider text-primary">Booking</p>
                  <CardTitle className="text-xl font-semibold text-foreground">Book a session</CardTitle>
                  <CardDescription>
                    Pick a time, then write a short project brief for the talent (goals, context, deliverables). You’ll
                    confirm payment on the last step.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {totalSlots > 0 ? (
                    <>
                      {!selectedSlot ? (
                        <SlotPicker days={availableDays} onSelectSlot={handleSlotSelect} />
                      ) : (
                        <AppointmentForm
                          doctorId={doctor.id}
                          slot={selectedSlot}
                          onBack={() => setSelectedSlot(null)}
                          onComplete={handleBookingComplete}
                          initialSessionNote={bookingServiceNote}
                        />
                      )}
                    </>
                  ) : (
                    <div className="py-8 text-center">
                      <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-60" />
                      <h3 className="mb-2 text-lg font-semibold text-foreground">No open slots</h3>
                      <p className="mx-auto max-w-md text-sm text-muted-foreground">
                        This creator doesn&apos;t have any bookable slots in the coming days. Try again later
                        or explore other profiles.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
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
