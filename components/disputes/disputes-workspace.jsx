"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  AlertTriangle,
  Eye,
  Loader2,
  Plus,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDispute } from "@/actions/disputes";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  OPEN: "border-amber-200 bg-amber-50 text-amber-700",
  UNDER_REVIEW: "border-sky-200 bg-sky-50 text-sky-700",
  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  CLOSED: "border-slate-200 bg-slate-50 text-slate-600",
};

export function DisputesWorkspace({
  role = "CREATOR",
  disputes = [],
  bookings = [],
  basePath = "/creator/disputes",
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const eligibleBookings = useMemo(
    () => bookings.filter((booking) => !booking.openDisputeId),
    [bookings]
  );

  const openCount = disputes.filter((d) =>
    ["OPEN", "UNDER_REVIEW"].includes(d.status)
  ).length;

  const resetForm = () => {
    setAppointmentId("");
    setSubject("");
    setDescription("");
    setPriority("MEDIUM");
  };

  const handleCreate = async () => {
    if (!appointmentId || !subject.trim() || !description.trim()) {
      toast.error("Select a booking and fill in the dispute details");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("appointmentId", appointmentId);
      formData.append("subject", subject.trim());
      formData.append("description", description.trim());
      formData.append("priority", priority);

      const result = await createDispute(formData);
      if (result?.success && result.dispute?.id) {
        toast.success("Dispute submitted");
        setOpen(false);
        resetForm();
        router.push(`${basePath}/${result.dispute.id}`);
        router.refresh();
      } else {
        toast.error("Could not create dispute");
      }
    } catch (error) {
      toast.error(error.message || "Could not create dispute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
            Disputes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Raise and track booking disputes. Our team reviews each case and updates you here.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="font-semibold tabular-nums text-slate-950">
              {openCount}
            </span>
            <span>open</span>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="h-10 rounded-full bg-slate-950 px-4 text-white hover:bg-slate-800"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Raise dispute
          </Button>
        </div>
      </div>

      <section className={cn(DASHBOARD_CARD_CLASS, "overflow-hidden")}>
        <div className="border-b border-slate-100 px-4 py-4 md:px-5">
          <h2 className="text-base font-semibold text-slate-950">Your cases</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Open a case to view status and resolution notes.
          </p>
        </div>

        <div className="p-3 md:p-4">
          {disputes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-16 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white">
                <Scale className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-slate-950">
                No disputes yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                If a booking goes wrong, raise a dispute and include the related
                order so support can review the chat history.
              </p>
              <Button
                onClick={() => setOpen(true)}
                className="mt-4 h-10 rounded-full bg-slate-950 px-4 text-white hover:bg-slate-800"
              >
                Raise dispute
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((dispute) => {
                const other = dispute.isReporter
                  ? dispute.againstUser
                  : dispute.reporter;

                return (
                  <article
                    key={dispute.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50/70"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-950">
                            {dispute.subject}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                              STATUS_STYLES[dispute.status]
                            )}
                          >
                            {String(dispute.status).replaceAll("_", " ")}
                          </Badge>
                          {dispute.isReporter ? (
                            <Badge
                              variant="outline"
                              className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
                            >
                              You filed
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="rounded-full border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700"
                            >
                              Filed against you
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {dispute.description}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          With {other?.name || other?.email || "other party"}
                          {dispute.appointment?.startTime
                            ? ` · booking ${format(
                                new Date(dispute.appointment.startTime),
                                "MMM d, yyyy"
                              )}`
                            : ""}
                          {" · "}
                          {format(new Date(dispute.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-9 shrink-0 rounded-full border-slate-200 px-3 text-slate-700"
                      >
                        <Link href={`${basePath}/${dispute.id}`}>
                          <Eye className="mr-1.5 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-slate-200 bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-950">
              Raise a dispute
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Link a booking so support can review the chat between you and the
              other party.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Booking
              </label>
              <Select value={appointmentId} onValueChange={setAppointmentId}>
                <SelectTrigger className="h-10 rounded-full border-slate-200 bg-white text-sm">
                  <SelectValue placeholder="Select a booking" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleBookings.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No eligible bookings
                    </SelectItem>
                  ) : (
                    eligibleBookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {(booking.other?.name ||
                          booking.other?.email ||
                          "Booking") +
                          ` · ${booking.status}` +
                          (booking.startTime
                            ? ` · ${format(new Date(booking.startTime), "MMM d")}`
                            : "")}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Subject
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Short summary of the issue"
                className="h-10 rounded-full border-slate-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-10 rounded-full border-slate-200 bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Details
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe what went wrong and what outcome you want..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="h-10 w-full rounded-full border-slate-200 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading || eligibleBookings.length === 0}
              className="h-10 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit dispute"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
