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
  Wallet,
  Shield,
  Calendar,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function ClientPayoutsPage({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [escrowPayments, setEscrowPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingPayments: 0,
    completedPayments: 0,
    inEscrow: 0,
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Payouts & Payments</h1>
        <p className="text-gray-400 mt-1">Manage your payments and track escrow transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-900/20 bg-gray-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-white">₵{stats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-emerald-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-900/20 bg-gray-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">In Escrow</p>
                <p className="text-2xl font-bold text-white">₵{stats.inEscrow.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-900/20 rounded-lg">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-900/20 bg-gray-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Pending</p>
                <p className="text-2xl font-bold text-white">₵{stats.pendingPayments.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-yellow-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-900/20 bg-gray-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Completed</p>
                <p className="text-2xl font-bold text-white">₵{stats.completedPayments.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="escrow" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-800">
          <TabsTrigger value="escrow" className="data-[state=active]:bg-emerald-600">
            <Shield className="h-4 w-4 mr-2" />
            Escrow Payments
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-emerald-600">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment History
          </TabsTrigger>
        </TabsList>

        {/* Escrow Payments Tab */}
        <TabsContent value="escrow" className="space-y-4 mt-6">
          <Card className="border-emerald-900/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white">Escrow Payments</CardTitle>
              <CardDescription className="text-gray-400">
                Payments held in escrow until services are completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : escrowPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>No escrow payments at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {escrowPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-emerald-700/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold">{payment.title}</h3>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Amount</p>
                              <p className="text-white font-medium">₵{payment.amount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">To</p>
                              <p className="text-white font-medium">{payment.recipientName}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Date</p>
                              <p className="text-white font-medium">
                                {format(new Date(payment.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Payment ID</p>
                              <p className="text-white font-mono text-xs">{payment.paymentReference}</p>
                            </div>
                          </div>
                          {payment.description && (
                            <p className="text-gray-400 text-sm mt-2">{payment.description}</p>
                          )}
                        </div>
                        <div className="ml-4">
                          {payment.status === "IN_ESCROW" && (
                            <Button variant="outline" size="sm" className="border-emerald-700/50 text-emerald-400">
                              View Details
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
        <TabsContent value="transactions" className="space-y-4 mt-6">
          <Card className="border-emerald-900/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white">Payment History</CardTitle>
              <CardDescription className="text-gray-400">
                All your payment transactions and credit purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>No payment history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-emerald-700/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-lg ${
                              transaction.type === "CREDIT_PURCHASE"
                                ? "bg-emerald-900/20"
                                : "bg-blue-900/20"
                            }`}
                          >
                            {transaction.type === "CREDIT_PURCHASE" ? (
                              <ArrowDownRight className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="h-5 w-5 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{transaction.description}</h3>
                            <p className="text-gray-400 text-sm">
                              {format(new Date(transaction.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              transaction.type === "CREDIT_PURCHASE"
                                ? "text-emerald-400"
                                : "text-blue-400"
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
  );
}
