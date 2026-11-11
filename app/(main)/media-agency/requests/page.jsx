import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MediaAgencyPageShell,
  mediaAgencyCardClass,
} from "../_components/media-agency-page-shell";
import { BookingRequestRow } from "./_components/booking-request-row";
import { money, statusMeta } from "./_lib/request-helpers";

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

  const empty =
    mediaAgency.bookings.length === 0 &&
    mediaAgency.rateCardBookings.length === 0;

  return (
    <MediaAgencyPageShell
      eyebrow="Inbox"
      title="Booking requests"
      description="Manage and respond to booking requests from clients."
    >
      {empty ? (
        <section className={cn(mediaAgencyCardClass, "px-6 py-14 text-center")}>
          <Inbox className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-semibold text-slate-950">
            No booking requests
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Requests from clients will appear here
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {mediaAgency.bookings.map((booking) => {
            const status = statusMeta(booking.status);
            const summaryParts = [
              booking.listing?.name,
              booking.packageName || "Custom package",
              booking.duration,
            ].filter(Boolean);

            return (
              <BookingRequestRow
                key={`media-${booking.id}`}
                href={`/media-agency/requests/MEDIA/${booking.id}`}
                clientName={booking.clientName}
                clientEmail={booking.clientEmail}
                statusLabel={status.label}
                statusClassName={status.className}
                amountLabel={
                  booking.totalAmount != null ? money(booking.totalAmount) : null
                }
                summary={summaryParts.join(" · ")}
              />
            );
          })}

          {mediaAgency.rateCardBookings.map((booking) => {
            const status = statusMeta(booking.status);
            const summaryParts = [
              booking.rateCard?.title,
              booking.row?.table?.section?.title,
              booking.snapshotDescription,
            ].filter(Boolean);

            return (
              <BookingRequestRow
                key={`ratecard-${booking.id}`}
                href={`/media-agency/requests/RATE_CARD/${booking.id}`}
                clientName={booking.clientName}
                clientEmail={booking.clientEmail}
                statusLabel={status.label}
                statusClassName={status.className}
                amountLabel={
                  booking.totalAmount != null ? money(booking.totalAmount) : null
                }
                summary={summaryParts.join(" · ")}
              />
            );
          })}
        </div>
      )}
    </MediaAgencyPageShell>
  );
}
