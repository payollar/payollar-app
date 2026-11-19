import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { getClientCampaigns } from "@/actions/campaigns";
import { MediaAgencyOverview } from "./_components/media-agency-overview";
import { CompleteAgencyProfile } from "./_components/complete-agency-profile";

export default async function MediaAgencyDashboard() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    include: {
      listings: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
      bookings: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          listing: { select: { id: true, name: true } },
        },
      },
      reports: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          listings: true,
          bookings: true,
          reports: true,
        },
      },
    },
  });

  if (!mediaAgency) {
    return (
      <CompleteAgencyProfile
        defaultEmail={user.email || ""}
        defaultContactName={user.name || ""}
      />
    );
  }

  const pendingBookings = mediaAgency.bookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookings = mediaAgency.bookings.filter((b) => b.status === "CONFIRMED").length;

  const campaignsData = await getClientCampaigns().catch(() => ({ campaigns: [] }));
  const talentCampaigns = (campaignsData.campaigns || []).map((c) => ({
    id: c.id,
    status: c.status,
    pendingApplications: c.pendingApplications ?? 0,
  }));

  const bookings = mediaAgency.bookings.map((booking) => ({
    id: booking.id,
    clientName: booking.clientName,
    packageName: booking.packageName,
    status: booking.status,
    totalAmount: booking.totalAmount,
    createdAt: booking.createdAt?.toISOString?.() || booking.createdAt,
    listing: booking.listing
      ? { id: booking.listing.id, name: booking.listing.name }
      : null,
  }));

  const reports = mediaAgency.reports.map((report) => ({
    id: report.id,
    title: report.title,
    reportType: report.reportType,
    startDate: report.startDate?.toISOString?.() || report.startDate,
    endDate: report.endDate?.toISOString?.() || report.endDate,
  }));

  return (
    <MediaAgencyOverview
      agencyName={mediaAgency.agencyName}
      contactName={mediaAgency.contactName}
      primaryMediaType={mediaAgency.primaryMediaType}
      stats={{
        totalListings: mediaAgency._count.listings,
        activeListings: mediaAgency.listings.length,
        totalBookings: mediaAgency._count.bookings,
        pendingBookings,
        confirmedBookings,
        totalReports: mediaAgency._count.reports,
      }}
      bookings={bookings}
      reports={reports}
      talentCampaigns={talentCampaigns}
    />
  );
}
