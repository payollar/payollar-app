import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Inbox, BarChart3, TrendingUp, Calendar, Eye, Plus, Megaphone } from "lucide-react";
import { getClientCampaigns } from "@/actions/campaigns";
import { MediaAgencyPageShell } from "./_components/media-agency-page-shell";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

function bookingStatusClass(status) {
  switch (status) {
    case "PENDING":
      return "border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-300";
    case "CONFIRMED":
      return "border-primary/35 bg-primary/10 text-primary";
    case "COMPLETED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300";
    case "CANCELLED":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

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
      },
      bookings: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          listing: true,
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
        <Card className={DASHBOARD_CARD_CLASS}>
          <CardContent className="pt-8 pb-8">
            <div className="py-6 text-center">
              <Building2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
              <h3 className="mb-2 text-lg font-semibold">Profile setup required</h3>
              <p className="mb-6 text-muted-foreground">
                Your media agency profile is being set up. Complete your details in settings.
              </p>
              <Button variant="marketing" className="rounded-full" asChild>
                <Link href="/media-agency/settings">Go to settings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </MediaAgencyPageShell>
    );
  }

  const totalListings = mediaAgency._count.listings;
  const totalBookings = mediaAgency._count.bookings;
  const totalReports = mediaAgency._count.reports;
  const pendingBookings = mediaAgency.bookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookings = mediaAgency.bookings.filter((b) => b.status === "CONFIRMED").length;

  const campaignsData = await getClientCampaigns().catch(() => ({ campaigns: [] }));
  const talentCampaigns = campaignsData.campaigns || [];
  const activeTalentCampaigns = talentCampaigns.filter((c) => c.status === "ACTIVE").length;
  const pendingApplications = talentCampaigns.reduce(
    (acc, c) => acc + (c.pendingApplications ?? 0),
    0
  );

  const formatReportType = (type) =>
    type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");

  return (
    <MediaAgencyPageShell
      eyebrow="Overview"
      title="Dashboard"
      description={`Welcome back, ${mediaAgency.contactName}. Track listings, bookings, and reports in one place.`}
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card className={DASHBOARD_CARD_CLASS}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active listings</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{totalListings}</div>
              <p className="text-xs text-muted-foreground">{mediaAgency.listings.length} currently active</p>
            </CardContent>
          </Card>

          <Card className={DASHBOARD_CARD_CLASS}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total bookings</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className={DASHBOARD_CARD_CLASS}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending requests</CardTitle>
              <Inbox className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{pendingBookings}</div>
              <p className="text-xs text-muted-foreground">Awaiting your response</p>
            </CardContent>
          </Card>

          <Card className={DASHBOARD_CARD_CLASS}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{confirmedBookings}</div>
              <p className="text-xs text-muted-foreground">Active campaigns</p>
            </CardContent>
          </Card>

          <Card className={DASHBOARD_CARD_CLASS}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campaign reports</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{totalReports}</div>
              <p className="text-xs text-muted-foreground">Performance reports generated</p>
            </CardContent>
          </Card>
        </div>

        <Card className={DASHBOARD_CARD_CLASS}>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Post a talent campaign</CardTitle>
              <CardDescription>
                {activeTalentCampaigns > 0
                  ? `${activeTalentCampaigns} active campaign${activeTalentCampaigns === 1 ? "" : "s"} · ${pendingApplications} pending application${pendingApplications === 1 ? "" : "s"}`
                  : "Reach creators directly — publish campaigns, review applications, and book talent like clients do."}
              </CardDescription>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button variant="marketing" size="sm" className="rounded-full" asChild>
                <Link href="/media-agency/campaigns?create=true">
                  <Plus className="mr-2 h-4 w-4" />
                  New campaign
                </Link>
              </Button>
              <Button variant="marketingOutline" size="sm" className="rounded-full" asChild>
                <Link href="/media-agency/campaigns">
                  <Megaphone className="mr-2 h-4 w-4" />
                  Manage campaigns
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className={DASHBOARD_CARD_CLASS}>
          <CardHeader>
            <CardTitle>Recent booking requests</CardTitle>
            <CardDescription>Latest requests from clients</CardDescription>
          </CardHeader>
          <CardContent>
            {mediaAgency.bookings.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Inbox className="mx-auto mb-4 h-12 w-12 opacity-40" />
                <p>No booking requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mediaAgency.bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h4 className="font-medium">{booking.clientName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.listing.name} • {booking.packageName || "Custom package"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <Badge variant="outline" className={cn("font-medium", bookingStatusClass(booking.status))}>
                        {booking.status}
                      </Badge>
                      {booking.totalAmount != null ? (
                        <p className="mt-2 text-sm font-semibold tabular-nums">₵{booking.totalAmount.toFixed(2)}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={DASHBOARD_CARD_CLASS}>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Campaign reports</CardTitle>
                <CardDescription>Recent performance and campaign reports</CardDescription>
              </div>
              <Button variant="marketingOutline" size="sm" className="rounded-full shrink-0" asChild>
                <Link href="/media-agency/reporting">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View all
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {mediaAgency.reports.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-40" />
                <p className="mb-1">No campaign reports yet</p>
                <p className="mb-4 text-sm">Create your first report to track performance</p>
                <Button variant="marketingOutline" size="sm" className="rounded-full" asChild>
                  <Link href="/media-agency/reporting">
                    <Plus className="mr-2 h-4 w-4" />
                    Create report
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {mediaAgency.reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex flex-col gap-4 rounded-xl border border-border/50 bg-background/40 p-4 transition-colors hover:border-primary/25 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold">{report.title}</h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="text-xs font-medium">
                              {formatReportType(report.reportType)}
                            </Badge>
                            <span>
                              {new Date(report.startDate).toLocaleDateString()} –{" "}
                              {new Date(report.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {report.content ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground pl-11">{report.content}</p>
                      ) : null}
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 rounded-full" asChild>
                      <Link href={`/media-agency/reporting/${report.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
                {mediaAgency.reports.length >= 5 ? (
                  <div className="border-t border-border/50 pt-4">
                    <Button variant="ghost" className="w-full rounded-full" asChild>
                      <Link href="/media-agency/reporting">View all reports</Link>
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MediaAgencyPageShell>
  );
}
