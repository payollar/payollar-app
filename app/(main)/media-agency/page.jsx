import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { getClientCampaigns } from "@/actions/campaigns";
import { MediaAgencyPageShell } from "./_components/media-agency-page-shell";
import { MediaAgencyOverview } from "./_components/media-agency-overview";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";

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
      <MediaAgencyPageShell
        eyebrow="Media agency"
        title="Dashboard"
        description="Your agency workspace will appear here once your profile is ready."
      >
        <div className={`${DASHBOARD_CARD_CLASS} px-6 py-12 text-center`}>
          <p className="text-lg font-semibold text-slate-950">Profile setup required</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Your media agency profile is being set up. Complete your details in settings.
          </p>
          <Link
            href="/media-agency/settings"
            className="mt-6 inline-flex h-10 items-center rounded-full bg-[#0055ff] px-4 text-sm font-semibold text-white hover:bg-[#003ecc]"
          >
            Go to settings
          </Link>
        </div>
      </MediaAgencyPageShell>
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
