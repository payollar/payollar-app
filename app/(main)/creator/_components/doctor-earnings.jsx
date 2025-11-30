"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  BarChart3,
  CreditCard,
  Loader2,
  AlertCircle,
  DollarSign,
  ShoppingBag,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { updateBankAccount } from "@/actions/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreatorEarnings({ earnings = {}, recentSales = [] }) {
  const router = useRouter();
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    totalEarnings = 0,
    totalRevenue = 0,
    thisMonthEarnings = 0,
    thisMonthRevenue = 0,
    totalSales = 0,
    thisMonthSales = 0,
    averageEarningsPerMonth = 0,
    availableForPayout = 0,
    totalPlatformFees = 0,
  } = earnings;

  const [bankFormData, setBankFormData] = useState({
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
    bankRoutingNumber: "",
    bankCountry: "GH", // Default to Ghana
  });

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("bankAccountName", bankFormData.bankAccountName);
      formData.append("bankAccountNumber", bankFormData.bankAccountNumber);
      formData.append("bankName", bankFormData.bankName);
      formData.append("bankRoutingNumber", bankFormData.bankRoutingNumber);
      formData.append("bankCountry", bankFormData.bankCountry);

      const result = await updateBankAccount(formData);

      if (result?.success) {
        toast.success("Bank account information updated successfully!");
        setShowBankDialog(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update bank account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-white">
                  ${totalRevenue.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">All time sales</p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold text-white">
                  ${totalEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">After 1% platform fee</p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold text-white">
                  ${thisMonthEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {thisMonthSales} sales
                </p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-3xl font-bold text-white">{totalSales}</p>
                <p className="text-xs text-muted-foreground">Products sold</p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Account & Payout Section */}
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-emerald-400" />
            Bank Account & Payouts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/20 p-4 rounded-lg border border-emerald-900/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-white">
                Available for Payout
              </h3>
              <Badge
                variant="outline"
                className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
              >
                ${availableForPayout.toFixed(2)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
              <div>
                <p className="text-muted-foreground">Total Revenue</p>
                <p className="text-white font-medium">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Platform Fee (1%)</p>
                <p className="text-white font-medium">
                  ${totalPlatformFees.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Your Earnings</p>
                <p className="text-emerald-400 font-medium">
                  ${totalEarnings.toFixed(2)}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowBankDialog(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Update Bank Account Information
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Payout Structure:</strong> You receive 99% of each product sale. 
              Platform fee is 1% per transaction. Earnings are automatically available 
              for payout to your bank account after each sale.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      {recentSales.length > 0 && (
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <Package className="h-5 w-5 mr-2 text-emerald-400" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/10 border border-emerald-900/10"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {sale.product?.title || "Product"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sold to {sale.buyer?.name || "Customer"} •{" "}
                      {format(new Date(sale.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      ${sale.creatorEarnings.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${sale.amount.toFixed(2)} - ${sale.platformFee.toFixed(2)} fee
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Account Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Bank Account Information
            </DialogTitle>
            <DialogDescription>
              Add or update your bank account details to receive payouts from product sales
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBankSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankAccountName">Account Holder Name *</Label>
              <Input
                id="bankAccountName"
                value={bankFormData.bankAccountName}
                onChange={(e) =>
                  setBankFormData({ ...bankFormData, bankAccountName: e.target.value })
                }
                className="bg-background border-emerald-900/20"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number *</Label>
                <Input
                  id="bankAccountNumber"
                  value={bankFormData.bankAccountNumber}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, bankAccountNumber: e.target.value })
                  }
                  className="bg-background border-emerald-900/20"
                  placeholder="1234567890"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={bankFormData.bankName}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, bankName: e.target.value })
                  }
                  className="bg-background border-emerald-900/20"
                  placeholder="GT Bank, Access Bank, etc."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankRoutingNumber">Routing/Sort Code *</Label>
                <Input
                  id="bankRoutingNumber"
                  value={bankFormData.bankRoutingNumber}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, bankRoutingNumber: e.target.value })
                  }
                  className="bg-background border-emerald-900/20"
                  placeholder="000123456"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankCountry">Country *</Label>
                <Input
                  id="bankCountry"
                  value={bankFormData.bankCountry}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, bankCountry: e.target.value })
                  }
                  className="bg-background border-emerald-900/20"
                  placeholder="GH"
                  required
                />
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Your bank account information is secure and will only be used for processing payouts.
                All earnings from product sales will be transferred to this account.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBankDialog(false)}
                disabled={isSubmitting}
                className="border-emerald-900/30"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Bank Account"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
