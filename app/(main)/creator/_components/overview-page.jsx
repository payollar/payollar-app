"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Calendar,
  UserSearch,
  TrendingUp,
  Zap,
  Calendar as CalendarIcon,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

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
                className="w-full bg-primary/60 rounded-t"
                style={{
                  height: `${(item.earnings / maxValue) * 100}%`,
                  minHeight: "4px",
                }}
              />
              <div
                className="w-full bg-primary/30 rounded-t"
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
      <div className="flex items-center gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/60 rounded" />
          <span className="text-muted-foreground">earnings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/30 rounded" />
          <span className="text-muted-foreground">bookings</span>
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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {firstName}!</h1>
        <p className="text-muted-foreground">Here's your performance overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  +{earningsTrend}% from last month
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
                <p className="text-sm text-muted-foreground">Bookings</p>
                <p className="text-2xl font-bold">{bookingsCount}</p>
                <p className="text-xs text-muted-foreground">
                  +{bookingsTrend} this month
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold">{profileViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  +{viewsTrend}% growth
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserSearch className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground">
                  +{conversionTrend}% improvement
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings & Bookings Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings & Bookings Trend</CardTitle>
          <p className="text-sm text-muted-foreground">Last 6 months performance</p>
        </CardHeader>
        <CardContent>
          <BarChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/creator/profile"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Zap className="h-5 w-5 text-primary" />
              <span>Update Profile</span>
            </Link>
            <Link
              href="/creator/availability"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span>Manage Availability</span>
            </Link>
            <Link
              href="/creator/bookings"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Users className="h-5 w-5 text-primary" />
              <span>View Pending Requests</span>
            </Link>
            <Link
              href="/creator/analytics"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>View Full Analytics</span>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <p className="text-sm text-muted-foreground">Your latest confirmed bookings</p>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{booking.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {booking.dueDate}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">${booking.amount.toLocaleString()}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {booking.status === "COMPLETED" ? "Completed" : "Confirmed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent bookings</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
