import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox, CheckCircle, XCircle, FileText, Upload, MessageSquare, Receipt } from "lucide-react";
import { updateBookingStatus } from "./actions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  MediaAgencyPageShell,
  mediaAgencyCardClass,
} from "../_components/media-agency-page-shell";
import { BookingNotes } from "./_components/booking-notes";
import { BookingCreatives } from "./_components/booking-creatives";

function statusMeta(status) {
  if (status === "PENDING") {
    return { label: "Pending", className: "border-amber-200 bg-amber-50 text-amber-800" };
  }
  if (status === "CONFIRMED") {
    return { label: "Confirmed", className: "border-slate-200 bg-slate-100 text-slate-700" };
  }
  if (status === "COMPLETED") {
    return { label: "Completed", className: "border-emerald-200 bg-emerald-50 text-emerald-800" };
  }
  if (status === "CANCELLED") {
    return { label: "Cancelled", className: "border-rose-200 bg-rose-50 text-rose-700" };
  }
  return { label: status, className: "border-slate-200 bg-slate-50 text-slate-700" };
}

function initials(name) {
  return String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-slate-800">{children}</p>
    </div>
  );
}

function money(value) {
  return `₵${Number(value).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Negotiate only for unpaid pending quotes — hide once paid/confirmed. */
function canNegotiate(booking) {
  if (booking.status !== "PENDING") return false;
  if (booking.mediaInvoice) return false;
  if (booking.totalAmount == null || Number(booking.totalAmount) <= 0) return false;
  return true;
}

export default async function MediaAgencyRequestsPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        include: {
          listing: true,
        },
      },
      rateCardBookings: {
        orderBy: { createdAt: "desc" },
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
                    select: {
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!mediaAgency) {
    redirect("/media-agency/settings");
  }

  const campaignAssets = await db.mediaCampaignAsset.findMany({
    where: { agencyId: mediaAgency.id },
    orderBy: { createdAt: "desc" },
  });
  const assetsByBooking = {};
  for (const asset of campaignAssets) {
    const key = `${asset.bookingType}:${asset.bookingId}`;
    if (!assetsByBooking[key]) assetsByBooking[key] = [];
    assetsByBooking[key].push(asset);
  }

  const empty =
    mediaAgency.bookings.length === 0 && mediaAgency.rateCardBookings.length === 0;

  return (
    <MediaAgencyPageShell
      eyebrow="Inbox"
      title="Booking requests"
      description="Manage and respond to booking requests from clients."
    >
      {empty ? (
        <section className={cn(mediaAgencyCardClass, "px-6 py-14 text-center")}>
          <Inbox className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-semibold text-slate-950">No booking requests</p>
          <p className="mt-1 text-sm text-slate-500">Requests from clients will appear here</p>
        </section>
      ) : (
        <div className={cn(mediaAgencyCardClass, "divide-y divide-slate-200 overflow-hidden p-0")}>
          {mediaAgency.bookings.map((booking) => {
            const status = statusMeta(booking.status);
            return (
              <article key={`media-${booking.id}`} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-semibold text-white">
                      {initials(booking.clientName)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-slate-950">
                          {booking.clientName}
                        </h3>
                        <Badge variant="outline" className={cn("rounded-full", status.className)}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-slate-500">{booking.clientEmail}</p>
                    </div>
                  </div>
                  {booking.totalAmount != null ? (
                    <div className="text-right">
                      <p className="text-lg font-semibold tabular-nums text-slate-950">
                        {money(booking.totalAmount)}
                      </p>
                      <p className="text-[11px] text-slate-400">Total</p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-3 rounded-2xl border border-slate-100 bg-[#f7f8fc] p-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Listing">{booking.listing.name}</Field>
                  <Field label="Package">{booking.packageName || "Custom package"}</Field>
                  {booking.duration ? <Field label="Duration">{booking.duration}</Field> : null}
                  {booking.slots ? <Field label="Spots">{booking.slots}</Field> : null}
                  {booking.startDate ? (
                    <Field label="Start">{new Date(booking.startDate).toLocaleDateString()}</Field>
                  ) : null}
                  {booking.endDate ? (
                    <Field label="End">{new Date(booking.endDate).toLocaleDateString()}</Field>
                  ) : null}
                </div>

                <BookingNotes notes={booking.notes} />
                <BookingCreatives assets={assetsByBooking[`MEDIA:${booking.id}`] || []} />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400">
                    Requested on {new Date(booking.createdAt).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {canNegotiate(booking) ? (
                      <Button size="sm" variant="outline" className="rounded-full border-slate-200" asChild>
                        <Link href={`/media-agency/negotiations/start/MEDIA_BOOKING/${booking.id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Negotiate
                        </Link>
                      </Button>
                    ) : null}
                    {booking.status === "PENDING" ? (
                      <>
                        <form action={updateBookingStatus}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <input type="hidden" name="bookingType" value="MEDIA" />
                          <input type="hidden" name="status" value="CONFIRMED" />
                          <Button type="submit" size="sm" variant="black" className="rounded-full">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                          </Button>
                        </form>
                        <form action={updateBookingStatus}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <input type="hidden" name="bookingType" value="MEDIA" />
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
                    {(booking.status === "CONFIRMED" || booking.status === "COMPLETED") && (
                      <>
                        <Button size="sm" variant="outline" className="rounded-full border-slate-200" asChild>
                          <Link
                            href={`/media-agency/transmission-certificates?bookingId=${booking.id}&bookingType=MEDIA`}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload certificate
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full border-slate-200" asChild>
                          <Link href={`/media-agency/reporting?bookingId=${booking.id}&bookingType=MEDIA`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Create report
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {mediaAgency.rateCardBookings.map((booking) => {
            const status = statusMeta(booking.status);
            return (
              <article key={`ratecard-${booking.id}`} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-semibold text-white">
                      {initials(booking.clientName)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-slate-950">
                          {booking.clientName}
                        </h3>
                        <Badge variant="outline" className={cn("rounded-full", status.className)}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-slate-500">{booking.clientEmail}</p>
                    </div>
                  </div>
                  {booking.totalAmount != null ? (
                    <div className="text-right">
                      <p className="text-lg font-semibold tabular-nums text-slate-950">
                        {money(booking.totalAmount)}
                      </p>
                      <p className="text-[11px] text-slate-400">Total</p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-3 rounded-2xl border border-slate-100 bg-[#f7f8fc] p-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Rate card">{booking.rateCard.title}</Field>
                  <Field label="Section">{booking.row?.table?.section?.title || "N/A"}</Field>
                  {booking.snapshotDescription ? (
                    <Field label="Description">{booking.snapshotDescription}</Field>
                  ) : null}
                  {booking.quantity ? <Field label="Quantity">{booking.quantity}</Field> : null}
                  {booking.startDate ? (
                    <Field label="Start">{new Date(booking.startDate).toLocaleDateString()}</Field>
                  ) : null}
                  {booking.endDate ? (
                    <Field label="End">{new Date(booking.endDate).toLocaleDateString()}</Field>
                  ) : null}
                  {booking.snapshotPrice != null ? (
                    <Field label="Unit price">{money(booking.snapshotPrice)}</Field>
                  ) : null}
                </div>

                <BookingNotes notes={booking.notes} />
                <BookingCreatives
                  assets={assetsByBooking[`RATE_CARD:${booking.id}`] || []}
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400">
                    Requested on {new Date(booking.createdAt).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {canNegotiate(booking) ? (
                      <Button size="sm" variant="outline" className="rounded-full border-slate-200" asChild>
                        <Link href={`/media-agency/negotiations/start/RATE_CARD_BOOKING/${booking.id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Negotiate
                        </Link>
                      </Button>
                    ) : null}
                    {booking.status === "PENDING" ? (
                      <>
                        <form action={updateBookingStatus}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <input type="hidden" name="bookingType" value="RATE_CARD" />
                          <input type="hidden" name="status" value="CONFIRMED" />
                          <Button type="submit" size="sm" variant="black" className="rounded-full">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                          </Button>
                        </form>
                        <form action={updateBookingStatus}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <input type="hidden" name="bookingType" value="RATE_CARD" />
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
                      <Button size="sm" variant="outline" className="rounded-full border-slate-200" asChild>
                        <Link href={`/media-agency/invoices/${booking.mediaInvoice.id}`}>
                          <Receipt className="mr-2 h-4 w-4" />
                          Receipt {booking.mediaInvoice.invoiceNumber}
                        </Link>
                      </Button>
                    ) : null}
                    {(booking.status === "CONFIRMED" || booking.status === "COMPLETED") && (
                      <>
                        <Button size="sm" variant="outline" className="rounded-full border-slate-200" asChild>
                          <Link
                            href={`/media-agency/transmission-certificates?bookingId=${booking.id}&bookingType=RATE_CARD`}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload certificate
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full border-slate-200" asChild>
                          <Link href={`/media-agency/reporting?bookingId=${booking.id}&bookingType=RATE_CARD`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Create report
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </MediaAgencyPageShell>
  );
}
