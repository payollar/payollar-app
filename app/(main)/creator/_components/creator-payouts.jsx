"use client";

import { useEffect, useMemo, useState } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wallet,
  Clock,
  CheckCircle,
  CreditCard,
  Shield,
  TrendingUp,
  Banknote,
  AlertCircle,
  Loader2,
  Edit,
  Eye,
  EyeOff,
  Smartphone,
  Trash2,
  ArrowUpRight,
  Plus,
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
import { BorderBeam } from "border-beam";
import { CreatorPageShell, creatorCardClass } from "./creator-page-shell";
import { cn } from "@/lib/utils";

const PAYOUT_CARD_METAL =
  "linear-gradient(135deg, #f8fafc 0%, #94a3b8 14%, #e2e8f0 28%, #64748b 42%, #f1f5f9 56%, #475569 70%, #cbd5e1 84%, #94a3b8 100%)";

function money(value) {
  return `GH₵ ${Number(value || 0).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function MetricCard({ label, value, hint, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-[#eef4ff] text-[#0055ff]",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className={cn(creatorCardClass, "p-3.5")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-slate-500">{label}</p>
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums text-slate-950">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

function StatusPill({ status }) {
  if (status === "PROCESSING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <Clock className="h-3 w-3" />
        Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      <CheckCircle className="h-3 w-3" />
      Processed
    </span>
  );
}

export function CreatorPayoutsPage({
  user,
  payouts = [],
  earnings = {},
  creditActivity = [],
}) {
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

  const hasBankAccount =
    user?.bankAccountName &&
    user?.bankAccountNumber &&
    user?.bankName &&
    user?.bankRoutingNumber;

  const hasMobileMoney =
    user?.mobileMoneyProvider &&
    user?.mobileMoneyNumber &&
    user?.mobileMoneyName;

  const hasPaymentMethod = Boolean(hasBankAccount || hasMobileMoney);
  // Welcome credits (1 ≈ GH₵1) count in the wallet but stay locked until first booking
  const creditBalance = Number(
    earnings.creditBalance ?? user?.credits ?? 0
  );
  const lockedWelcomeCredits = Number(earnings.lockedWelcomeCredits || 0);
  const walletBalance =
    Number(earnings.totalEarnings || 0) + creditBalance;
  // Server already excludes locked welcome credits from availableForPayout
  const availableForPayout = Number(earnings.availableForPayout || 0);
  const totalEarnings = walletBalance;
  const thisMonthEarnings = earnings.thisMonthEarnings || 0;
  const pendingCount = payouts.filter((p) => p.status === "PROCESSING").length;
  const processedCount = payouts.filter((p) => p.status !== "PROCESSING").length;
  const firstName = user?.name?.split(" ")[0] || "Creator";
  const hasLockedWelcomeCredits = lockedWelcomeCredits > 0;

  const monthlyBars = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: format(d, "MMM"),
        amount: 0,
      });
    }
    for (const payout of payouts) {
      const created = new Date(payout.createdAt);
      const key = `${created.getFullYear()}-${created.getMonth()}`;
      const row = months.find((m) => m.key === key);
      if (row) row.amount += Number(payout.netAmount || 0);
    }
    return months;
  }, [payouts]);

  const maxBar = Math.max(...monthlyBars.map((m) => m.amount), 0);

  const recentActivity = useMemo(() => {
    const fromPayouts = payouts.map((payout) => ({
      id: `payout-${payout.id}`,
      kind: "payout",
      label: "Payout request",
      amount: Number(payout.netAmount || 0),
      status: payout.status,
      createdAt: payout.createdAt,
    }));
    const fromCredits = creditActivity.map((row) => ({
      id: `credit-${row.id}`,
      kind: "credit",
      label: row.label,
      amount: Number(row.amount || 0),
      status: null,
      createdAt: row.createdAt,
    }));
    return [...fromPayouts, ...fromCredits]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [payouts, creditActivity]);

  useEffect(() => {
    if (data?.success) {
      toast.success("Payout request submitted successfully!");
      setShowRequestDialog(false);
      setPaystackEmail("");
      router.refresh();
    } else if (data?.error) {
      toast.error(data.error || "Failed to request payout");
    }
  }, [data, router]);

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
    if (!hasPaymentMethod) {
      toast.error("Please add your bank account or mobile money details first");
      setShowBankDialog(true);
      return;
    }

    if (availableForPayout < 1) {
      toast.error(
        hasLockedWelcomeCredits
          ? "Welcome credits unlock after your first booking"
          : "Minimum GH₵ 1.00 required for payout"
      );
      return;
    }

    const formData = new FormData();
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

  return (
    <CreatorPageShell
      eyebrow="Payments"
      title={`Hi, ${firstName}`}
      description="Track earnings, manage payout methods, and cash out when ready."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-full border-slate-200 bg-white"
            onClick={() => setShowBankDialog(true)}
          >
            {hasPaymentMethod ? (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit method
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add method
              </>
            )}
          </Button>
          <Button
            className="h-10 rounded-full bg-[#0055ff] text-white hover:bg-[#003ecc]"
            onClick={() => setShowRequestDialog(true)}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Request payout
          </Button>
        </div>
      }
    >
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.7fr)]">
        <div className="space-y-4">
          {/* Wallet hero — white card */}
          <section className="relative overflow-hidden rounded-2xl border border-white bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.05)] sm:p-5">
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Payollar wallet
                </p>
                <p className="mt-2 text-xs text-slate-500">Wallet balance</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-slate-950 sm:text-4xl">
                  {money(walletBalance)}
                </p>
                <p className="mt-1.5 max-w-sm text-xs text-slate-400">
                  {hasLockedWelcomeCredits
                    ? `${money(lockedWelcomeCredits)} welcome credits unlock after your first booking.`
                    : "Ready to withdraw to your bank or mobile money."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestDialog(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Request payout
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowBankDialog(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {hasPaymentMethod ? "Update method" : "Add method"}
                </button>
              </div>
            </div>

            <div className="relative mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "This month", value: money(thisMonthEarnings) },
                { label: "Pending", value: String(pendingCount) },
                { label: "Paid out", value: String(processedCount) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-[#f7f8fc] px-3 py-2.5"
                >
                  <p className="text-[10px] text-slate-400">{item.label}</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Requestable amount + earnings snapshot */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MetricCard
              label="Available to request"
              value={money(availableForPayout)}
              hint={
                hasLockedWelcomeCredits
                  ? `${money(lockedWelcomeCredits)} locked until first booking`
                  : "Can request now"
              }
              icon={Wallet}
              tone="blue"
            />
            <MetricCard
              label="Total earnings"
              value={money(totalEarnings)}
              hint={
                hasLockedWelcomeCredits
                  ? "Includes locked welcome credits"
                  : "From sales & credits"
              }
              icon={TrendingUp}
              tone="emerald"
            />
            <MetricCard
              label="This month"
              value={money(thisMonthEarnings)}
              hint={`${earnings.thisMonthSales || 0} sales`}
              icon={Banknote}
              tone="slate"
            />
            <MetricCard
              label="Pending payouts"
              value={pendingCount.toLocaleString()}
              hint={pendingCount ? "Awaiting processing" : "None in queue"}
              icon={Clock}
              tone="amber"
            />
          </div>

          {/* Cash flow + history */}
          <section className={cn(creatorCardClass, "overflow-hidden")}>
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Cash flow</h2>
                <p className="text-sm text-slate-500">Payout activity over the last 6 months</p>
              </div>
              <p className="text-lg font-semibold tabular-nums text-slate-950">
                {money(totalEarnings)}
              </p>
            </div>

            <div className="px-5 py-5">
              <div className="flex h-36 items-end gap-2 sm:gap-3">
                {monthlyBars.map((row) => {
                  const height =
                    maxBar === 0 ? 10 : Math.max(12, (row.amount / maxBar) * 120);
                  return (
                    <div key={row.key} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full max-w-10 rounded-t-xl bg-[#dbe7ff]"
                        style={{
                          height,
                          background:
                            row.amount > 0
                              ? "linear-gradient(180deg, #6d8cff 0%, #0055ff 100%)"
                              : undefined,
                          opacity: row.amount === 0 ? 0.55 : 1,
                        }}
                        title={money(row.amount)}
                      />
                      <span className="text-[11px] text-slate-400">{row.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Tabs defaultValue="payouts" className="gap-0 border-t border-slate-100">
              <div className="px-5 pt-4">
                <TabsList className="h-10 w-full justify-start gap-1 rounded-full bg-[#f4f6fb] p-1 sm:w-auto">
                  <TabsTrigger
                    value="payouts"
                    className="rounded-full px-4 text-sm data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
                  >
                    Payout history
                  </TabsTrigger>
                  <TabsTrigger
                    value="escrow"
                    className="rounded-full px-4 text-sm data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
                  >
                    Escrow
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="payouts" className="mt-0 px-5 pb-5 pt-4">
                {payouts.length === 0 ? (
                  <div className="rounded-2xl bg-[#f7f8fc] px-4 py-10 text-center">
                    <Wallet className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">No payout history yet</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Request a payout once you have available earnings.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {payouts.map((payout) => (
                      <li
                        key={payout.id}
                        className="rounded-2xl border border-slate-100 bg-[#fafbfd] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-950">Payout request</p>
                              <StatusPill status={payout.status} />
                            </div>
                            <p className="mt-1 text-xs text-slate-400">
                              {format(new Date(payout.createdAt), "MMM d, yyyy")}
                              {payout.processedAt
                                ? ` · processed ${format(new Date(payout.processedAt), "MMM d")}`
                                : ""}
                            </p>
                          </div>
                          <p className="text-lg font-semibold tabular-nums text-slate-950">
                            {money(payout.netAmount)}
                          </p>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                          <div>
                            <p className="text-slate-400">Credits</p>
                            <p className="mt-0.5 font-medium tabular-nums text-slate-800">
                              {payout.credits}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">Platform fee</p>
                            <p className="mt-0.5 font-medium tabular-nums text-slate-800">
                              -{money(payout.platformFee)}
                            </p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-slate-400">Gross</p>
                            <p className="mt-0.5 font-medium tabular-nums text-slate-800">
                              {money(payout.amount)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="escrow" className="mt-0 px-5 pb-5 pt-4">
                <div className="rounded-2xl bg-[#f7f8fc] px-4 py-10 text-center">
                  <Shield className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                  <p className="text-sm font-medium text-slate-700">No escrow payments yet</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Funds held until services are completed will show up here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>

        {/* Right rail */}
        <aside className="space-y-4 lg:sticky lg:top-4">
          <BorderBeam
            size="md"
            theme="dark"
            colorVariant="mono"
            strength={1}
            borderRadius={28}
            duration={7}
            className="w-full"
          >
            <section
              className="rounded-[28px] p-[2px] shadow-[0_16px_40px_-20px_rgba(15,23,42,0.55)]"
              style={{ background: PAYOUT_CARD_METAL }}
            >
              <div className="rounded-[26px] bg-[#0b1220] p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">Payout card</p>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80">
                    {hasMobileMoney && !hasBankAccount ? "MoMo" : "Bank"}
                  </span>
                </div>
                <p className="mt-8 text-lg font-semibold tracking-wide">
                  {hasBankAccount
                    ? showAccountNumber
                      ? user.bankAccountNumber
                      : `•••• •••• •••• ${user.bankAccountNumber.slice(-4)}`
                    : hasMobileMoney
                      ? user.mobileMoneyNumber
                      : "•••• •••• •••• ••••"}
                </p>
                <div className="mt-6 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-white/50">Holder</p>
                    <p className="mt-1 text-sm font-medium">
                      {hasBankAccount
                        ? user.bankAccountName
                        : hasMobileMoney
                          ? user.mobileMoneyName
                          : user?.name || "Add payment method"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wide text-white/50">Via</p>
                    <p className="mt-1 text-sm font-medium">
                      {hasBankAccount
                        ? user.bankName
                        : hasMobileMoney
                          ? user.mobileMoneyProvider
                          : "Not set"}
                    </p>
                  </div>
                </div>
                {hasBankAccount ? (
                  <button
                    type="button"
                    onClick={() => setShowAccountNumber((v) => !v)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white"
                  >
                    {showAccountNumber ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Hide number
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Reveal number
                      </>
                    )}
                  </button>
                ) : null}
              </div>
            </section>
          </BorderBeam>

          <section className={cn(creatorCardClass, "p-4")}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-950">Payment methods</h2>
              <button
                type="button"
                onClick={() => setShowBankDialog(true)}
                className="text-xs font-medium text-[#0055ff] hover:text-[#003ecc]"
              >
                Manage
              </button>
            </div>

            {hasPaymentMethod ? (
              <div className="space-y-3">
                {hasBankAccount ? (
                  <div className="rounded-2xl bg-[#f7f8fc] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef4ff] text-[#0055ff]">
                          <CreditCard className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{user.bankName}</p>
                          <p className="text-xs text-slate-400">
                            ****{user.bankAccountNumber.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDeleteBankDialog(true)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Remove bank account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : null}
                {hasMobileMoney ? (
                  <div className="rounded-2xl bg-[#f7f8fc] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef4ff] text-[#0055ff]">
                          <Smartphone className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {user.mobileMoneyProvider}
                          </p>
                          <p className="text-xs text-slate-400">{user.mobileMoneyNumber}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDeleteMobileDialog(true)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Remove mobile money"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#f7f8fc] px-3 py-6 text-center">
                <p className="text-sm text-slate-500">No payment method yet</p>
                <button
                  type="button"
                  onClick={() => setShowBankDialog(true)}
                  className="mt-3 text-sm font-semibold text-[#0055ff]"
                >
                  Add bank or MoMo
                </button>
              </div>
            )}
          </section>

          <section className={cn(creatorCardClass, "p-4")}>
            <h2 className="text-sm font-semibold text-slate-950">Recent activity</h2>
            {recentActivity.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No recent activity.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {recentActivity.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {item.label}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <p className="text-[11px] text-slate-400">
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </p>
                        {item.kind === "payout" && item.status ? (
                          <StatusPill status={item.status} />
                        ) : item.kind === "credit" && item.amount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Credited
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <p
                      className={cn(
                        "shrink-0 text-sm font-semibold tabular-nums",
                        item.amount >= 0 ? "text-emerald-700" : "text-slate-950"
                      )}
                    >
                      {item.amount > 0 ? "+" : ""}
                      {money(Math.abs(item.amount))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {/* Request payout dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent data-theme="light" className="max-w-md border-slate-200 bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-slate-950">Request payout</DialogTitle>
            <DialogDescription className="text-slate-500">
              {hasPaymentMethod
                ? "Confirm transfer to your payment method"
                : "Add a payment method before requesting a payout"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!hasPaymentMethod ? (
              <>
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-sm text-slate-600">
                    You need a bank account or mobile money details first.
                  </AlertDescription>
                </Alert>
                <div className="rounded-2xl bg-[#eef4ff] p-4">
                  <p className="text-sm text-slate-500">Available for payout</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-[#0055ff]">
                    {money(availableForPayout)}
                  </p>
                  {hasLockedWelcomeCredits ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {money(lockedWelcomeCredits)} welcome credits unlock after your first booking
                    </p>
                  ) : null}
                </div>
                <Button
                  onClick={() => {
                    setShowRequestDialog(false);
                    setShowBankDialog(true);
                  }}
                  className="w-full rounded-full bg-[#0055ff] hover:bg-[#003ecc]"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add payment method
                </Button>
              </>
            ) : (
              <>
                <div className="rounded-2xl border border-[#dbe7ff] bg-[#f7f9ff] p-4">
                  <div className="space-y-1 text-sm text-slate-600">
                    {hasBankAccount ? (
                      <>
                        <p>
                          <span className="text-slate-400">Bank:</span> {user.bankName}
                        </p>
                        <p>
                          <span className="text-slate-400">Account:</span> ****
                          {user.bankAccountNumber.slice(-4)}
                        </p>
                      </>
                    ) : null}
                    {hasMobileMoney ? (
                      <>
                        <p>
                          <span className="text-slate-400">Provider:</span>{" "}
                          {user.mobileMoneyProvider}
                        </p>
                        <p>
                          <span className="text-slate-400">Number:</span> {user.mobileMoneyNumber}
                        </p>
                      </>
                    ) : null}
                    <p className="pt-2 text-lg font-semibold tabular-nums text-[#0055ff]">
                      {money(availableForPayout)}
                    </p>
                  </div>
                </div>
                <Alert className="border-slate-200 bg-slate-50">
                  <AlertCircle className="h-4 w-4 text-[#0055ff]" />
                  <AlertDescription className="text-sm text-slate-600">
                    Transfers usually land within 3–5 business days.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleRequestPayout}
                  disabled={loading || availableForPayout < 1}
                  className="w-full rounded-full bg-[#0055ff] hover:bg-[#003ecc]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Confirm payout
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment method dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent
          data-theme="light"
          className="max-h-[90vh] max-w-2xl overflow-y-auto border-slate-200 bg-white text-slate-900"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-950">
              Payment method
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Add or update bank account or mobile money details for payouts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBankSubmit} className="space-y-4">
            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v)}>
              <TabsList className="grid h-11 w-full grid-cols-2 rounded-full bg-[#f4f6fb] p-1">
                <TabsTrigger
                  value="bank"
                  className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Bank
                </TabsTrigger>
                <TabsTrigger
                  value="mobile"
                  className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Mobile money
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bank" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccountName">Account holder name *</Label>
                  <Input
                    id="bankAccountName"
                    value={bankFormData.bankAccountName}
                    onChange={(e) =>
                      setBankFormData({ ...bankFormData, bankAccountName: e.target.value })
                    }
                    className="h-11 rounded-xl"
                    placeholder="John Doe"
                    required={paymentMethod === "bank"}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Account number *</Label>
                    <Input
                      id="bankAccountNumber"
                      value={bankFormData.bankAccountNumber}
                      onChange={(e) =>
                        setBankFormData({ ...bankFormData, bankAccountNumber: e.target.value })
                      }
                      className="h-11 rounded-xl"
                      placeholder="1234567890"
                      required={paymentMethod === "bank"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank name *</Label>
                    <Input
                      id="bankName"
                      value={bankFormData.bankName}
                      onChange={(e) =>
                        setBankFormData({ ...bankFormData, bankName: e.target.value })
                      }
                      className="h-11 rounded-xl"
                      placeholder="GT Bank, Access Bank…"
                      required={paymentMethod === "bank"}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bankRoutingNumber">Routing / sort code *</Label>
                    <Input
                      id="bankRoutingNumber"
                      value={bankFormData.bankRoutingNumber}
                      onChange={(e) =>
                        setBankFormData({ ...bankFormData, bankRoutingNumber: e.target.value })
                      }
                      className="h-11 rounded-xl"
                      placeholder="000123456"
                      required={paymentMethod === "bank"}
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
                      className="h-11 rounded-xl"
                      placeholder="GH"
                      required={paymentMethod === "bank"}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mobile" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Mobile money provider *</Label>
                  <Select
                    value={mobileMoneyData.mobileMoneyProvider}
                    onValueChange={(value) =>
                      setMobileMoneyData({ ...mobileMoneyData, mobileMoneyProvider: value })
                    }
                    required={paymentMethod === "mobile"}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent data-theme="light">
                      <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                      <SelectItem value="VODAFONE">Vodafone Cash</SelectItem>
                      <SelectItem value="AIRTELTIGO">AirtelTigo Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileMoneyNumber">Phone number *</Label>
                  <Input
                    id="mobileMoneyNumber"
                    value={mobileMoneyData.mobileMoneyNumber}
                    onChange={(e) =>
                      setMobileMoneyData({
                        ...mobileMoneyData,
                        mobileMoneyNumber: e.target.value,
                      })
                    }
                    className="h-11 rounded-xl"
                    placeholder="0244123456"
                    required={paymentMethod === "mobile"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileMoneyName">Account name *</Label>
                  <Input
                    id="mobileMoneyName"
                    value={mobileMoneyData.mobileMoneyName}
                    onChange={(e) =>
                      setMobileMoneyData({
                        ...mobileMoneyData,
                        mobileMoneyName: e.target.value,
                      })
                    }
                    className="h-11 rounded-xl"
                    placeholder="John Doe"
                    required={paymentMethod === "mobile"}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Alert className="border-slate-200 bg-slate-50">
              <AlertCircle className="h-4 w-4 text-[#0055ff]" />
              <AlertDescription className="text-sm text-slate-600">
                Payment details are only used to process your creator payouts.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setShowBankDialog(false)}
                disabled={isSubmittingBank}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingBank}
                className="rounded-full bg-[#0055ff] hover:bg-[#003ecc]"
              >
                {isSubmittingBank ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  `Save ${paymentMethod === "bank" ? "bank account" : "mobile money"}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteBankDialog} onOpenChange={setShowDeleteBankDialog}>
        <DialogContent data-theme="light" className="max-w-md border-slate-200 bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle>Remove bank account?</DialogTitle>
            <DialogDescription>
              You won&apos;t be able to receive bank payouts until you add a method again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setShowDeleteBankDialog(false)}
              disabled={isDeletingBank}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
              onClick={handleRemoveBankAccount}
              disabled={isDeletingBank}
            >
              {isDeletingBank ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing…
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteMobileDialog} onOpenChange={setShowDeleteMobileDialog}>
        <DialogContent data-theme="light" className="max-w-md border-slate-200 bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle>Remove mobile money?</DialogTitle>
            <DialogDescription>
              You won&apos;t be able to receive MoMo payouts until you add a method again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setShowDeleteMobileDialog(false)}
              disabled={isDeletingMobile}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
              onClick={handleRemoveMobileMoney}
              disabled={isDeletingMobile}
            >
              {isDeletingMobile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing…
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CreatorPageShell>
  );
}
