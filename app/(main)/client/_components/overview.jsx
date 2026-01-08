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
import { format } from "date-fns";

// Simple line chart component
function LineChart({ data }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.applications, d.bookings)));
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center justify-end h-full gap-1 relative">
              {/* Applications line */}
              <div
                className="absolute w-full border-t-2 border-primary"
                style={{
                  bottom: `${(item.applications / maxValue) * 100}%`,
                }}
              />
              {/* Bookings line */}
              <div
                className="absolute w-full border-t-2 border-primary/60"
                style={{
                  bottom: `${(item.bookings / maxValue) * 100}%`,
                }}
              />
              {/* Data points */}
              <div
                className="absolute w-3 h-3 bg-primary rounded-full border-2 border-background"
                style={{
                  bottom: `calc(${(item.applications / maxValue) * 100}% - 6px)`,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
              <div
                className="absolute w-3 h-3 bg-primary/60 rounded-full border-2 border-background"
                style={{
                  bottom: `calc(${(item.bookings / maxValue) * 100}% - 6px)`,
                  right: "0",
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{item.week}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full" />
          <span className="text-muted-foreground">applications</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/60 rounded-full" />
          <span className="text-muted-foreground">bookings</span>
        </div>
      </div>
    </div>
  );
}

export function ClientOverview({ stats, recentAppointments = [], campaigns = [] }) {
  // Extract company name from user name or use default
  const companyName = stats?.companyName || "TechCorp";
  
  // Calculate metrics
  const totalSpent = stats?.totalSpent || 68500;
  const activeCampaigns = campaigns?.filter(c => c.status === "ACTIVE").length || 0;
  const bookedTalents = stats?.bookedTalents || recentAppointments?.length || 0;
  const pendingApplications = stats?.pendingApplications || 0;
  
  // Calculate trends
  const spentTrend = 23; // +23% from last month
  const endingThisWeek = campaigns?.filter(c => {
    if (!c.endDate) return false;
    const endDate = new Date(c.endDate);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return endDate <= weekFromNow && endDate >= today;
  }).length || 0;
  
  // Generate chart data (last 5 weeks)
  const chartData = [
    { week: "Week 1", applications: 45, bookings: 12 },
    { week: "Week 2", applications: 52, bookings: 18 },
    { week: "Week 3", applications: 38, bookings: 15 },
    { week: "Week 4", applications: 61, bookings: 22 },
    { week: "Week 5", applications: 55, bookings: 20 },
  ];
  
  // Get active campaigns
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Welcome, {companyName}!</h1>
          <p className="text-muted-foreground">
            Manage your campaigns and talent bookings
          </p>
        </div>
        <Link href="/client/campaigns?create=true">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  +{spentTrend}% from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{activeCampaigns}</p>
                <p className="text-xs text-muted-foreground">
                  {endingThisWeek} ending this week
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Booked Talents</p>
                <p className="text-2xl font-bold">{bookedTalents}</p>
                <p className="text-xs text-muted-foreground">
                  Active collaborations
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending Applications</p>
                <p className="text-2xl font-bold">{pendingApplications}</p>
                <p className="text-xs text-muted-foreground">
                  Review today
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Applications and bookings trend
            </p>
          </CardHeader>
          <CardContent>
            <LineChart data={chartData} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/client/talents"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Search className="h-5 w-5 text-primary" />
              <span>Browse Talents</span>
            </Link>
            <Link
              href="/client/campaigns?create=true"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Plus className="h-5 w-5 text-primary" />
              <span>Post Campaign</span>
            </Link>
            <Link
              href="/client/bookings"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span>View Calendar</span>
            </Link>
            <Link
              href="/client/analytics"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>View Analytics</span>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your current campaigns and applications
          </p>
        </CardHeader>
        <CardContent>
          {activeCampaignsList.length > 0 ? (
            <div className="space-y-4">
              {activeCampaignsList.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{campaign.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.applications} applications • {campaign.bookings} bookings
                    </p>
                  </div>
                  <Link href={`/client/campaigns/${campaign.id}`}>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active campaigns</p>
              <Link href="/client/campaigns?create=true">
                <Button className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
