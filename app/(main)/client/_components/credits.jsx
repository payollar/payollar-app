"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Wallet, CreditCard, Plus, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ClientCredits({ transactions = [], currentCredits = 0 }) {
  // Separate transactions by type
  const purchases = transactions.filter(
    (t) => t.type === "CREDIT_PURCHASE" && t.amount > 0
  );
  const deductions = transactions.filter(
    (t) => t.type === "APPOINTMENT_DEDUCTION" && t.amount < 0
  );

  return (
    <div className="space-y-6">
      {/* Current Credits Card */}
      <Card className="border-emerald-900/20 bg-gradient-to-r from-emerald-900/10 to-teal-900/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Available Credits</p>
              <p className="text-4xl font-bold text-white mb-1">{currentCredits}</p>
              <p className="text-xs text-muted-foreground">
                Each booking costs 2 credits
              </p>
            </div>
            <div className="bg-emerald-900/20 p-4 rounded-full">
              <Wallet className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <Link href="/pricing" className="block mt-6">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Purchase Credits
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isPurchase = transaction.type === "CREDIT_PURCHASE" && transaction.amount > 0;
                const isDeduction = transaction.type === "APPOINTMENT_DEDUCTION";

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-emerald-900/20 hover:border-emerald-700/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          isPurchase
                            ? "bg-emerald-900/20"
                            : "bg-red-900/20"
                        }`}
                      >
                        {isPurchase ? (
                          <ArrowUp className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {isPurchase
                            ? "Credit Purchase"
                            : isDeduction
                            ? "Booking Deduction"
                            : "Transaction"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-muted-foreground text-sm">
                            {format(
                              new Date(transaction.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </p>
                          {transaction.packageId && (
                            <Badge
                              variant="outline"
                              className="text-xs border-emerald-900/30 text-emerald-400"
                            >
                              {transaction.packageId}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          isPurchase
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {isPurchase ? "+" : ""}
                        {transaction.amount} credits
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-xl font-medium text-white mb-2">
                No transactions yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Your transaction history will appear here once you make a purchase or booking.
              </p>
              <Link href="/pricing">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Purchase Credits
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Information */}
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            About Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-lg bg-muted/20">
            <p className="text-white font-medium mb-1">How Credits Work</p>
            <p className="text-muted-foreground text-sm">
              Each booking session costs 2 credits. Credits never expire and can be purchased
              through our pricing plans or individual packages.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/20">
            <p className="text-white font-medium mb-1">Purchase Options</p>
            <p className="text-muted-foreground text-sm">
              Choose from monthly subscription plans or purchase credits individually.
              All credits are added to your account immediately after purchase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

