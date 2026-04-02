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
import { CreatorPageShell, creatorCardClass } from "./creator-page-shell";

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
      <Badge variant="default" className="flex items-center gap-1 border-primary/20 bg-primary/10 text-primary">
        <CheckCircle className="h-3 w-3" />
        Processed
      </Badge>
    );
  };

  return (
    <CreatorPageShell
      eyebrow="Payments"
      title="Payouts & earnings"
      description="Manage your earnings, payment methods, and payout requests."
      actions={
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogTrigger asChild>
            <Button variant="marketing" className="gap-2">
              <Wallet className="h-4 w-4" />
              Request payout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md border-border/60 bg-card/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-foreground">Request payout</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {hasBankAccount || hasMobileMoney
                  ? "Request payout to your payment method"
                  : "Please add your payment method details first"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!hasBankAccount && !hasMobileMoney ? (
                <>
                  <Alert className="border-amber-500/30 bg-amber-500/10">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-sm text-muted-foreground">
                      You need to add your payment method details before requesting a payout.
                    </AlertDescription>
                  </Alert>
                  <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-1">Available for Payout:</p>
                        <p className="text-2xl font-bold tabular-nums text-primary">
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
                    variant="default" className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </>
              ) : (
                <>
                  <div className="rounded-lg border border-primary/25 bg-primary/10 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                      <div className="text-sm text-muted-foreground flex-1">
                        <p className="font-medium mb-2">Payout Details</p>
                        <div className="space-y-1">
                          {hasBankAccount && (
                            <>
                              <p>
                                <span className="text-muted-foreground">Bank:</span> {user.bankName}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Account:</span> ****
                                {user.bankAccountNumber.slice(-4)}
                              </p>
                            </>
                          )}
                          {hasMobileMoney && (
                            <>
                              <p>
                                <span className="text-muted-foreground">Provider:</span> {user.mobileMoneyProvider}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Number:</span> {user.mobileMoneyNumber}
                              </p>
                            </>
                          )}
                          <p className="mt-2 font-bold tabular-nums text-primary">
                            Amount: ₵{availableForPayout.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Alert className="border-primary/25 bg-primary/5">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm text-muted-foreground">
                      This amount will be transferred to your bank account within 3-5 business
                      days.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={handleRequestPayout}
                    disabled={loading || availableForPayout < 1}
                    variant="marketing"
                    className="w-full"
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
      }
    >
      <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={creatorCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Available for payout</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">₵{availableForPayout.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={creatorCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Total earnings</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">₵{totalEarnings.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={creatorCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">This month</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">₵{thisMonthEarnings.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Banknote className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={creatorCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Pending payouts</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {payouts.filter((p) => p.status === "PROCESSING").length}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Section */}
      <Card className={creatorCardClass}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment methods
              </CardTitle>
              <CardDescription className="mt-1 text-muted-foreground">
                Add your bank account or mobile money details to receive payouts
              </CardDescription>
            </div>
            <Button
              variant="glass"
              onClick={() => setShowBankDialog(true)}
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
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Bank account</h3>
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
                      <p className="mb-1 text-sm text-muted-foreground">Account holder name</p>
                      <p className="font-medium text-foreground">{user.bankAccountName}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">Account number</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
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
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">Bank name</p>
                      <p className="font-medium text-foreground">{user.bankName}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">Routing / sort code</p>
                      <p className="font-medium text-foreground">{user.bankRoutingNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Money Info */}
              {hasMobileMoney && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Mobile money</h3>
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
                      <p className="mb-1 text-sm text-muted-foreground">Provider</p>
                      <p className="font-medium text-foreground">{user.mobileMoneyProvider}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">Phone number</p>
                      <p className="font-medium text-foreground">{user.mobileMoneyNumber}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">Account name</p>
                      <p className="font-medium text-foreground">{user.mobileMoneyName}</p>
                    </div>
                  </div>
                </div>
              )}

              <Alert className="border-primary/25 bg-primary/5">
                <CheckCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm text-muted-foreground">
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
              <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="mb-2 text-muted-foreground">No payment method added yet</p>
              <p className="mb-4 text-sm text-muted-foreground/80">
                Add your bank account or mobile money details to receive payouts from your earnings
              </p>
              <Button variant="marketing" onClick={() => setShowBankDialog(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="payouts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-xl border border-border/60 bg-card/60 p-1">
          <TabsTrigger
            value="payouts"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Payout history
          </TabsTrigger>
          <TabsTrigger
            value="escrow"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Shield className="mr-2 h-4 w-4" />
            Escrow payments
          </TabsTrigger>
        </TabsList>

        {/* Payout History Tab */}
        <TabsContent value="payouts" className="space-y-4 mt-6">
          <Card className={creatorCardClass}>
            <CardHeader>
              <CardTitle className="text-foreground">Payout history</CardTitle>
              <CardDescription className="text-muted-foreground">
                Track all your payout requests and processed payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p>No payout history yet</p>
                  <p className="text-sm mt-2">Request your first payout when you have earnings available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="rounded-lg border border-border/60 bg-muted/20 p-4 transition-colors hover:border-primary/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-foreground">Payout request</h3>
                            {getStatusBadge(payout.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Net amount</p>
                              <p className="text-lg font-medium tabular-nums text-foreground">₵{payout.netAmount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Credits</p>
                              <p className="font-medium text-foreground">{payout.credits}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Platform fee</p>
                              <p className="font-medium tabular-nums text-foreground">-₵{payout.platformFee.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p className="font-medium text-foreground">
                                {format(new Date(payout.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          {payout.processedAt && (
                            <p className="mt-2 text-sm text-muted-foreground">
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
          <Card className={creatorCardClass}>
            <CardHeader>
              <CardTitle className="text-foreground">Escrow payments</CardTitle>
              <CardDescription className="text-muted-foreground">
                Payments held in escrow until services are completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p>Escrow payments will appear here</p>
                <p className="text-sm mt-2">Payments are held securely until services are completed</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Method Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-border/60 bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Payment method information
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add or update your bank account or mobile money details to receive payouts
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBankSubmit} className="space-y-4">
            {/* Payment Method Tabs */}
            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v)}>
              <TabsList className="grid w-full grid-cols-2 rounded-xl border border-border/60 bg-card/60 p-1">
                <TabsTrigger
                  value="bank"
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Bank account
                </TabsTrigger>
                <TabsTrigger
                  value="mobile"
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Mobile money
                </TabsTrigger>
              </TabsList>

              {/* Bank Account Form */}
              <TabsContent value="bank" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccountName" className="text-muted-foreground">
                    Account Holder Name *
                  </Label>
                  <Input
                    id="bankAccountName"
                    value={bankFormData.bankAccountName}
                    onChange={(e) =>
                      setBankFormData({ ...bankFormData, bankAccountName: e.target.value })
                    }
                    className="border-border/60 bg-background text-foreground"
                    placeholder="John Doe"
                    required={paymentMethod === "bank"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber" className="text-muted-foreground">
                      Account Number *
                    </Label>
                    <Input
                      id="bankAccountNumber"
                      value={bankFormData.bankAccountNumber}
                      onChange={(e) =>
                        setBankFormData({ ...bankFormData, bankAccountNumber: e.target.value })
                      }
                      className="border-border/60 bg-background text-foreground"
                      placeholder="1234567890"
                      required={paymentMethod === "bank"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="text-muted-foreground">
                      Bank Name *
                    </Label>
                    <Input
                      id="bankName"
                      value={bankFormData.bankName}
                      onChange={(e) =>
                        setBankFormData({ ...bankFormData, bankName: e.target.value })
                      }
                      className="border-border/60 bg-background text-foreground"
                      placeholder="GT Bank, Access Bank, etc."
                      required={paymentMethod === "bank"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankRoutingNumber" className="text-muted-foreground">
                      Routing/Sort Code *
                    </Label>
                    <Input
                      id="bankRoutingNumber"
                      value={bankFormData.bankRoutingNumber}
                      onChange={(e) =>
                        setBankFormData({ ...bankFormData, bankRoutingNumber: e.target.value })
                      }
                      className="border-border/60 bg-background text-foreground"
                      placeholder="000123456"
                      required={paymentMethod === "bank"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankCountry" className="text-muted-foreground">
                      Country *
                    </Label>
                    <Input
                      id="bankCountry"
                      value={bankFormData.bankCountry}
                      onChange={(e) =>
                        setBankFormData({ ...bankFormData, bankCountry: e.target.value })
                      }
                      className="border-border/60 bg-background text-foreground"
                      placeholder="GH"
                      required={paymentMethod === "bank"}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Mobile Money Form */}
              <TabsContent value="mobile" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="mobileMoneyProvider" className="text-muted-foreground">
                    Mobile Money Provider *
                  </Label>
                  <Select
                    value={mobileMoneyData.mobileMoneyProvider}
                    onValueChange={(value) =>
                      setMobileMoneyData({ ...mobileMoneyData, mobileMoneyProvider: value })
                    }
                    required={paymentMethod === "mobile"}
                  >
                    <SelectTrigger className="border-border/60 bg-background text-foreground">
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
                  <Label htmlFor="mobileMoneyNumber" className="text-muted-foreground">
                    Phone Number *
                  </Label>
                  <Input
                    id="mobileMoneyNumber"
                    value={mobileMoneyData.mobileMoneyNumber}
                    onChange={(e) =>
                      setMobileMoneyData({ ...mobileMoneyData, mobileMoneyNumber: e.target.value })
                    }
                    className="border-border/60 bg-background text-foreground"
                    placeholder="0244123456"
                    required={paymentMethod === "mobile"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileMoneyName" className="text-muted-foreground">
                    Account Name *
                  </Label>
                  <Input
                    id="mobileMoneyName"
                    value={mobileMoneyData.mobileMoneyName}
                    onChange={(e) =>
                      setMobileMoneyData({ ...mobileMoneyData, mobileMoneyName: e.target.value })
                    }
                    className="border-border/60 bg-background text-foreground"
                    placeholder="John Doe"
                    required={paymentMethod === "mobile"}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Alert className="border-primary/25 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm text-muted-foreground">
                Your payment information is secure and will only be used for processing payouts.
                All earnings will be transferred to your selected payment method.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="glass"
                onClick={() => setShowBankDialog(false)}
                disabled={isSubmittingBank}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingBank} variant="marketing">
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
        <DialogContent className="max-w-md border-border/60 bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Remove bank account?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to remove your bank account? You won&apos;t be able to receive payouts until you add a payment method again.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="border-amber-500/30 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-sm text-muted-foreground">
                This action cannot be undone. Make sure you have another payment method set up if you need to receive payouts.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="glass"
              onClick={() => setShowDeleteBankDialog(false)}
              disabled={isDeletingBank}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveBankAccount}
              disabled={isDeletingBank}
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
        <DialogContent className="max-w-md border-border/60 bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Remove mobile money?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to remove your mobile money account? You won&apos;t be able to receive payouts until you add a payment method again.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="border-amber-500/30 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-sm text-muted-foreground">
                This action cannot be undone. Make sure you have another payment method set up if you need to receive payouts.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="glass"
              onClick={() => setShowDeleteMobileDialog(false)}
              disabled={isDeletingMobile}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveMobileMoney}
              disabled={isDeletingMobile}
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
    </CreatorPageShell>
  );
}
