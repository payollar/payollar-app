"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Package,
  BarChart3,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

// Simple bar chart component
function BarChart({ data }) {
  const maxEarnings = Math.max(...data.map((d) => d.earnings), 1);
  const maxBookings = Math.max(...data.map((d) => d.bookings), 1);
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-40 sm:h-48 gap-1 sm:gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center justify-end h-full gap-1 relative">
              {/* Earnings bar */}
              <div
                className="w-full bg-emerald-600 rounded-t transition-all"
                style={{
                  height: `${(item.earnings / maxEarnings) * 100}%`,
                  minHeight: item.earnings > 0 ? "4px" : "0px",
                }}
                title={`₵${item.earnings.toFixed(2)}`}
              />
              {/* Bookings bar */}
              <div
                className="w-full bg-emerald-400/60 rounded-t transition-all"
                style={{
                  height: `${(item.bookings / maxBookings) * 100}%`,
                  minHeight: item.bookings > 0 ? "4px" : "0px",
                }}
                title={`${item.bookings} bookings`}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{item.month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 justify-center text-xs sm:text-sm pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-600 rounded" />
          <span className="text-muted-foreground">Earnings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-400/60 rounded" />
          <span className="text-muted-foreground">Bookings</span>
        </div>
      </div>
    </div>
  );
}

// Revenue trend chart
function RevenueChart({ data }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-32 sm:h-40 gap-1 sm:gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center h-full">
              <div
                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all"
                style={{
                  height: `${(item.revenue / maxRevenue) * 100}%`,
                  minHeight: item.revenue > 0 ? "4px" : "0px",
                }}
                title={`₵${item.revenue.toFixed(2)}`}
              />
            </div>
            <span className="text-xs text-muted-foreground">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Trend indicator component
function TrendIndicator({ value, isPositive = true }) {
  if (value === 0) {
    return <span className="text-xs text-muted-foreground">No change</span>;
  }
  
  return (
    <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      <span>{Math.abs(value).toFixed(1)}%</span>
    </div>
  );
}

export function CreatorAnalyticsClient({ analytics, user }) {
  const { productSales, appointments, monthlyData, topProducts, categoryBreakdown, recentSales, recentAppointments } = analytics;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your performance, earnings, and growth
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <Card className="border-emerald-900/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                  ₵{productSales.totalRevenue.toFixed(2)}
                </p>
                <div className="flex items-center gap-2">
                  <TrendIndicator 
                    value={productSales.revenueTrend} 
                    isPositive={productSales.revenueTrend >= 0}
                  />
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="bg-emerald-900/20 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Earnings */}
        <Card className="border-emerald-900/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                  ₵{productSales.totalEarnings.toFixed(2)}
                </p>
                <div className="flex items-center gap-2">
                  <TrendIndicator 
                    value={productSales.earningsTrend} 
                    isPositive={productSales.earningsTrend >= 0}
                  />
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="bg-emerald-900/20 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="border-emerald-900/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  {appointments.total}
                </p>
                <div className="flex items-center gap-2">
                  <TrendIndicator 
                    value={appointments.trend} 
                    isPositive={appointments.trend >= 0}
                  />
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="bg-emerald-900/20 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Sales */}
        <Card className="border-emerald-900/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Product Sales</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  {productSales.totalSales}
                </p>
                <p className="text-xs text-muted-foreground">
                  {productSales.thisMonthSales} this month
                </p>
              </div>
              <div className="bg-emerald-900/20 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                <ShoppingBag className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Earnings & Bookings Trend */}
        <Card className="border-emerald-900/20">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
              Earnings & Bookings Trend
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Last 6 months performance
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {monthlyData.length > 0 ? (
              <BarChart data={monthlyData} />
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="border-emerald-900/20">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
              Revenue Trend
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Monthly revenue over time
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {monthlyData.length > 0 ? (
              <RevenueChart data={monthlyData} />
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* This Month Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border-emerald-900/20">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">This Month</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Current month performance
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="text-base sm:text-lg font-bold text-white">
                  ₵{productSales.thisMonthRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm text-muted-foreground">Earnings</span>
                <span className="text-base sm:text-lg font-bold text-emerald-400">
                  ₵{productSales.thisMonthEarnings.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm text-muted-foreground">Product Sales</span>
                <span className="text-base sm:text-lg font-bold text-white">
                  {productSales.thisMonthSales}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm text-muted-foreground">Bookings</span>
                <span className="text-base sm:text-lg font-bold text-white">
                  {appointments.thisMonth}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Status */}
        <Card className="border-emerald-900/20">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Appointment Status</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Overview of your bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-900/20 border border-emerald-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-sm text-muted-foreground">Completed</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-white">
                  {appointments.completed}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-900/20 border border-blue-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-sm text-muted-foreground">Scheduled</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-white">
                  {appointments.scheduled}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-900/20 border border-red-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-sm text-muted-foreground">Cancelled</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-white">
                  {appointments.cancelled}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-base sm:text-lg font-bold text-white">
                  {appointments.total}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Performing Products */}
        <Card className="border-emerald-900/20">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
              Top Products
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your best performing products
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-emerald-900/10"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-900/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-white truncate">
                          {product.title}
                        </p>
                        {product.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {product.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sm sm:text-base font-bold text-white">
                        ₵{product.earnings.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.salesCount} sales
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No products yet</p>
                <Link href="/creator/products" className="text-emerald-400 hover:underline text-sm mt-2 inline-block">
                  Create your first product
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="border-emerald-900/20">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
              Sales by Category
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Revenue breakdown by product category
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {categoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {categoryBreakdown.map((category, index) => {
                  const percentage = productSales.totalRevenue > 0
                    ? (category.revenue / productSales.totalRevenue) * 100
                    : 0;
                  
                  return (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {category.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {category.sales} sales
                          </span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          ₵{category.earnings.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No category data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Sales */}
        <Card className="border-emerald-900/20">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
              Recent Sales
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Latest product purchases
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {recentSales.length > 0 ? (
              <div className="space-y-2">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/10 border border-emerald-900/10"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base text-white truncate">
                        {sale.product?.title || "Product"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale.buyer?.name || "Customer"} • {format(new Date(sale.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="text-sm sm:text-base font-bold text-emerald-400">
                        ₵{sale.creatorEarnings.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        from ₵{sale.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No sales yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card className="border-emerald-900/20">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
              Recent Bookings
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Latest appointment bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {recentAppointments.length > 0 ? (
              <div className="space-y-2">
                {recentAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/10 border border-emerald-900/10"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base text-white">
                        {apt.client?.name || "Client"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(apt.startTime), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`flex-shrink-0 ${
                        apt.status === "COMPLETED"
                          ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                          : apt.status === "SCHEDULED"
                          ? "bg-blue-900/20 border-blue-900/30 text-blue-400"
                          : "bg-red-900/20 border-red-900/30 text-red-400"
                      }`}
                    >
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No bookings yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payout Summary */}
      <Card className="border-emerald-900/20">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
            Payout Summary
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Your earnings breakdown and payout information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/20 border border-emerald-900/20">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                ₵{productSales.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/20 border border-emerald-900/20">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Platform Fees (1%)</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                ₵{productSales.totalPlatformFees.toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-900/30">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Your Earnings</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-400">
                ₵{productSales.totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              <strong>Available for Payout:</strong> ₵{productSales.availableForPayout.toFixed(2)}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Visit the <Link href="/creator/payouts" className="underline font-medium">Payouts</Link> page to request a payout.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
