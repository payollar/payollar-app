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
import { groupRateCardRequests } from "../../_lib/group-rate-card-requests";
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

const rateCardInclude = {
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
};

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
  let siblingBookings = [];
  let detailFields = null;
  let summary = "";
  let negotiateHref = null;
  let requestTotal = null;
  let campaignLabel = null;

  if (bookingType === "MEDIA") {
    booking = await db.mediaBooking.findFirst({
      where: { id, agencyId: mediaAgency.id },
      include: { listing: true },
    });
    if (!booking) notFound();
    siblingBookings = [booking];
    requestTotal = booking.totalAmount;
    campaignLabel = booking.packageName || booking.listing?.name || null;

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
      include: rateCardInclude,
    });
    if (!booking) notFound();

    let candidates = [];
    if (booking.mediaInvoiceId) {
      candidates = await db.rateCardBookingItem.findMany({
        where: {
          agencyId: mediaAgency.id,
          mediaInvoiceId: booking.mediaInvoiceId,
        },
        include: rateCardInclude,
        orderBy: { createdAt: "asc" },
      });
    } else {
      candidates = await db.rateCardBookingItem.findMany({
        where: {
          agencyId: mediaAgency.id,
          clientEmail: booking.clientEmail,
          rateCardId: booking.rateCardId,
          status: booking.status,
        },
        include: rateCardInclude,
        orderBy: { createdAt: "desc" },
        take: 40,
      });
      const grouped = groupRateCardRequests(candidates);
      const match =
        grouped.find((group) => group.items.some((item) => item.id === booking.id)) ||
        null;
      candidates = match?.items || [booking];
    }

    siblingBookings = candidates.length ? candidates : [booking];
    const groupTotal = siblingBookings.reduce(
      (sum, item) => sum + (Number(item.totalAmount) || 0),
      0
    );
    requestTotal =
      booking.mediaInvoice?.amount != null
        ? booking.mediaInvoice.amount
        : groupTotal;
    campaignLabel =
      booking.mediaCampaignName ||
      siblingBookings.find((item) => item.mediaCampaignName)?.mediaCampaignName ||
      booking.rateCard?.title ||
      null;

    const slotLabels = siblingBookings
      .map((item) => item.snapshotDescription)
      .filter(Boolean);
    summary = [
      campaignLabel,
      booking.rateCard?.title,
      siblingBookings.length > 1
        ? `${siblingBookings.length} slots`
        : slotLabels[0] || booking.row?.table?.section?.title,
    ]
      .filter(Boolean)
      .join(" · ");

    detailFields = (
      <>
        <Field label="Campaign">{campaignLabel}</Field>
        <Field label="Rate card">{booking.rateCard?.title}</Field>
        <Field label="Section">
          {booking.row?.table?.section?.title || "N/A"}
        </Field>
        <Field label="Slots">{siblingBookings.length}</Field>
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
    negotiateHref = `/media-agency/negotiations/start/RATE_CARD_BOOKING/${booking.id}`;
  }

  const siblingIds = siblingBookings.map((item) => item.id);
  const assets = await db.mediaCampaignAsset.findMany({
    where: {
      agencyId: mediaAgency.id,
      bookingType,
      bookingId: { in: siblingIds },
    },
    orderBy: { createdAt: "desc" },
  });

  const status = statusMeta(booking.status);
  const bookingIdsValue = siblingIds.join(",");

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

          {requestTotal != null ? (
            <div className="rounded-2xl border border-slate-100 bg-[#f7f8fc] px-4 py-3 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Request total
              </p>
              <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-950">
                {money(requestTotal)}
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

      {bookingType === "RATE_CARD" && siblingBookings.length > 0 ? (
        <section className={cn(mediaAgencyCardClass, "overflow-hidden p-0")}>
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Airtime slots
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-950">
              {siblingBookings.length} slot
              {siblingBookings.length === 1 ? "" : "s"} in this campaign
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {siblingBookings.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {item.snapshotDescription ||
                      item.row?.table?.section?.title ||
                      "Airtime slot"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {[
                      item.row?.table?.section?.title,
                      item.quantity ? `Qty ${item.quantity}` : null,
                      item.snapshotPrice != null
                        ? `Unit ${money(item.snapshotPrice)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-slate-950">
                  {item.totalAmount != null ? money(item.totalAmount) : "—"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
              <input type="hidden" name="bookingIds" value={bookingIdsValue} />
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
              <input type="hidden" name="bookingIds" value={bookingIdsValue} />
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
