import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  MessageSquare,
  Receipt,
  Upload,
  XCircle,
} from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MediaAgencyPageShell,
  mediaAgencyCardClass,
} from "../../../_components/media-agency-page-shell";
import { BookingNotes } from "../../_components/booking-notes";
import { BookingCreatives } from "../../_components/booking-creatives";
import {
  canNegotiate,
  initials,
  money,
  statusMeta,
} from "../../_lib/request-helpers";
import { updateBookingStatus } from "../../actions";

export const dynamic = "force-dynamic";

function Field({ label, children }) {
  if (children == null || children === "") return null;
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">{children}</p>
    </div>
  );
}

function normalizeBookingType(value) {
  const raw = String(value || "").toUpperCase();
  if (raw === "MEDIA" || raw === "MEDIA_BOOKING") return "MEDIA";
  if (raw === "RATE_CARD" || raw === "RATE_CARD_BOOKING") return "RATE_CARD";
  return null;
}

export default async function MediaAgencyRequestDetailPage({ params }) {
  const user = await checkUser();
  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const { bookingType: bookingTypeParam, id } = await params;
  const bookingType = normalizeBookingType(bookingTypeParam);
  if (!bookingType || !id) notFound();

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!mediaAgency) {
    redirect("/media-agency/settings");
  }

  let booking = null;
  let detailFields = null;
  let summary = "";
  let negotiateHref = null;

  if (bookingType === "MEDIA") {
    booking = await db.mediaBooking.findFirst({
      where: { id, agencyId: mediaAgency.id },
      include: { listing: true },
    });
    if (!booking) notFound();

    detailFields = (
      <>
        <Field label="Listing">{booking.listing?.name}</Field>
        <Field label="Package">{booking.packageName || "Custom package"}</Field>
        <Field label="Duration">{booking.duration}</Field>
        <Field label="Spots">{booking.slots}</Field>
        <Field label="Start">
          {booking.startDate
            ? new Date(booking.startDate).toLocaleDateString()
            : null}
        </Field>
        <Field label="End">
          {booking.endDate
            ? new Date(booking.endDate).toLocaleDateString()
            : null}
        </Field>
      </>
    );
    summary = [
      booking.listing?.name,
      booking.packageName || "Custom package",
      booking.duration,
    ]
      .filter(Boolean)
      .join(" · ");
    negotiateHref = `/media-agency/negotiations/start/MEDIA_BOOKING/${booking.id}`;
  } else {
    booking = await db.rateCardBookingItem.findFirst({
      where: { id, agencyId: mediaAgency.id },
      include: {
        rateCard: {
          select: {
            id: true,
            title: true,
            listingType: true,
            location: true,
          },
        },
        mediaInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            amount: true,
            currency: true,
            paymentReference: true,
            paidAt: true,
            status: true,
          },
        },
        row: {
          include: {
            table: {
              include: {
                section: {
                  select: { title: true },
                },
              },
            },
          },
        },
      },
    });
    if (!booking) notFound();

    detailFields = (
      <>
        <Field label="Rate card">{booking.rateCard?.title}</Field>
        <Field label="Section">
          {booking.row?.table?.section?.title || "N/A"}
        </Field>
        <Field label="Description">{booking.snapshotDescription}</Field>
        <Field label="Quantity">{booking.quantity}</Field>
        <Field label="Start">
          {booking.startDate
            ? new Date(booking.startDate).toLocaleDateString()
            : null}
        </Field>
        <Field label="End">
          {booking.endDate
            ? new Date(booking.endDate).toLocaleDateString()
            : null}
        </Field>
        <Field label="Unit price">
          {booking.snapshotPrice != null ? money(booking.snapshotPrice) : null}
        </Field>
      </>
    );
    summary = [
      booking.rateCard?.title,
      booking.row?.table?.section?.title,
      booking.snapshotDescription,
    ]
      .filter(Boolean)
      .join(" · ");
    negotiateHref = `/media-agency/negotiations/start/RATE_CARD_BOOKING/${booking.id}`;
  }

  const assets = await db.mediaCampaignAsset.findMany({
    where: {
      agencyId: mediaAgency.id,
      bookingType,
      bookingId: booking.id,
    },
    orderBy: { createdAt: "desc" },
  });

  const status = statusMeta(booking.status);

  return (
    <MediaAgencyPageShell
      eyebrow="Inbox"
      title="Request details"
      description="Review the booking, campaign brief, creatives, and next actions."
    >
      <Link
        href="/media-agency/requests"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to requests
      </Link>

      <section className={cn(mediaAgencyCardClass, "p-5 sm:p-6")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
              {initials(booking.clientName)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  {booking.clientName}
                </h2>
                <Badge
                  variant="outline"
                  className={cn("rounded-full", status.className)}
                >
                  {status.label}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                {booking.clientEmail}
              </p>
              {summary ? (
                <p className="mt-2 text-sm text-slate-400">{summary}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate-400">
                Requested on {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {booking.totalAmount != null ? (
            <div className="rounded-2xl border border-slate-100 bg-[#f7f8fc] px-4 py-3 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Request total
              </p>
              <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-950">
                {money(booking.totalAmount)}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className={cn(mediaAgencyCardClass, "p-5 sm:p-6")}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Booking details
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {detailFields}
        </div>
      </section>

      <BookingNotes notes={booking.notes} />
      <BookingCreatives assets={assets} />

      <section
        className={cn(
          mediaAgencyCardClass,
          "flex flex-wrap items-center justify-end gap-2 p-4 sm:p-5"
        )}
      >
        {canNegotiate(booking) && negotiateHref ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-slate-200"
            asChild
          >
            <Link href={negotiateHref}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Negotiate
            </Link>
          </Button>
        ) : null}

        {booking.status === "PENDING" ? (
          <>
            <form action={updateBookingStatus}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <input type="hidden" name="bookingType" value={bookingType} />
              <input type="hidden" name="status" value="CONFIRMED" />
              <Button
                type="submit"
                size="sm"
                variant="black"
                className="rounded-full"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm
              </Button>
            </form>
            <form action={updateBookingStatus}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <input type="hidden" name="bookingType" value={bookingType} />
              <input type="hidden" name="status" value="CANCELLED" />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Decline
              </Button>
            </form>
          </>
        ) : null}

        {booking.mediaInvoice ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-slate-200"
            asChild
          >
            <Link href={`/media-agency/invoices/${booking.mediaInvoice.id}`}>
              <Receipt className="mr-2 h-4 w-4" />
              Receipt {booking.mediaInvoice.invoiceNumber}
            </Link>
          </Button>
        ) : null}

        {(booking.status === "CONFIRMED" || booking.status === "COMPLETED") && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-slate-200"
              asChild
            >
              <Link
                href={`/media-agency/transmission-certificates?bookingId=${booking.id}&bookingType=${bookingType}`}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload certificate
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-slate-200"
              asChild
            >
              <Link
                href={`/media-agency/reporting?bookingId=${booking.id}&bookingType=${bookingType}`}
              >
                <FileText className="mr-2 h-4 w-4" />
                Create report
              </Link>
            </Button>
          </>
        )}
      </section>
    </MediaAgencyPageShell>
  );
}
