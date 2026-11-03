import { Suspense } from "react";
import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { ReportingWorkspace } from "./_components/reporting-workspace";
import { getAgencyBookingsForLinking } from "@/actions/media-agency-bookings";
import { MediaAgencyPageShell } from "../_components/media-agency-page-shell";

export const dynamic = "force-dynamic";

export default async function MediaAgencyReportingPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    include: {
      reports: {
        orderBy: { createdAt: "desc" },
        take: 20,
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
      eyebrow="Analytics"
      title="Reporting"
      description="Share campaign results with clients — link reports to bookings when you can."
    >
      <Suspense
        fallback={
          <div className="h-72 animate-pulse rounded-2xl bg-white/80" />
        }
      >
        <ReportingWorkspace
          mediaAgencyId={mediaAgency.id}
          availableBookings={availableBookings}
          reports={mediaAgency.reports}
        />
      </Suspense>
    </MediaAgencyPageShell>
  );
}
