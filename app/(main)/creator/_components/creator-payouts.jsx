"use client";

import { useState, useEffect } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Building2,
  Loader2,
  Edit,
  Eye,
  EyeOff,
  Smartphone,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { requestPayout } from "@/actions/payout";
import { updateBankAccount, removeBankAccount, removeMobileMoney } from "@/actions/products";

export function CreatorPayoutsPage({ user, payouts = [], earnings = {} }) {
  const router = useRouter();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [isSubmittingBank, setIsSubmittingBank] = useState(false);
  const [paystackEmail, setPaystackEmail] = useState("");
  const { loading, fn: submitPayout, data } = useFetch(requestPayout);

  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [showDeleteBankDialog, setShowDeleteBankDialog] = useState(false);
  const [showDeleteMobileDialog, setShowDeleteMobileDialog] = useState(false);
  const [isDeletingBank, setIsDeletingBank] = useState(false);
  const [isDeletingMobile, setIsDeletingMobile] = useState(false);
  
  const [bankFormData, setBankFormData] = useState({
    bankAccountName: user?.bankAccountName || "",
    bankAccountNumber: user?.bankAccountNumber || "",
    bankName: user?.bankName || "",
    bankRoutingNumber: user?.bankRoutingNumber || "",
    bankCountry: user?.bankCountry || "GH",
  });

  const [mobileMoneyData, setMobileMoneyData] = useState({
    mobileMoneyProvider: user?.mobileMoneyProvider || "",
    mobileMoneyNumber: user?.mobileMoneyNumber || "",
    mobileMoneyName: user?.mobileMoneyName || "",
  });

  // Check if bank account is set up
  const hasBankAccount =
    user?.bankAccountName &&
    user?.bankAccountNumber &&
    user?.bankName &&
    user?.bankRoutingNumber;

  // Check if mobile money is set up (fields may not exist in DB yet)
  const hasMobileMoney =
    user?.mobileMoneyProvider &&
    user?.mobileMoneyNumber &&
    user?.mobileMoneyName;

  const availableForPayout = earnings.availableForPayout || 0;
  const totalEarnings = earnings.totalEarnings || 0;
  const thisMonthEarnings = earnings.thisMonthEarnings || 0;

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingBank(true);

    try {
      const formData = new FormData();
      formData.append("bankAccountName", bankFormData.bankAccountName);
      formData.append("bankAccountNumber", bankFormData.bankAccountNumber);
      formData.append("bankName", bankFormData.bankName);
      formData.append("bankRoutingNumber", bankFormData.bankRoutingNumber);
      formData.append("bankCountry", bankFormData.bankCountry);
      
      // Add mobile money fields if provided
      if (paymentMethod === "mobile") {
        formData.append("mobileMoneyProvider", mobileMoneyData.mobileMoneyProvider);
        formData.append("mobileMoneyNumber", mobileMoneyData.mobileMoneyNumber);
        formData.append("mobileMoneyName", mobileMoneyData.mobileMoneyName);
      }

      const result = await updateBankAccount(formData);

      if (result?.success) {
        toast.success(
          paymentMethod === "bank"
            ? "Bank account information updated successfully!"
            : "Mobile money information updated successfully!"
        );
        setShowBankDialog(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update payment information");
    } finally {
      setIsSubmittingBank(false);
    }
  };

  const handleRequestPayout = async () => {
    // Check if payment method is set up
    if (!hasBankAccount && !hasMobileMoney) {
      toast.error("Please add your bank account or mobile money details first");
      setShowBankDialog(true);
      return;
    }

    if (availableForPayout < 1) {
      toast.error("Minimum ₵1.00 required for payout");
      return;
    }

    // Use payment details for payout
    const formData = new FormData();
    // For now, still use paypalEmail field but we can update the backend later
    formData.append("paypalEmail", user?.email || paystackEmail);

    await submitPayout(formData);
  };

  const handleRemoveBankAccount = async () => {
    setIsDeletingBank(true);
    try {
      const result = await removeBankAccount();
      if (result?.success) {
        toast.success("Bank account removed successfully!");
        setShowDeleteBankDialog(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to remove bank account");
    } finally {
      setIsDeletingBank(false);
    }
  };

  const handleRemoveMobileMoney = async () => {
    setIsDeletingMobile(true);
    try {
      const result = await removeMobileMoney();
      if (result?.success) {
        toast.success("Mobile money account removed successfully!");
        setShowDeleteMobileDialog(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to remove mobile money account");
    } finally {
      setIsDeletingMobile(false);
    }
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
            <Button className="bg-white hover:bg-gray-100 text-gray-900">
              <Wallet className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Request Payout</DialogTitle>
              <DialogDescription className="text-gray-400">
                {hasBankAccount || hasMobileMoney
                  ? "Request payout to your payment method"
                  : "Please add your payment method details first"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!hasBankAccount && !hasMobileMoney ? (
                <>
                  <Alert className="bg-yellow-900/20 border-yellow-700/30">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-sm text-gray-300">
                      You need to add your payment method details before requesting a payout.
                    </AlertDescription>
                  </Alert>
                  <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div className="text-sm text-gray-300">
                        <p className="font-medium mb-1">Available for Payout:</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          ₵{availableForPayout.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setShowRequestDialog(false);
                      setShowBankDialog(true);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-emerald-900/10 border border-emerald-700/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                      <div className="text-sm text-gray-300 flex-1">
                        <p className="font-medium mb-2">Payout Details</p>
                        <div className="space-y-1">
                          {hasBankAccount && (
                            <>
                              <p>
                                <span className="text-gray-400">Bank:</span> {user.bankName}
                              </p>
                              <p>
                                <span className="text-gray-400">Account:</span> ****
                                {user.bankAccountNumber.slice(-4)}
                              </p>
                            </>
                          )}
                          {hasMobileMoney && (
                            <>
                              <p>
                                <span className="text-gray-400">Provider:</span> {user.mobileMoneyProvider}
                              </p>
                              <p>
                                <span className="text-gray-400">Number:</span> {user.mobileMoneyNumber}
                              </p>
                            </>
                          )}
                          <p className="font-bold text-emerald-400 mt-2">
                            Amount: ₵{availableForPayout.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Alert className="bg-blue-900/20 border-blue-700/30">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-sm text-gray-300">
                      This amount will be transferred to your bank account within 3-5 business
                      days.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={handleRequestPayout}
                    disabled={loading || availableForPayout < 1}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Request Payout
                      </>
                    )}
                  </Button>
                </>
              )}
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

      {/* Payment Methods Section */}
      <Card className="border-emerald-900/20 bg-gray-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-400" />
                Payment Methods
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Add your bank account or mobile money details to receive payouts
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowBankDialog(true)}
              className="border-emerald-900/30"
            >
              {(hasBankAccount || hasMobileMoney) ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Payment Method
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasBankAccount || hasMobileMoney ? (
            <div className="space-y-4">
              {/* Bank Account Info */}
              {hasBankAccount && (
                <div className="p-4 bg-emerald-900/10 rounded-lg border border-emerald-900/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">Bank Account</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteBankDialog(true)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Account Holder Name</p>
                      <p className="text-white font-medium">{user.bankAccountName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Account Number</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">
                          {showAccountNumber
                            ? user.bankAccountNumber
                            : `****${user.bankAccountNumber.slice(-4)}`}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setShowAccountNumber(!showAccountNumber)}
                        >
                          {showAccountNumber ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Bank Name</p>
                      <p className="text-white font-medium">{user.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Routing/Sort Code</p>
                      <p className="text-white font-medium">{user.bankRoutingNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Money Info */}
              {hasMobileMoney && (
                <div className="p-4 bg-blue-900/10 rounded-lg border border-blue-900/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-blue-400" />
                      <h3 className="text-sm font-semibold text-white">Mobile Money</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteMobileDialog(true)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Provider</p>
                      <p className="text-white font-medium">{user.mobileMoneyProvider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                      <p className="text-white font-medium">{user.mobileMoneyNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Account Name</p>
                      <p className="text-white font-medium">{user.mobileMoneyName}</p>
                    </div>
                  </div>
                </div>
              )}

              <Alert className="bg-emerald-900/10 border-emerald-900/30">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <AlertDescription className="text-sm text-gray-300">
                  Your payment method{hasBankAccount && hasMobileMoney ? "s are" : " is"} set up. Payouts will be sent to{" "}
                  {hasBankAccount && hasMobileMoney
                    ? "your selected payment method"
                    : hasBankAccount
                    ? "your bank account"
                    : "your mobile money account"}
                  .
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 mb-2">No payment method added yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Add your bank account or mobile money details to receive payouts from your earnings
              </p>
              <Button
                onClick={() => setShowBankDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Payment Method Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Payment Method Information
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Add or update your bank account or mobile money details to receive payouts
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBankSubmit} className="space-y-4">
            {/* Payment Method Tabs */}
            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v)}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
                <TabsTrigger value="bank" className="data-[state=active]:bg-emerald-600">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Bank Account
                </TabsTrigger>
                <TabsTrigger value="mobile" className="data-[state=active]:bg-emerald-600">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile Money
                </TabsTrigger>
              </TabsList>

              {/* Bank Account Form */}
              <TabsContent value="bank" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccountName" className="text-gray-300">
                    Account Holder Name *
                  </Label>
                  <Input
                    id="bankAccountName"
                    value={bankFormData.bankAccountName}
                    onChange={(e) =>
                      setBankFormData({ ...bankFormData, bankAccountName: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="John Doe"
                    required={paymentMethod === "bank"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber" className="text-gray-300">
                      Account Number *
                    </Label>
                    <Input
                      id="bankAccountNumber"
                      value={bankFormData.bankAccountNumber}
                      onChange={(e) =>
                        setBankFormData({ ...bankFormData, bankAccountNumber: e.target.value })
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="1234567890"
                      required={paymentMethod === "bank"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="text-gray-300">
                      Bank Name *
                    </Label>
                    <Input
                      id="bankName"
                      value={bankFormData.bankName}
                      onChange={(e) =>
                        setBankFormData({ ...bankFormData, bankName: e.target.value })
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="GT Bank, Access Bank, etc."
                      required={paymentMethod === "bank"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankRoutingNumber" className="text-gray-300">
                      Routing/Sort Code *
                    </Label>
                    <Input
                      id="bankRoutingNumber"
                      value={bankFormData.bankRoutingNumber}
                      onChange={(e) =>
                        setBankFormData({ ...bankFormData, bankRoutingNumber: e.target.value })
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="000123456"
                      required={paymentMethod === "bank"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankCountry" className="text-gray-300">
                      Country *
                    </Label>
                    <Input
                      id="bankCountry"
                      value={bankFormData.bankCountry}
                      onChange={(e) =>
                        setBankFormData({ ...bankFormData, bankCountry: e.target.value })
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="GH"
                      required={paymentMethod === "bank"}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Mobile Money Form */}
              <TabsContent value="mobile" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="mobileMoneyProvider" className="text-gray-300">
                    Mobile Money Provider *
                  </Label>
                  <Select
                    value={mobileMoneyData.mobileMoneyProvider}
                    onValueChange={(value) =>
                      setMobileMoneyData({ ...mobileMoneyData, mobileMoneyProvider: value })
                    }
                    required={paymentMethod === "mobile"}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                      <SelectItem value="VODAFONE">Vodafone Cash</SelectItem>
                      <SelectItem value="AIRTELTIGO">AirtelTigo Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileMoneyNumber" className="text-gray-300">
                    Phone Number *
                  </Label>
                  <Input
                    id="mobileMoneyNumber"
                    value={mobileMoneyData.mobileMoneyNumber}
                    onChange={(e) =>
                      setMobileMoneyData({ ...mobileMoneyData, mobileMoneyNumber: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0244123456"
                    required={paymentMethod === "mobile"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileMoneyName" className="text-gray-300">
                    Account Name *
                  </Label>
                  <Input
                    id="mobileMoneyName"
                    value={mobileMoneyData.mobileMoneyName}
                    onChange={(e) =>
                      setMobileMoneyData({ ...mobileMoneyData, mobileMoneyName: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="John Doe"
                    required={paymentMethod === "mobile"}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Alert className="bg-blue-900/20 border-blue-700/30">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-sm text-gray-300">
                Your payment information is secure and will only be used for processing payouts.
                All earnings will be transferred to your selected payment method.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBankDialog(false)}
                disabled={isSubmittingBank}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingBank}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmittingBank ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save ${paymentMethod === "bank" ? "Bank Account" : "Mobile Money"}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Bank Account Confirmation Dialog */}
      <Dialog open={showDeleteBankDialog} onOpenChange={setShowDeleteBankDialog}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Remove Bank Account?</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to remove your bank account? You won't be able to receive payouts until you add a payment method again.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="bg-yellow-900/20 border-yellow-700/30">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-sm text-gray-300">
                This action cannot be undone. Make sure you have another payment method set up if you need to receive payouts.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteBankDialog(false)}
              disabled={isDeletingBank}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRemoveBankAccount}
              disabled={isDeletingBank}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingBank ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Bank Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Mobile Money Confirmation Dialog */}
      <Dialog open={showDeleteMobileDialog} onOpenChange={setShowDeleteMobileDialog}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Remove Mobile Money?</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to remove your mobile money account? You won't be able to receive payouts until you add a payment method again.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="bg-yellow-900/20 border-yellow-700/30">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-sm text-gray-300">
                This action cannot be undone. Make sure you have another payment method set up if you need to receive payouts.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteMobileDialog(false)}
              disabled={isDeletingMobile}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRemoveMobileMoney}
              disabled={isDeletingMobile}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingMobile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Mobile Money
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
