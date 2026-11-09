"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  User,
  DollarSign,
  Mail,
  Loader2,
  AlertCircle,
  Wallet,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { approvePayout } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PANEL =
  "rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function PendingPayouts({ payouts }) {
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  const { loading, data, fn: submitApproval } = useFetch(approvePayout);

  const totalNet = payouts.reduce(
    (sum, payout) => sum + (Number(payout.netAmount) || 0),
    0
  );
  const totalCredits = payouts.reduce(
    (sum, payout) => sum + (Number(payout.credits) || 0),
    0
  );

  const handleViewDetails = (payout) => {
    setSelectedPayout(payout);
  };

  const handleApprovePayout = (payout) => {
    setSelectedPayout(payout);
    setShowApproveDialog(true);
  };

  const confirmApproval = async () => {
    if (!selectedPayout || loading) return;

    const formData = new FormData();
    formData.append("payoutId", selectedPayout.id);

    await submitApproval(formData);
  };

  useEffect(() => {
    if (data?.success) {
      setShowApproveDialog(false);
      setSelectedPayout(null);
      toast.success("Payout approved successfully!");
    }
  }, [data]);

  const closeDialogs = () => {
    setSelectedPayout(null);
    setShowApproveDialog(false);
  };

  return (
    <div className="-m-3 min-h-full min-w-0 space-y-4 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:space-y-5 md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-950 md:text-xl">
            Payouts
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and approve talent payout requests.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <Wallet className="h-4 w-4 text-amber-600" />
          <span className="font-semibold tabular-nums text-slate-950">
            {payouts.length}
          </span>
          <span>pending</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <section className={cn(PANEL, "p-4")}>
          <p className="text-xs font-medium text-slate-500">Requests</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
            {payouts.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Awaiting approval</p>
        </section>
        <section className={cn(PANEL, "p-4")}>
          <p className="text-xs font-medium text-slate-500">Credits queued</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
            {totalCredits}
          </p>
          <p className="mt-1 text-xs text-slate-400">Across all requests</p>
        </section>
        <section className={cn(PANEL, "p-4")}>
          <p className="text-xs font-medium text-slate-500">Net to pay</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
            {money(totalNet)}
          </p>
          <p className="mt-1 text-xs text-slate-400">After platform fees</p>
        </section>
      </div>

      <section className={cn(PANEL, "overflow-hidden")}>
        <div className="border-b border-slate-100 px-4 py-4 md:px-5">
          <h2 className="text-base font-semibold text-slate-950">
            Pending payouts
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Confirm PayPal details and credit balances before approving.
          </p>
        </div>

        <div className="p-3 md:p-4">
          {payouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-16 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white">
                <Wallet className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-slate-950">
                No payouts waiting
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                There are no pending payout requests right now. New talent
                withdrawals will appear here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout) => {
                const insufficient =
                  payout.creator.credits < payout.credits;

                return (
                  <article
                    key={payout.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50/70"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                          <User className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-slate-950">
                              {payout.creator.name || "Unnamed talent"}
                            </h3>
                            <Badge
                              variant="outline"
                              className="rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"
                            >
                              Pending
                            </Badge>
                            {insufficient ? (
                              <Badge
                                variant="outline"
                                className="rounded-full border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700"
                              >
                                Insufficient credits
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {payout.creator.specialty || "Specialty not listed"}
                          </p>
                          <div className="mt-2 flex flex-col gap-1.5 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
                            <span className="inline-flex items-center gap-1.5">
                              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                              {payout.credits} credits · {money(payout.netAmount)} net
                            </span>
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <span className="truncate">{payout.paypalEmail}</span>
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs text-slate-400">
                            Requested{" "}
                            {format(
                              new Date(payout.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(payout)}
                          className="h-9 flex-1 rounded-full border-slate-200 px-3 text-slate-700 hover:bg-slate-100 sm:flex-initial"
                        >
                          <Eye className="mr-1.5 h-4 w-4" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprovePayout(payout)}
                          disabled={insufficient}
                          className="h-9 flex-1 rounded-full bg-slate-950 px-3 text-white hover:bg-slate-800 sm:flex-initial"
                        >
                          <Check className="mr-1.5 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedPayout && !showApproveDialog ? (
        <Dialog open={!!selectedPayout} onOpenChange={closeDialogs}>
          <DialogContent className="mx-2 max-h-[90vh] max-w-2xl overflow-y-auto border-slate-200 bg-white text-slate-900 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-950 sm:text-xl">
                Payout request details
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Review talent details and payout amounts before approving.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-700" />
                  <h3 className="text-sm font-semibold text-slate-950">
                    Talent information
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { label: "Name", value: selectedPayout.creator.name },
                    { label: "Email", value: selectedPayout.creator.email },
                    {
                      label: "Specialty",
                      value: selectedPayout.creator.specialty || "Not listed",
                    },
                    {
                      label: "Current credits",
                      value: selectedPayout.creator.credits,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="mt-1 break-all text-sm font-medium text-slate-950">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-700" />
                  <h3 className="text-sm font-semibold text-slate-950">
                    Payout breakdown
                  </h3>
                </div>
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Credits to pay out</span>
                    <span className="font-medium text-slate-950">
                      {selectedPayout.credits}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">
                      Gross amount (10 USD/credit)
                    </span>
                    <span className="font-medium text-slate-950">
                      {money(selectedPayout.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">
                      Platform fee (2 USD/credit)
                    </span>
                    <span className="font-medium text-slate-950">
                      -{money(selectedPayout.platformFee)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-slate-200 pt-3">
                    <span className="font-semibold text-slate-950">Net payout</span>
                    <span className="font-semibold text-slate-950">
                      {money(selectedPayout.netAmount)}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-xs text-slate-500">PayPal email</p>
                    <p className="mt-1 break-all text-sm font-medium text-slate-950">
                      {selectedPayout.paypalEmail}
                    </p>
                  </div>
                </div>
              </div>

              {selectedPayout.creator.credits < selectedPayout.credits ? (
                <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Warning: this talent currently has only{" "}
                    {selectedPayout.creator.credits} credits, but this payout
                    requires {selectedPayout.credits}. It cannot be processed.
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={closeDialogs}
                className="h-10 w-full rounded-full border-slate-200 text-slate-700 sm:w-auto"
              >
                Close
              </Button>
              <Button
                onClick={() => handleApprovePayout(selectedPayout)}
                disabled={
                  selectedPayout.creator.credits < selectedPayout.credits
                }
                className="h-10 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 sm:w-auto"
              >
                <Check className="mr-1.5 h-4 w-4" />
                Approve payout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {showApproveDialog && selectedPayout ? (
        <Dialog
          open={showApproveDialog}
          onOpenChange={() => setShowApproveDialog(false)}
        >
          <DialogContent className="mx-2 max-h-[90vh] overflow-y-auto border-slate-200 bg-white text-slate-900 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-950 sm:text-xl">
                Confirm payout approval
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Are you sure you want to approve this payout?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This action will:
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    <li>
                      Deduct {selectedPayout.credits} credits from{" "}
                      {selectedPayout.creator.name}&apos;s account
                    </li>
                    <li>Mark the payout as PROCESSED</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Talent</span>
                  <span className="font-medium text-slate-950">
                    {selectedPayout.creator.name}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Amount to pay</span>
                  <span className="font-semibold text-slate-950">
                    {money(selectedPayout.netAmount)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">PayPal</span>
                  <span className="break-all text-right font-medium text-slate-950">
                    {selectedPayout.paypalEmail}
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-950" />
              </div>
            ) : null}

            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
                disabled={loading}
                className="h-10 w-full rounded-full border-slate-200 text-slate-700 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmApproval}
                disabled={loading}
                className="h-10 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirm approval
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
