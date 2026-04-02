"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Calendar,
  UserSearch,
  TrendingUp,
  Zap,
  Calendar as CalendarIcon,
  Users,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CreatorParticles } from "./creator-page-shell";

// Simple bar chart component
function BarChart({ data }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.earnings, d.bookings)));
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center justify-end h-full gap-1">
              <div
                className="w-full rounded-t bg-primary shadow-[0_0_12px_rgba(0,85,255,0.25)]"
                style={{
                  height: `${(item.earnings / maxValue) * 100}%`,
                  minHeight: "4px",
                }}
              />
              <div
                className="w-full rounded-t bg-primary/40"
                style={{
                  height: `${(item.bookings / maxValue) * 100}%`,
                  minHeight: "4px",
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{item.month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary shadow-[0_0_8px_rgba(0,85,255,0.35)]" />
          <span className="text-muted-foreground">Earnings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary/40" />
          <span className="text-muted-foreground">Bookings</span>
        </div>
      </div>
    </div>
  );
}

export function OverviewPage({ user, earnings = {}, payouts = [], appointments = [] }) {
  // Extract first name from user name
  const firstName = user?.name?.split(" ")[0] || "Creator";
  
  // Calculate metrics
  const totalEarnings = earnings?.totalEarnings || 0;
  const bookingsCount = earnings?.completedAppointments || appointments.length || 0;
  const profileViews = 1240; // Mock data - you can replace with actual data
  const conversionRate = 3.4; // Mock data - you can replace with actual calculation
  
  // Calculate trends
  const earningsTrend = 12; // +12% from last month
  const bookingsTrend = 8; // +8 this month
  const viewsTrend = 18; // +18% growth
  const conversionTrend = 0.5; // +0.5% improvement
  
  // Generate chart data (last 6 months)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const chartData = months.map((month, index) => ({
    month,
    earnings: Math.floor(Math.random() * 8000) + 2000,
    bookings: Math.floor(Math.random() * 20) + 5,
  }));
  
  // Get recent bookings (last 5)
  const recentBookings = appointments
    .filter((apt) => apt.status === "CONFIRMED" || apt.status === "COMPLETED")
    .slice(0, 5)
    .map((apt) => ({
      id: apt.id,
      title: apt.title || `Booking #${apt.id.slice(0, 8)}`,
      dueDate: apt.scheduledAt ? format(new Date(apt.scheduledAt), "MMM d, yyyy") : "N/A",
      amount: apt.price || 0,
      status: apt.status,
    }));

  const kpiCardClass =
    "rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md";

  return (
    <div className="relative mx-auto max-w-7xl">
      <CreatorParticles />
      <div className="relative z-[1] space-y-8">
      {/* Welcome Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Here&apos;s your performance overview — earnings, bookings, and quick
            actions in one place.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={kpiCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold tabular-nums">
                  ₵{totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  +{earningsTrend}% from last month
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={kpiCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Bookings</p>
                <p className="text-2xl font-bold tabular-nums">{bookingsCount}</p>
                <p className="text-xs text-muted-foreground">
                  +{bookingsTrend} this month
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={kpiCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold tabular-nums">
                  {profileViews.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  +{viewsTrend}% growth
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                <UserSearch className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={kpiCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold tabular-nums">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground">
                  +{conversionTrend}% improvement
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings & Bookings Trend Chart */}
      <Card className="rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Earnings &amp; bookings trend
          </CardTitle>
          <p className="text-sm text-muted-foreground">Last 6 months (sample)</p>
        </CardHeader>
        <CardContent>
          <BarChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Jump to the tools you use most
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/creator/profile", icon: Zap, label: "Update profile" },
              {
                href: "/creator/availability",
                icon: CalendarIcon,
                label: "Manage availability",
              },
              { href: "/creator/bookings", icon: Users, label: "View bookings" },
              { href: "/creator/analytics", icon: BarChart3, label: "Full analytics" },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-xl border border-transparent p-3 transition-colors",
                  "hover:border-primary/25 hover:bg-primary/[0.06]"
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10 transition group-hover:bg-primary/15">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <span className="font-medium">{label}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent bookings</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your latest confirmed bookings
            </p>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/40 p-3 transition hover:border-primary/20"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-medium">{booking.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.dueDate}
                      </p>
                    </div>
                    <div className="shrink-0 space-y-1 text-right">
                      <p className="font-semibold tabular-nums">
                        ₵{Number(booking.amount).toLocaleString()}
                      </p>
                      <Badge
                        variant="minimal"
                        className="text-[10px] uppercase tracking-wide"
                      >
                        {booking.status === "COMPLETED" ? "Completed" : "Confirmed"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-3 h-12 w-12 opacity-40" />
                <p>No recent bookings</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
