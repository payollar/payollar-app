"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Loader2,
  Megaphone,
  Radio,
  Receipt,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClientPageShell, clientCardClass } from "./client-page-shell";

const TABS = [
  { id: "escrow", label: "Escrow", icon: Shield },
  { id: "history", label: "History", icon: CreditCard },
];

function money(n) {
  const value = Number(n);
  if (!Number.isFinite(value)) return "₵0.00";
  return `₵${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusMeta(status) {
  const map = {
    PENDING: {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      icon: Clock3,
    },
    IN_ESCROW: {
      label: "In escrow",
      className: "border-slate-200 bg-slate-50 text-slate-700",
      icon: Shield,
    },
    COMPLETED: {
      label: "Completed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },
    RELEASED: {
      label: "Released",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },
    CANCELLED: {
      label: "Cancelled",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      icon: Clock3,
    },
    REFUNDED: {
      label: "Refunded",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      icon: Clock3,
    },
  };
  return map[status] || map.PENDING;
}

function StatusBadge({ status }) {
  const meta = statusMeta(status);
  const Icon = meta.icon;
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full gap-1 font-medium", meta.className)}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </Badge>
  );
}

function StatCard({ icon: Icon, label, value, hint, accent }) {
  return (
    <div
      className={cn(
        clientCardClass,
        "p-4",
        accent === "amber" && "ring-1 ring-amber-200",
        accent === "emerald" && "ring-1 ring-emerald-100"
      )}
    >
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function MetricTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold tabular-nums text-slate-950">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-100 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-slate-950">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

function ExpenseBreakdown({ breakdown, loading }) {
  const talents = breakdown?.talents?.total ?? 0;
  const media = breakdown?.mediaBookings?.total ?? 0;
  const campaigns = breakdown?.campaignPayouts?.total ?? 0;
  const total = talents + media + campaigns;
  const denom = total || 1;

  const rows = [
    {
      key: "talents",
      label: "Talents",
      icon: Users,
      amount: talents,
      tone: "bg-slate-950",
      sub:
        breakdown?.talents?.appointmentBookingsGhs > 0 ||
        breakdown?.talents?.creatorProductsGhs > 0
          ? `Bookings ${money(breakdown.talents.appointmentBookingsGhs || 0)} · Products ${money(breakdown.talents.creatorProductsGhs || 0)}`
          : "Appointments & creator purchases",
    },
    {
      key: "media",
      label: "Media",
      icon: Radio,
      amount: media,
      tone: "bg-slate-500",
      sub: "TV, radio, rate cards, and other media buys",
    },
    {
      key: "campaigns",
      label: "Campaigns",
      icon: Megaphone,
      amount: campaigns,
      tone: "bg-slate-300",
      sub:
        (breakdown?.campaignPayouts?.acceptedApplications ?? 0) > 0
          ? `${breakdown.campaignPayouts.acceptedApplications} accepted rate${breakdown.campaignPayouts.acceptedApplications === 1 ? "" : "s"}`
          : "Accepted application rates",
    },
  ];

  if (loading) {
    return (
      <div className={cn(clientCardClass, "flex items-center justify-center gap-2 p-8 text-sm text-slate-500")}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading spend…
      </div>
    );
  }

  return (
    <div className={cn(clientCardClass, "p-4 sm:p-5")}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Spend mix
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Talent, media, and campaign compensation tracked so far
          </p>
        </div>
        <p className="text-right">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Tracked total
          </span>
          <span className="text-xl font-semibold tabular-nums text-slate-950">
            {money(total)}
          </span>
        </p>
      </div>

      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
        {rows.map((row) => {
          const width = total > 0 ? (row.amount / denom) * 100 : 0;
          if (width <= 0) return null;
          return (
            <div
              key={row.key}
              className={cn("h-full first:rounded-l-full last:rounded-r-full", row.tone)}
              style={{ width: `${width}%` }}
              title={`${row.label}: ${money(row.amount)}`}
            />
          );
        })}
      </div>

      <ul className="mt-4 divide-y divide-slate-100">
        {rows.map((row) => {
          const Icon = row.icon;
          const pct = Math.round((row.amount / denom) * 1000) / 10;
          return (
            <li
              key={row.key}
              className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-100">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-950">{row.label}</p>
                    <span className={cn("h-2 w-2 rounded-full", row.tone)} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{row.sub}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-slate-950">
                  {money(row.amount)}
                </p>
                <p className="text-[11px] text-slate-400">{pct}%</p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400">
        Media totals use confirmed/completed bookings. Campaign totals use accepted application
        rates; actual transfers may differ.
      </p>
    </div>
  );
}

export function ClientPayoutsPage() {
  const [tab, setTab] = useState("escrow");
  const [transactions, setTransactions] = useState([]);
  const [escrowPayments, setEscrowPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingPayments: 0,
    completedPayments: 0,
    inEscrow: 0,
  });
  const [expenseBreakdown, setExpenseBreakdown] = useState({
    talents: { total: 0, appointmentBookingsGhs: 0, creatorProductsGhs: 0 },
    mediaBookings: { total: 0 },
    campaignPayouts: { total: 0, acceptedApplications: 0 },
  });
  const [transactionStats, setTransactionStats] = useState({
    totalCount: 0,
    creditPurchases: 0,
    creditsIn: 0,
    creditsOut: 0,
    mediaBookings: 0,
    productPurchases: 0,
    campaignRates: 0,
    escrowCount: 0,
    volumeGhs: 0,
    avgTicketGhs: 0,
    last30Days: 0,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/client/payouts", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (cancelled) return;
        setTransactions(data.transactions || []);
        setEscrowPayments(data.escrowPayments || []);
        setStats(data.stats || stats);
        if (data.expenseBreakdown) setExpenseBreakdown(data.expenseBreakdown);
        if (data.transactionStats) setTransactionStats(data.transactionStats);
      } catch (error) {
        console.error("Failed to fetch payout data:", error);
        if (!cancelled) toast.error("Failed to load payout information");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount fetch
  }, []);

  const tabCounts = useMemo(
    () => ({
      escrow: escrowPayments.length,
      history: transactions.length,
    }),
    [escrowPayments.length, transactions.length]
  );

  return (
    <ClientPageShell
      eyebrow="Payments"
      title="Payouts"
      description="Escrow balances, spend mix, and payment history across talent, media, and campaigns."
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total spent"
          value={isLoading ? "—" : money(stats.totalSpent)}
          hint="All tracked outflows"
        />
        <StatCard
          icon={Shield}
          label="In escrow"
          value={isLoading ? "—" : money(stats.inEscrow)}
          hint="Held until delivery"
        />
        <StatCard
          icon={Clock3}
          label="Pending"
          value={isLoading ? "—" : money(stats.pendingPayments)}
          hint="Awaiting confirmation"
          accent={stats.pendingPayments > 0 ? "amber" : undefined}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={isLoading ? "—" : money(stats.completedPayments)}
          hint="Released / settled"
          accent="emerald"
        />
      </div>

      <ExpenseBreakdown breakdown={expenseBreakdown} loading={isLoading} />

      <section className={cn(clientCardClass, "p-4 sm:p-5")}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Transaction stats
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Volume and counts across credits, media, products, and campaigns
            </p>
          </div>
          {!isLoading ? (
            <p className="text-xs text-slate-400">
              {transactionStats.last30Days} in the last 30 days
            </p>
          ) : null}
        </div>

        {isLoading ? (
          <div className="mt-4 flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading transactions…
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricTile
                icon={Receipt}
                label="Total transactions"
                value={String(transactionStats.totalCount)}
              />
              <MetricTile
                icon={Activity}
                label="Volume"
                value={money(transactionStats.volumeGhs)}
              />
              <MetricTile
                icon={Wallet}
                label="Avg ticket"
                value={money(transactionStats.avgTicketGhs)}
              />
              <MetricTile
                icon={Shield}
                label="In escrow now"
                value={String(transactionStats.escrowCount)}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat
                label="Credits in"
                value={money(transactionStats.creditsIn)}
                hint={`${transactionStats.creditPurchases} purchase${transactionStats.creditPurchases === 1 ? "" : "s"}`}
              />
              <MiniStat
                label="Credits out"
                value={money(transactionStats.creditsOut)}
                hint="Talent bookings & adjustments"
              />
              <MiniStat
                label="Media bookings"
                value={String(transactionStats.mediaBookings)}
                hint="Confirmed / completed"
              />
              <MiniStat
                label="Products · campaigns"
                value={`${transactionStats.productPurchases} · ${transactionStats.campaignRates}`}
                hint="Purchases · accepted rates"
              />
            </div>
          </>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                active
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
              <span className="opacity-70">{tabCounts[item.id]}</span>
            </button>
          );
        })}
      </div>

      {tab === "escrow" ? (
        <section className={cn(clientCardClass, "overflow-hidden")}>
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <h2 className="text-base font-semibold text-slate-950">Escrow</h2>
            <p className="mt-1 text-sm text-slate-500">
              Payments held until the related service or delivery is complete
            </p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading escrow…
            </div>
          ) : escrowPayments.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Shield className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-slate-700">Nothing in escrow</p>
              <p className="mt-1 max-w-sm text-xs text-slate-400">
                When you fund a booking or campaign payout, it will sit here until release.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {escrowPayments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex flex-col gap-3 px-4 py-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-950">
                        {payment.title}
                      </h3>
                      <StatusBadge status={payment.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>
                        To{" "}
                        <span className="font-medium text-slate-700">
                          {payment.recipientName}
                        </span>
                      </span>
                      <span>
                        {format(new Date(payment.createdAt), "MMM d, yyyy")}
                      </span>
                      {payment.paymentReference ? (
                        <span className="font-mono text-[11px] text-slate-400">
                          {payment.paymentReference}
                        </span>
                      ) : null}
                    </div>
                    {payment.description ? (
                      <p className="text-sm text-slate-500">{payment.description}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <p className="text-base font-semibold tabular-nums text-slate-950">
                      {money(payment.amount)}
                    </p>
                    {payment.status === "IN_ESCROW" ? (
                      <Button variant="outline" size="sm" className="rounded-full">
                        Details
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className={cn(clientCardClass, "overflow-hidden")}>
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <h2 className="text-base font-semibold text-slate-950">Payment history</h2>
            <p className="mt-1 text-sm text-slate-500">
              Credits, talent invoices, and other settled payments
            </p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading history…
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <CreditCard className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium text-slate-700">No payments yet</p>
              <p className="mt-1 max-w-sm text-xs text-slate-400">
                Credit top-ups and completed payouts will appear in this list.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {transactions.map((transaction) => {
                const isCredit =
                  transaction.type === "CREDIT_PURCHASE" ||
                  Number(transaction.amount) > 0;
                return (
                  <li
                    key={transaction.id}
                    className="flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-slate-50/80 sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
                          isCredit
                            ? "bg-slate-950 text-white ring-slate-950"
                            : "bg-slate-50 text-slate-600 ring-slate-100"
                        )}
                      >
                        {isCredit ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {transaction.description}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {format(
                            new Date(transaction.createdAt),
                            "MMM d, yyyy · h:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          isCredit ? "text-emerald-600" : "text-slate-950"
                        )}
                      >
                        {isCredit ? "+" : "−"}
                        {money(Math.abs(transaction.amount))}
                      </p>
                      <div className="mt-1 flex justify-end">
                        <StatusBadge status={transaction.status} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </ClientPageShell>
  );
}
