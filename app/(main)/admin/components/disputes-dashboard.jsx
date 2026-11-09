"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Eye,
  Loader2,
  Mail,
  Scale,
  Search,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { updateDisputeStatus } from "@/actions/admin";
import { getAdminDisputeDetail } from "@/actions/disputes";
import { DisputeChatTranscript } from "@/components/disputes/dispute-chat-transcript";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PANEL =
  "rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

const STATUS_STYLES = {
  OPEN: "border-amber-200 bg-amber-50 text-amber-700",
  UNDER_REVIEW: "border-sky-200 bg-sky-50 text-sky-700",
  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  CLOSED: "border-slate-200 bg-slate-50 text-slate-600",
};

const PRIORITY_STYLES = {
  HIGH: "border-rose-200 bg-rose-50 text-rose-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  LOW: "border-slate-200 bg-slate-50 text-slate-600",
};

function StatCard({ label, value, hint }) {
  return (
    <section className={cn(PANEL, "p-4")}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </section>
  );
}

function PersonLine({ user, label }) {
  if (!user) {
    return (
      <p className="text-sm text-slate-400">
        {label}: <span className="text-slate-500">Not specified</span>
      </p>
    );
  }

  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-slate-950">
        {user.name || "Unnamed user"}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="truncate">{user.email}</span>
      </p>
      {label ? <p className="mt-0.5 text-[11px] text-slate-400">{label}</p> : null}
    </div>
  );
}

export function DisputesDashboard({ initialDisputes = [], initialStats = {} }) {
  const [disputes, setDisputes] = useState(initialDisputes);
  const [stats, setStats] = useState(initialStats);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [chat, setChat] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [resolution, setResolution] = useState("");
  const [nextStatus, setNextStatus] = useState("UNDER_REVIEW");
  const [nextPriority, setNextPriority] = useState("MEDIUM");

  const { loading, data, fn: submitUpdate } = useFetch(updateDisputeStatus);

  useEffect(() => {
    setDisputes(initialDisputes);
    setStats(initialStats);
  }, [initialDisputes, initialStats]);

  useEffect(() => {
    if (data?.success) {
      toast.success("Dispute updated");
      setDisputes((prev) =>
        prev.map((item) =>
          item.id === data.dispute.id ? { ...item, ...data.dispute } : item
        )
      );
      setSelected(null);
      setChat(null);
      setResolution("");
    }
  }, [data]);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return disputes.filter((dispute) => {
      const statusOk =
        statusFilter === "ALL" || dispute.status === statusFilter;
      if (!statusOk) return false;
      if (!query) return true;
      return (
        dispute.subject?.toLowerCase().includes(query) ||
        dispute.description?.toLowerCase().includes(query) ||
        dispute.reporter?.name?.toLowerCase().includes(query) ||
        dispute.reporter?.email?.toLowerCase().includes(query) ||
        dispute.againstUser?.name?.toLowerCase().includes(query) ||
        dispute.againstUser?.email?.toLowerCase().includes(query) ||
        dispute.type?.toLowerCase().includes(query)
      );
    });
  }, [disputes, searchTerm, statusFilter]);

  const openDetails = async (dispute) => {
    setSelected(dispute);
    setChat(null);
    setResolution(dispute.resolution || "");
    setNextStatus(
      dispute.status === "OPEN" ? "UNDER_REVIEW" : dispute.status
    );
    setNextPriority(dispute.priority || "MEDIUM");

    setChatLoading(true);
    try {
      const detail = await getAdminDisputeDetail(dispute.id);
      if (detail?.chat) setChat(detail.chat);
      if (detail?.dispute) setSelected(detail.dispute);
    } catch (error) {
      console.error("Failed to load dispute chat:", error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected || loading) return;
    const formData = new FormData();
    formData.append("disputeId", selected.id);
    formData.append("status", nextStatus);
    formData.append("priority", nextPriority);
    formData.append("resolution", resolution);
    await submitUpdate(formData);
  };

  return (
    <div className="-m-3 min-h-full min-w-0 space-y-4 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:space-y-5 md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-950 md:text-xl">
            Disputes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review booking, campaign, and payment disputes between users.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="font-semibold tabular-nums text-slate-950">
            {stats.attention || 0}
          </span>
          <span>need attention</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open"
          value={stats.open || 0}
          hint="Newly filed cases"
        />
        <StatCard
          label="Under review"
          value={stats.underReview || 0}
          hint="Being investigated"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved || 0}
          hint="Closed with outcome"
        />
        <StatCard
          label="Total"
          value={stats.total || 0}
          hint="All dispute records"
        />
      </div>

      <section className={cn(PANEL, "overflow-hidden")}>
        <div className="border-b border-slate-100 px-4 py-4 md:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Dispute queue
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {filtered.length}{" "}
                {filtered.length === 1 ? "case" : "cases"} shown
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:min-w-[420px]">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search subject, user, or type..."
                  className="h-10 rounded-full border-slate-200 bg-white pl-9 text-sm text-slate-900 placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full rounded-full border-slate-200 bg-white text-sm text-slate-700 sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-16 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white">
                <Scale className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-slate-950">
                No disputes in this view
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                When users escalate booking, campaign, or payment issues, they
                will appear here for admin review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((dispute) => (
                <article
                  key={dispute.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50/70"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
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
                          {dispute.status.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            PRIORITY_STYLES[dispute.priority]
                          )}
                        >
                          {dispute.priority}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
                        >
                          {dispute.type}
                        </Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {dispute.description}
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <PersonLine user={dispute.reporter} label="Reporter" />
                        <PersonLine
                          user={dispute.againstUser}
                          label="Against"
                        />
                      </div>
                      <p className="mt-3 text-xs text-slate-400">
                        Filed{" "}
                        {format(
                          new Date(dispute.createdAt),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetails(dispute)}
                      className="h-9 shrink-0 rounded-full border-slate-200 px-3 text-slate-700 hover:bg-slate-100"
                    >
                      <Eye className="mr-1.5 h-4 w-4" />
                      Review
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {selected ? (
        <Dialog
          open={!!selected}
          onOpenChange={() => {
            setSelected(null);
            setChat(null);
          }}
        >
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-slate-200 bg-white text-slate-900">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-950 sm:text-xl">
                {selected.subject}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Review the booking chat, then update status and resolution notes.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-2 xl:grid-cols-2">
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      STATUS_STYLES[selected.status]
                    )}
                  >
                    {selected.status.replace("_", " ")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      PRIORITY_STYLES[selected.priority]
                    )}
                  >
                    {selected.priority}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
                  >
                    {selected.type}
                  </Badge>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-line">
                  {selected.description}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Reporter</p>
                    <div className="mt-2">
                      <PersonLine user={selected.reporter} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Against</p>
                    <div className="mt-2">
                      <PersonLine user={selected.againstUser} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </label>
                    <Select value={nextStatus} onValueChange={setNextStatus}>
                      <SelectTrigger className="h-10 rounded-full border-slate-200 bg-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Priority
                    </label>
                    <Select value={nextPriority} onValueChange={setNextPriority}>
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
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Resolution notes
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={4}
                    placeholder="Summarize the outcome or next steps..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10"
                  />
                </div>
              </div>

              <div>
                {chatLoading ? (
                  <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading booking chat...
                  </div>
                ) : (
                  <DisputeChatTranscript chat={chat} />
                )}
              </div>
            </div>

            {loading ? (
              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-950" />
              </div>
            ) : null}

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setSelected(null)}
                disabled={loading}
                className="h-10 w-full rounded-full border-slate-200 text-slate-700 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={loading}
                className="h-10 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Save update
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
