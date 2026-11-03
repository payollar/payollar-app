import { Suspense } from "react";
import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { getAgencyBookingsForLinking } from "@/actions/media-agency-bookings";
import { MediaAgencyPageShell } from "../_components/media-agency-page-shell";
import { TransmissionCertificatesWorkspace } from "./_components/tc-workspace";

export const dynamic = "force-dynamic";

export default async function TransmissionCertificatesPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    include: {
      transmissionCertificates: {
        orderBy: { airDate: "desc" },
        take: 50,
      },
    },
  });

  if (!mediaAgency) {
    redirect("/media-agency/settings");
  }

  const bookingsResult = await getAgencyBookingsForLinking();
  const availableBookings = bookingsResult.success ? bookingsResult.bookings : [];

  return (
    <MediaAgencyPageShell
      eyebrow="Compliance"
      title="Transmission certificates"
      description="Upload proof that spots aired — link to bookings so clients can see them."
    >
      <Suspense
        fallback={
          <div className="h-72 animate-pulse rounded-2xl bg-white/80" />
        }
      >
        <TransmissionCertificatesWorkspace
          mediaAgencyId={mediaAgency.id}
          availableBookings={availableBookings}
          certificates={mediaAgency.transmissionCertificates}
        />
      </Suspense>
    </MediaAgencyPageShell>
  );
}
