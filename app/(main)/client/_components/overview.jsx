"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  BarChart3,
  Users,
  Calendar,
  Search,
  Plus,
  Calendar as CalendarIcon,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { ClientPageShell, clientCardClass } from "./client-page-shell";

function LineChart({ data }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.applications, d.bookings)), 1);

  return (
    <div className="space-y-4">
      <div className="flex h-48 items-end justify-between gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-full w-full flex-col items-center justify-end gap-1">
              <div
                className="absolute w-full border-t-2 border-primary"
                style={{
                  bottom: `${(item.applications / maxValue) * 100}%`,
                }}
              />
              <div
                className="absolute w-full border-t-2 border-primary/60"
                style={{
                  bottom: `${(item.bookings / maxValue) * 100}%`,
                }}
              />
              <div
                className="absolute h-3 w-3 rounded-full border-2 border-background bg-primary"
                style={{
                  bottom: `calc(${(item.applications / maxValue) * 100}% - 6px)`,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
              <div
                className="absolute right-0 h-3 w-3 rounded-full border-2 border-background bg-primary/60"
                style={{
                  bottom: `calc(${(item.bookings / maxValue) * 100}% - 6px)`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{item.week}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Applications</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary/60" />
          <span className="text-muted-foreground">Bookings</span>
        </div>
      </div>
    </div>
  );
}

export function ClientOverview({ stats, recentAppointments = [], campaigns = [] }) {
  const companyName = stats?.companyName || "there";

  const totalSpent = stats?.totalSpent || 0;
  const activeCampaigns = campaigns?.filter((c) => c.status === "ACTIVE").length || 0;
  const bookedTalents = stats?.bookedTalents || recentAppointments?.length || 0;
  const pendingApplications = stats?.pendingApplications || 0;

  const spentTrend = 23;
  const endingThisWeek =
    campaigns?.filter((c) => {
      if (!c.endDate) return false;
      const endDate = new Date(c.endDate);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return endDate <= weekFromNow && endDate >= today;
    }).length || 0;

  const chartData = [
    { week: "Week 1", applications: 45, bookings: 12 },
    { week: "Week 2", applications: 52, bookings: 18 },
    { week: "Week 3", applications: 38, bookings: 15 },
    { week: "Week 4", applications: 61, bookings: 22 },
    { week: "Week 5", applications: 55, bookings: 20 },
  ];

  const activeCampaignsList = campaigns
    .filter((c) => c.status === "ACTIVE")
    .slice(0, 5)
    .map((campaign) => ({
      id: campaign.id,
      title: campaign.title || `Campaign ${campaign.id.slice(0, 8)}`,
      applications: campaign._count?.applications || 0,
      bookings: campaign._count?.bookings || 0,
    }));

  return (
    <ClientPageShell
      eyebrow="Overview"
      title={`Welcome, ${companyName}`}
      description="Manage your campaigns, applications, and talent bookings in one place."
      actions={
        <Button variant="marketing" size="lg" className="gap-2" asChild>
          <Link href="/client/campaigns?create=true">
            <Plus className="h-4 w-4" />
            New campaign
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={clientCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Total spent</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  ₵{Number(totalSpent).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">+{spentTrend}% from last month</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Active campaigns</p>
                <p className="text-2xl font-bold tabular-nums text-primary">{activeCampaigns}</p>
                <p className="text-xs text-muted-foreground">
                  {endingThisWeek} ending this week
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Booked talents</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">{bookedTalents}</p>
                <p className="text-xs text-muted-foreground">Active collaborations</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Pending applications</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">{pendingApplications}</p>
                <p className="text-xs text-muted-foreground">Review when ready</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className={clientCardClass}>
          <CardHeader>
            <CardTitle className="text-foreground">Campaign performance</CardTitle>
            <p className="text-sm text-muted-foreground">Applications and bookings trend</p>
          </CardHeader>
          <CardContent>
            <LineChart data={chartData} />
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardHeader>
            <CardTitle className="text-foreground">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Link
              href="/client/talents"
              className="flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border/60 hover:bg-muted/40"
            >
              <Search className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Browse talents</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/client/campaigns?create=true"
              className="flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border/60 hover:bg-muted/40"
            >
              <Plus className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Post a campaign</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/client/bookings"
              className="flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border/60 hover:bg-muted/40"
            >
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">View bookings</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/client/campaigns"
              className="flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border/60 hover:bg-muted/40"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Campaign insights</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className={clientCardClass}>
        <CardHeader>
          <CardTitle className="text-foreground">Active campaigns</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage current campaigns and applications
          </p>
        </CardHeader>
        <CardContent>
          {activeCampaignsList.length > 0 ? (
            <div className="space-y-3">
              {activeCampaignsList.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-foreground">{campaign.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.applications} applications · {campaign.bookings} bookings
                    </p>
                  </div>
                  <Button variant="glass" size="sm" asChild>
                    <Link href="/client/campaigns">Open campaigns</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              <BarChart3 className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p className="mb-4">No active campaigns yet</p>
              <Button variant="marketingOutline" asChild>
                <Link href="/client/campaigns?create=true">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first campaign
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </ClientPageShell>
  );
}
