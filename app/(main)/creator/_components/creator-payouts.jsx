"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Wallet,
  Clock,
  CheckCircle,
  ArrowRight,
  CreditCard,
  Shield,
  TrendingUp,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { requestPayout } from "@/actions/payout";

export function CreatorPayoutsPage({ user, payouts = [], earnings = {} }) {
  const router = useRouter();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [paystackEmail, setPaystackEmail] = useState("");
  const { loading, fn: submitPayout, data } = useFetch(requestPayout);

  const availableForPayout = earnings.availableForPayout || 0;
  const totalEarnings = earnings.totalEarnings || 0;
  const thisMonthEarnings = earnings.thisMonthEarnings || 0;

  const handleRequestPayout = async () => {
    if (!paystackEmail.trim()) {
      toast.error("Please enter your Paystack email address");
      return;
    }

    if (availableForPayout < 1) {
      toast.error("Minimum ₵1.00 required for payout");
      return;
    }

    const formData = new FormData();
    formData.append("paypalEmail", paystackEmail); // Reusing existing field for Paystack

    await submitPayout(formData);
  };

  if (data?.success) {
    toast.success("Payout request submitted successfully!");
    setShowRequestDialog(false);
    setPaystackEmail("");
    router.refresh();
  } else if (data?.error) {
    toast.error(data.error || "Failed to request payout");
  }

  const getStatusBadge = (status) => {
    if (status === "PROCESSING") {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-yellow-500" />
          Processing
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-900/20 text-green-400">
        <CheckCircle className="h-3 w-3" />
        Processed
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payouts & Earnings</h1>
          <p className="text-gray-400 mt-1">Manage your earnings and request payouts</p>
        </div>
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Wallet className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Request Payout</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter your Paystack email address to receive payouts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="paystackEmail" className="text-gray-300">
                  Paystack Email Address *
                </Label>
                <Input
                  id="paystackEmail"
                  type="email"
                  value={paystackEmail}
                  onChange={(e) => setPaystackEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Available for Payout:</p>
                    <p className="text-2xl font-bold text-emerald-400">₵{availableForPayout.toFixed(2)}</p>
                    <p className="mt-2 text-gray-400">
                      This amount will be transferred to your Paystack account within 3-5 business days.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleRequestPayout}
                disabled={loading || !paystackEmail.trim() || availableForPayout < 1}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? "Processing..." : "Request Payout"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-900/20 bg-gray-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Available for Payout</p>
                <p className="text-2xl font-bold text-white">₵{availableForPayout.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-emerald-900/20 rounded-lg">
                <Wallet className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-900/20 bg-gray-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-white">₵{totalEarnings.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-900/20 bg-gray-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">This Month</p>
                <p className="text-2xl font-bold text-white">₵{thisMonthEarnings.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-purple-900/20 rounded-lg">
                <Banknote className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-900/20 bg-gray-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Pending Payouts</p>
                <p className="text-2xl font-bold text-white">
                  {payouts.filter((p) => p.status === "PROCESSING").length}
                </p>
              </div>
              <div className="p-3 bg-yellow-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="payouts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-800">
          <TabsTrigger value="payouts" className="data-[state=active]:bg-emerald-600">
            <Wallet className="h-4 w-4 mr-2" />
            Payout History
          </TabsTrigger>
          <TabsTrigger value="escrow" className="data-[state=active]:bg-emerald-600">
            <Shield className="h-4 w-4 mr-2" />
            Escrow Payments
          </TabsTrigger>
        </TabsList>

        {/* Payout History Tab */}
        <TabsContent value="payouts" className="space-y-4 mt-6">
          <Card className="border-emerald-900/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white">Payout History</CardTitle>
              <CardDescription className="text-gray-400">
                Track all your payout requests and processed payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>No payout history yet</p>
                  <p className="text-sm mt-2">Request your first payout when you have earnings available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-emerald-700/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-white font-semibold">Payout Request</h3>
                            {getStatusBadge(payout.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Net Amount</p>
                              <p className="text-white font-medium text-lg">₵{payout.netAmount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Credits</p>
                              <p className="text-white font-medium">{payout.credits}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Platform Fee</p>
                              <p className="text-white font-medium">-₵{payout.platformFee.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Date</p>
                              <p className="text-white font-medium">
                                {format(new Date(payout.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          {payout.processedAt && (
                            <p className="text-gray-400 text-sm mt-2">
                              Processed on {format(new Date(payout.processedAt), "MMM d, yyyy 'at' h:mm a")}
                            </p>
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
              <div className="text-center py-8 text-gray-400">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p>Escrow payments will appear here</p>
                <p className="text-sm mt-2">Payments are held securely until services are completed</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
