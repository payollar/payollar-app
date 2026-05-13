"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Users,
  Radio,
  Megaphone,
  PieChart,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ClientPageShell, clientCardClass } from "./client-page-shell";

function ExpenseBreakdownBody({ breakdown }) {
  const talents = breakdown?.talents?.total ?? 0;
  const media = breakdown?.mediaBookings?.total ?? 0;
  const campaigns = breakdown?.campaignPayouts?.total ?? 0;
  const sum = talents + media + campaigns || 1;

  const rows = [
    {
      key: "talents",
      label: "Talents",
      sub:
        breakdown?.talents?.appointmentBookingsGhs > 0 || breakdown?.talents?.creatorProductsGhs > 0
          ? `Appointments ₵${(breakdown.talents.appointmentBookingsGhs || 0).toFixed(2)} · Creator products ₵${(breakdown.talents.creatorProductsGhs || 0).toFixed(2)}`
          : "Appointments (credits) and purchases from creators",
      icon: Users,
      amount: talents,
      color: "bg-primary",
    },
    {
      key: "media",
      label: "Media bookings",
      sub: "Confirmed or completed TV, radio, rate card, and other media buys",
      icon: Radio,
      amount: media,
      color: "bg-blue-500",
    },
    {
      key: "campaigns",
      label: "Campaigns (talent payout)",
      sub:
        (breakdown?.campaignPayouts?.acceptedApplications ?? 0) > 0
          ? `${breakdown.campaignPayouts.acceptedApplications} accepted application(s) with a stated rate`
          : "Sum of rates on accepted applications to your campaigns",
      icon: Megaphone,
      amount: campaigns,
      color: "bg-violet-500",
    },
  ];

  return (
    <div className="space-y-5">
      {rows.map(({ key, label, sub, icon: Icon, amount, color }) => {
        const pct = Math.round((amount / sum) * 1000) / 10;
        return (
          <div key={key} className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-muted p-2">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{sub}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold tabular-nums text-foreground">₵{amount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{pct}% of tracked spend</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${color}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
        Media totals use bookings tied to your account email with status confirmed or completed. Campaign totals use
        accepted application rates only; actual transfers may differ.
      </p>
    </div>
  );
}

export function ClientPayoutsPage() {
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

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/client/payouts", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setEscrowPayments(data.escrowPayments || []);
        setStats(data.stats || stats);
        if (data.expenseBreakdown) {
          setExpenseBreakdown(data.expenseBreakdown);
        }
      }
    } catch (error) {
      console.error("Failed to fetch payout data:", error);
      toast.error("Failed to load payout information");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { variant: "secondary", icon: Clock, label: "Pending", color: "text-yellow-500" },
      IN_ESCROW: { variant: "default", icon: Shield, label: "In Escrow", color: "text-blue-500" },
      COMPLETED: { variant: "default", icon: CheckCircle, label: "Completed", color: "text-green-500" },
      RELEASED: { variant: "default", icon: CheckCircle, label: "Released", color: "text-green-500" },
      CANCELLED: { variant: "destructive", icon: XCircle, label: "Cancelled", color: "text-red-500" },
      REFUNDED: { variant: "destructive", icon: XCircle, label: "Refunded", color: "text-red-500" },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  return (
    <ClientPageShell
      eyebrow="Payments"
      title="Payouts & payments"
      description="Track escrow, completed payments, where your spend goes, and your payment history."
    >
    <div className="space-y-6">
      {/* Expense breakdown */}
      <Card className={clientCardClass}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-foreground">Expense breakdown</CardTitle>
              <CardDescription className="text-muted-foreground">
                Where your money has gone: talent services, media bookings, and accepted campaign talent
                compensation (rates on accepted applications).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center text-muted-foreground">Loading breakdown…</div>
          ) : (
            <ExpenseBreakdownBody breakdown={expenseBreakdown} />
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={clientCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Total spent</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">₵{stats.totalSpent.toFixed(2)}</p>
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
                <p className="mb-1 text-sm text-muted-foreground">In escrow</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">₵{stats.inEscrow.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">₵{stats.pendingPayments.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-3">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={clientCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold tabular-nums text-primary">₵{stats.completedPayments.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="escrow" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-xl border border-border/60 bg-card/60 p-1">
          <TabsTrigger
            value="escrow"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Shield className="mr-2 h-4 w-4" />
            Escrow
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Escrow Payments Tab */}
        <TabsContent value="escrow" className="mt-6 space-y-4">
          <Card className={clientCardClass}>
            <CardHeader>
              <CardTitle className="text-foreground">Escrow</CardTitle>
              <CardDescription className="text-muted-foreground">
                Payments held until services are completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading...</div>
              ) : escrowPayments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Shield className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No escrow payments at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {escrowPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-lg border border-border/60 bg-muted/20 p-4 transition-colors hover:border-primary/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="font-semibold text-foreground">{payment.title}</h3>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                            <div>
                              <p className="text-muted-foreground">Amount</p>
                              <p className="font-medium tabular-nums text-foreground">₵{payment.amount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">To</p>
                              <p className="font-medium text-foreground">{payment.recipientName}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p className="font-medium text-foreground">
                                {format(new Date(payment.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Reference</p>
                              <p className="font-mono text-xs text-foreground">{payment.paymentReference}</p>
                            </div>
                          </div>
                          {payment.description && (
                            <p className="mt-2 text-sm text-muted-foreground">{payment.description}</p>
                          )}
                        </div>
                        <div className="ml-4">
                          {payment.status === "IN_ESCROW" && (
                            <Button variant="glass" size="sm">
                              Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="transactions" className="mt-6 space-y-4">
          <Card className={clientCardClass}>
            <CardHeader>
              <CardTitle className="text-foreground">Payment history</CardTitle>
              <CardDescription className="text-muted-foreground">
                Transactions and credit purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading...</div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <CreditCard className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No payment history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="rounded-lg border border-border/60 bg-muted/20 p-4 transition-colors hover:border-primary/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`rounded-lg p-3 ${
                              transaction.type === "CREDIT_PURCHASE" ? "bg-primary/10" : "bg-muted"
                            }`}
                          >
                            {transaction.type === "CREDIT_PURCHASE" ? (
                              <ArrowDownRight className="h-5 w-5 text-primary" />
                            ) : (
                              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{transaction.description}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(transaction.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold tabular-nums ${
                              transaction.type === "CREDIT_PURCHASE" ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {transaction.type === "CREDIT_PURCHASE" ? "+" : "-"}₵
                            {Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </ClientPageShell>
  );
}
