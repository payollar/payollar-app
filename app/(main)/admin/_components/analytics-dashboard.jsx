"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  DollarSign,
  ShoppingBag,
  BarChart3,
  Radio,
  TrendingUp,
  CreditCard,
  Package,
  Building2,
  Activity,
} from "lucide-react";

// Simple bar chart component
function BarChart({ data, label }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center justify-end h-full gap-1">
              <div
                className="w-full bg-primary/60 rounded-t transition-all hover:bg-primary/80"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  minHeight: "4px",
                }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
            <span className="text-xs text-muted-foreground text-center">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/60 rounded" />
          <span className="text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}

// Simple line chart component
function LineChart({ data }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  
  return (
    <div className="space-y-4">
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 200 - (item.value / maxValue) * 200;
              return `${x},${y}`;
            }).join(" ")}
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 400;
            const y = 200 - (item.value / maxValue) * 200;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="hsl(var(--primary))"
                className="hover:r-6 transition-all"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {data.map((item, index) => (
          <span key={index} className={index % 2 === 0 ? "" : "opacity-0"}>
            {item.label}
          </span>
        )).filter((_, i) => i % 2 === 0)}
      </div>
    </div>
  );
}

export function AnalyticsDashboard({ analytics }) {
  if (!analytics) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading analytics...
      </div>
    );
  }

  const {
    users,
    appointments,
    payouts,
    products,
    campaigns,
    mediaAgencies,
    credits,
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users?.total || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {users?.recent || 0} new this week
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
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold">{appointments?.total || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {appointments?.recent || 0} this week
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Payouts</p>
                <p className="text-2xl font-bold">${(payouts?.totalAmount || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {payouts?.processed || 0} processed
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold">{products?.active || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {products?.total || 0} total
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <p className="text-sm text-muted-foreground">
              New users per month
            </p>
          </CardHeader>
          <CardContent>
            <BarChart
              data={users?.monthlyData?.map(item => ({
                label: item.month,
                value: item.users,
              })) || []}
              label="New Users"
            />
          </CardContent>
        </Card>

        {/* Platform Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
            <p className="text-sm text-muted-foreground">
              Key metrics overview
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="font-medium">Active Campaigns</span>
                </div>
                <span className="text-2xl font-bold">{campaigns?.active || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Radio className="h-5 w-5 text-primary" />
                  <span className="font-medium">Media Listings</span>
                </div>
                <span className="text-2xl font-bold">{mediaAgencies?.listings || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-medium">Total Credits</span>
                </div>
                <span className="text-2xl font-bold">{credits?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-medium">Avg Credits/Creator</span>
                </div>
                <span className="text-2xl font-bold">{credits?.average || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Appointments Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments?.byStatus?.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">
                    {status.status?.toLowerCase() || "Unknown"}
                  </span>
                  <span className="text-lg font-semibold">{status._count || 0}</span>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No appointment data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payouts Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-semibold">{payouts?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="text-lg font-semibold text-amber-500">{payouts?.pending || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Processed</span>
                <span className="text-lg font-semibold text-emerald-500">{payouts?.processed || 0}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="text-lg font-bold text-primary">
                  ${(payouts?.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Agencies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Media Agencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Agencies</span>
                <span className="text-lg font-semibold">{mediaAgencies?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Verified</span>
                <span className="text-lg font-semibold text-emerald-500">{mediaAgencies?.verified || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Listings</span>
                <span className="text-lg font-semibold">{mediaAgencies?.listings || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
