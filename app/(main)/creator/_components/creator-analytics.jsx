"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CreatorPageShell, creatorCardClass } from "./creator-page-shell";

function money(value) {
  const n = Number(value) || 0;
  return `₵${n.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function TrendPill({ value }) {
  const n = Number(value) || 0;
  if (n === 0) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
        Flat vs last month
      </span>
    );
  }
  const up = n > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      )}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(n).toFixed(1)}%
    </span>
  );
}

function Panel({ title, description, icon: Icon, action, children, className }) {
  return (
    <section className={cn(creatorCardClass, "overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {Icon ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef2ff] text-[#0055ff]">
                <Icon className="h-3.5 w-3.5" />
              </span>
            ) : null}
            <h2 className="text-sm font-semibold text-slate-950 sm:text-base">{title}</h2>
          </div>
          {description ? (
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function EmptyBlock({ icon: Icon, title, description, href, cta }) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-950">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      ) : null}
      {href && cta ? (
        <Button asChild size="sm" className="mt-4 h-8 rounded-full bg-[#0055ff] px-3 text-xs text-white hover:bg-[#0046d4]">
          <Link href={href}>
            {cta}
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function BarChart({ data }) {
  const maxEarnings = Math.max(...data.map((d) => d.earnings), 1);
  const maxBookings = Math.max(...data.map((d) => d.bookings), 1);
  const hasSignal = data.some((d) => d.earnings > 0 || d.bookings > 0);

  return (
    <div className="space-y-4">
      <div className="relative flex h-40 items-end justify-between gap-1.5 sm:h-44 sm:gap-2">
        {!hasSignal ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-100">
              Activity will show here once you earn
            </p>
          </div>
        ) : null}
        {data.map((item, index) => (
          <div key={index} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end justify-center gap-0.5">
              <div
                className="w-[45%] rounded-t-md bg-[#0055ff] transition-all"
                style={{
                  height: `${Math.max((item.earnings / maxEarnings) * 100, hasSignal && item.earnings > 0 ? 6 : 2)}%`,
                  opacity: item.earnings > 0 ? 1 : 0.12,
                }}
                title={money(item.earnings)}
              />
              <div
                className="w-[45%] rounded-t-md bg-[#93c5fd] transition-all"
                style={{
                  height: `${Math.max((item.bookings / maxBookings) * 100, hasSignal && item.bookings > 0 ? 6 : 2)}%`,
                  opacity: item.bookings > 0 ? 1 : 0.12,
                }}
                title={`${item.bookings} bookings`}
              />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
              {item.month}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#0055ff]" />
          Earnings
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#93c5fd]" />
          Bookings
        </span>
      </div>
    </div>
  );
}

function RevenueChart({ data }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const hasSignal = data.some((d) => d.revenue > 0);

  return (
    <div className="relative flex h-40 items-end justify-between gap-1.5 sm:h-44 sm:gap-2">
      {!hasSignal ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-100">
            No revenue in this window yet
          </p>
        </div>
      ) : null}
      {data.map((item, index) => (
        <div key={index} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex h-full w-full items-end justify-center">
            <div
              className="w-full max-w-[2rem] rounded-t-md bg-gradient-to-t from-[#0055ff] to-[#60a5fa] transition-all"
              style={{
                height: `${Math.max((item.revenue / maxRevenue) * 100, hasSignal && item.revenue > 0 ? 6 : 2)}%`,
                opacity: item.revenue > 0 ? 1 : 0.12,
              }}
              title={money(item.revenue)}
            />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
            {item.month}
          </span>
        </div>
      ))}
    </div>
  );
}

function statusMeta(status) {
  if (status === "COMPLETED") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }
  if (status === "SCHEDULED") {
    return "border-[#dbeafe] bg-[#eef2ff] text-[#0055ff]";
  }
  return "border-rose-100 bg-rose-50 text-rose-700";
}

export function CreatorAnalyticsClient({ analytics }) {
  const {
    productSales,
    appointments,
    monthlyData,
    topProducts,
    categoryBreakdown,
    recentSales,
    recentAppointments,
  } = analytics;

  const bookingTotal = Math.max(appointments.total, 1);
  const bookingRows = [
    {
      label: "Completed",
      value: appointments.completed,
      bar: "bg-emerald-500",
      track: "bg-emerald-50",
    },
    {
      label: "Scheduled",
      value: appointments.scheduled,
      bar: "bg-[#0055ff]",
      track: "bg-[#eef2ff]",
    },
    {
      label: "Cancelled",
      value: appointments.cancelled,
      bar: "bg-rose-500",
      track: "bg-rose-50",
    },
  ];

  const kpis = [
    {
      label: "Revenue",
      value: money(productSales.totalRevenue),
      hint: <TrendPill value={productSales.revenueTrend} />,
      icon: DollarSign,
    },
    {
      label: "Earnings",
      value: money(productSales.totalEarnings),
      hint: <TrendPill value={productSales.earningsTrend} />,
      icon: TrendingUp,
      accent: true,
    },
    {
      label: "Bookings",
      value: String(appointments.total),
      hint: <TrendPill value={appointments.trend} />,
      icon: Calendar,
    },
    {
      label: "Product sales",
      value: String(productSales.totalSales),
      hint: (
        <span className="text-[11px] text-slate-400">
          {productSales.thisMonthSales} this month
        </span>
      ),
      icon: ShoppingBag,
    },
  ];

  return (
    <CreatorPageShell
      eyebrow="Insights"
      title="Analytics"
      description="Track performance, earnings, and growth across products and bookings."
      actions={
        <Button asChild variant="outline" className="rounded-full border-slate-200">
          <Link href="/creator/payouts">
            <Wallet className="mr-1.5 h-4 w-4" />
            Payouts
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        {/* KPI strip */}
        <div className={`${creatorCardClass} grid grid-cols-2 overflow-hidden lg:grid-cols-4`}>
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className={cn(
                  "border-b border-slate-100 px-4 py-4 sm:px-5 lg:border-b-0 lg:border-r lg:last:border-r-0",
                  index % 2 === 0 ? "sm:border-r" : "",
                  index >= 2 ? "border-b-0" : ""
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {kpi.label}
                  </p>
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg",
                      kpi.accent ? "bg-[#0055ff] text-white" : "bg-[#eef2ff] text-[#0055ff]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-2 truncate text-xl font-semibold tabular-nums sm:text-2xl",
                    kpi.accent ? "text-[#0055ff]" : "text-slate-950"
                  )}
                >
                  {kpi.value}
                </p>
                <div className="mt-2">{kpi.hint}</div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel
            title="Earnings & bookings"
            description="Last 6 months"
            icon={BarChart3}
          >
            {monthlyData.length > 0 ? (
              <BarChart data={monthlyData} />
            ) : (
              <EmptyBlock
                icon={BarChart3}
                title="No trend data yet"
                description="Complete bookings or product sales to build this chart."
              />
            )}
          </Panel>

          <Panel
            title="Revenue trend"
            description="Monthly revenue over time"
            icon={TrendingUp}
          >
            {monthlyData.length > 0 ? (
              <RevenueChart data={monthlyData} />
            ) : (
              <EmptyBlock
                icon={TrendingUp}
                title="No revenue yet"
                description="Your monthly revenue will plot here."
              />
            )}
          </Panel>
        </div>

        {/* This month + booking mix */}
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="This month" description="Current period snapshot" icon={DollarSign}>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Revenue", value: money(productSales.thisMonthRevenue) },
                {
                  label: "Earnings",
                  value: money(productSales.thisMonthEarnings),
                  accent: true,
                },
                { label: "Sales", value: String(productSales.thisMonthSales) },
                { label: "Bookings", value: String(appointments.thisMonth) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-[#f8fafc] px-3 py-3"
                >
                  <p className="text-[11px] font-medium text-slate-400">{item.label}</p>
                  <p
                    className={cn(
                      "mt-1 text-base font-semibold tabular-nums sm:text-lg",
                      item.accent ? "text-[#0055ff]" : "text-slate-950"
                    )}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Booking mix"
            description="Status across all appointments"
            icon={Calendar}
            action={
              <Link
                href="/creator/bookings"
                className="text-xs font-semibold text-[#0055ff] hover:underline"
              >
                View orders
              </Link>
            }
          >
            <div className="space-y-3">
              {bookingRows.map((row) => (
                <div key={row.label}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-600">{row.label}</span>
                    <span className="text-sm font-semibold tabular-nums text-slate-950">
                      {row.value}
                    </span>
                  </div>
                  <div className={cn("h-2 overflow-hidden rounded-full", row.track)}>
                    <div
                      className={cn("h-full rounded-full transition-all", row.bar)}
                      style={{
                        width: `${Math.min(100, (row.value / bookingTotal) * 100)}%`,
                        minWidth: row.value > 0 ? "6px" : "0",
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="font-medium text-slate-500">Total</span>
                <span className="font-semibold tabular-nums text-slate-950">
                  {appointments.total}
                </span>
              </div>
            </div>
          </Panel>
        </div>

        {/* Products */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel
            title="Top products"
            description="Best earners by payout"
            icon={Package}
            action={
              <Link
                href="/creator/products"
                className="text-xs font-semibold text-[#0055ff] hover:underline"
              >
                Manage
              </Link>
            }
          >
            {topProducts.length > 0 ? (
              <ul className="space-y-2">
                {topProducts.map((product, index) => (
                  <li
                    key={product.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-[#fafbfd] px-3 py-2.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-xs font-bold text-[#0055ff]">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {product.title}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {product.salesCount} sale{product.salesCount === 1 ? "" : "s"}
                        {product.category ? ` · ${product.category}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-950">
                      {money(product.earnings)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyBlock
                icon={Package}
                title="No products yet"
                description="Publish a digital product to start tracking top sellers."
                href="/creator/products"
                cta="Add a product"
              />
            )}
          </Panel>

          <Panel
            title="Sales by category"
            description="Share of product revenue"
            icon={BarChart3}
          >
            {categoryBreakdown.length > 0 ? (
              <ul className="space-y-3">
                {categoryBreakdown.map((category) => {
                  const percentage =
                    productSales.totalRevenue > 0
                      ? (category.revenue / productSales.totalRevenue) * 100
                      : 0;
                  return (
                    <li key={category.category}>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <Badge className="rounded-full border-0 bg-slate-100 px-2 py-0 text-[10px] font-medium text-slate-600">
                            {category.category}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {category.sales} sales
                          </span>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-slate-950">
                          {money(category.earnings)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#0055ff] transition-all"
                          style={{ width: `${Math.max(percentage, percentage > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyBlock
                icon={BarChart3}
                title="No category mix yet"
                description="Category share appears after your first product sale."
              />
            )}
          </Panel>
        </div>

        {/* Recent activity */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel
            title="Recent sales"
            description="Latest product purchases"
            icon={ShoppingBag}
          >
            {recentSales.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentSales.map((sale) => (
                  <li
                    key={sale.id}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {sale.product?.title || "Product"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {sale.buyer?.name || "Customer"} ·{" "}
                        {format(new Date(sale.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-[#0055ff]">
                        {money(sale.creatorEarnings)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        of {money(sale.amount)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyBlock
                icon={ShoppingBag}
                title="No sales yet"
                description="Share your storefront to land the first purchase."
                href="/creator/products"
                cta="Open products"
              />
            )}
          </Panel>

          <Panel
            title="Recent bookings"
            description="Latest appointment activity"
            icon={Calendar}
          >
            {recentAppointments.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentAppointments.map((apt) => (
                  <li
                    key={apt.id}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {apt.client?.name || "Client"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {format(new Date(apt.startTime), "MMM d, yyyy · h:mm a")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 rounded-full text-[10px] font-semibold capitalize",
                        statusMeta(apt.status)
                      )}
                    >
                      {String(apt.status || "").toLowerCase()}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyBlock
                icon={Calendar}
                title="No bookings yet"
                description="Promote your services to get on the calendar."
                href="/creator/services"
                cta="View services"
              />
            )}
          </Panel>
        </div>

        {/* Payout summary */}
        <section className={cn(creatorCardClass, "overflow-hidden p-4 sm:p-5")}>
          <div className="flex flex-col gap-4 rounded-2xl bg-[#eef2ff] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0055ff] shadow-sm">
                <CreditCard className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0055ff]/80">
                  Available for payout
                </p>
                <p className="mt-0.5 truncate text-2xl font-semibold tabular-nums text-slate-950 sm:text-3xl">
                  {money(productSales.availableForPayout)}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  After the 1% platform fee
                </p>
              </div>
            </div>
            <Button
              asChild
              className="h-10 shrink-0 rounded-full bg-[#0055ff] px-5 text-white hover:bg-[#0046d4]"
            >
              <Link href="/creator/payouts">
                Request payout
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {[
              { label: "Total revenue", value: money(productSales.totalRevenue) },
              {
                label: "Platform fees (1%)",
                value: money(productSales.totalPlatformFees),
              },
              {
                label: "Your earnings",
                value: money(productSales.totalEarnings),
                accent: true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  "rounded-xl border px-4 py-3.5",
                  item.accent
                    ? "border-[#bfdbfe] bg-[#f8fbff]"
                    : "border-slate-100 bg-[#fafbfd]"
                )}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {item.label}
                </p>
                <p
                  className={cn(
                    "mt-1.5 text-lg font-semibold tabular-nums sm:text-xl",
                    item.accent ? "text-[#0055ff]" : "text-slate-950"
                  )}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </CreatorPageShell>
  );
}
