import {
  CheckCircle2,
  Clock3,
  FileText,
  RotateCcw,
} from "lucide-react";

export const DELIVERY_REPORT_STATUS = {
  DRAFT: {
    id: "DRAFT",
    creatorLabel: "Draft",
    clientLabel: "In progress",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    bannerClass: "border-slate-200 bg-slate-50 text-slate-700",
    icon: FileText,
  },
  SUBMITTED: {
    id: "SUBMITTED",
    creatorLabel: "Awaiting review",
    clientLabel: "Needs review",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    bannerClass: "border-amber-200 bg-amber-50 text-amber-900",
    icon: Clock3,
  },
  APPROVED: {
    id: "APPROVED",
    creatorLabel: "Approved",
    clientLabel: "Approved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    bannerClass: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: CheckCircle2,
  },
  REVISION_REQUESTED: {
    id: "REVISION_REQUESTED",
    creatorLabel: "Needs revision",
    clientLabel: "Revision requested",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    bannerClass: "border-rose-200 bg-rose-50 text-rose-900",
    icon: RotateCcw,
  },
};

export function reportStatusMeta(status) {
  return DELIVERY_REPORT_STATUS[status] || DELIVERY_REPORT_STATUS.DRAFT;
}

export function checklistProgress(checklist = []) {
  const total = Array.isArray(checklist) ? checklist.length : 0;
  const done = Array.isArray(checklist)
    ? checklist.filter((item) => item?.done).length
    : 0;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

export function sortReportsForClient(reports = []) {
  const rank = {
    SUBMITTED: 0,
    REVISION_REQUESTED: 1,
    DRAFT: 2,
    APPROVED: 3,
  };
  return [...reports].sort((a, b) => {
    const ra = rank[a.status] ?? 9;
    const rb = rank[b.status] ?? 9;
    if (ra !== rb) return ra - rb;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
}

export const PROOF_METRIC_FIELDS = [
  ["views", "Views"],
  ["likes", "Likes"],
  ["comments", "Comments"],
  ["shares", "Shares"],
  ["reach", "Reach"],
];

function toMetricNumber(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Normalize client-set engagement targets. */
export function normalizeMetricTargets(targets) {
  if (!targets || typeof targets !== "object") return null;
  const next = {
    views: toMetricNumber(targets.views),
    likes: toMetricNumber(targets.likes),
    comments: toMetricNumber(targets.comments),
    shares: toMetricNumber(targets.shares),
    reach: toMetricNumber(targets.reach),
  };
  const hasAny = Object.values(next).some((v) => v != null);
  return hasAny ? next : null;
}

export function emptyMetricTargetsForm(targets) {
  return {
    views: targets?.views ?? "",
    likes: targets?.likes ?? "",
    comments: targets?.comments ?? "",
    shares: targets?.shares ?? "",
    reach: targets?.reach ?? "",
  };
}

export function hasMetricTargets(targets) {
  if (!targets || typeof targets !== "object") return false;
  return PROOF_METRIC_FIELDS.some(([key]) => {
    const v = targets[key];
    return v !== "" && v != null;
  });
}

export function formatMetricTargetsSummary(targets) {
  if (!hasMetricTargets(targets)) return null;
  return PROOF_METRIC_FIELDS.map(([key, label]) => {
    const v = targets[key];
    if (v === "" || v == null) return null;
    return `${Number(v).toLocaleString()} ${label.toLowerCase()}`;
  })
    .filter(Boolean)
    .join(" · ");
}

function blankProofEntry(overrides = {}) {
  return {
    url: "",
    views: "",
    likes: "",
    comments: "",
    shares: "",
    reach: "",
    ...overrides,
  };
}

/** Hydrate proof link rows (URL + optional engagement) from saved report data. */
export function proofEntriesFromReport(report) {
  const metrics = report?.metrics && typeof report.metrics === "object" ? report.metrics : {};
  const savedEntries = Array.isArray(metrics.entries) ? metrics.entries : null;
  if (savedEntries?.length) {
    return savedEntries.map((entry) =>
      blankProofEntry({
        url: entry?.url || "",
        views: entry?.views ?? "",
        likes: entry?.likes ?? "",
        comments: entry?.comments ?? "",
        shares: entry?.shares ?? "",
        reach: entry?.reach ?? "",
      })
    );
  }

  const links = Array.isArray(report?.proofLinks) ? report.proofLinks.filter(Boolean) : [];
  const postUrl = metrics.postUrl ? String(metrics.postUrl).trim() : "";
  const urls = [...links];
  if (postUrl && !urls.includes(postUrl)) urls.unshift(postUrl);
  if (!urls.length) return [blankProofEntry()];

  return urls.map((url) => {
    const isPrimary =
      (postUrl && url === postUrl) || (!postUrl && url === urls[0] && metrics.views != null);
    return blankProofEntry({
      url,
      views: isPrimary ? metrics.views ?? "" : "",
      likes: isPrimary ? metrics.likes ?? "" : "",
      comments: isPrimary ? metrics.comments ?? "" : "",
      shares: isPrimary ? metrics.shares ?? "" : "",
      reach: isPrimary ? metrics.reach ?? "" : "",
    });
  });
}

export function emptyMetricsForm(metrics) {
  return {
    platform: metrics?.platform ?? null,
    platformLabel: metrics?.platformLabel ?? null,
    postUrl: metrics?.postUrl || "",
    title: metrics?.title ?? null,
    views: metrics?.views ?? "",
    likes: metrics?.likes ?? "",
    comments: metrics?.comments ?? "",
    shares: metrics?.shares ?? "",
    reach: metrics?.reach ?? "",
    source: metrics?.source || "manual",
    extractedAt: metrics?.extractedAt || null,
    socialSuggested: Boolean(metrics?.socialSuggested),
    entries: Array.isArray(metrics?.entries) ? metrics.entries : [],
  };
}

/** Build metrics JSON + proofLinks from proof entry form rows. */
export function metricsPayloadFromProofEntries(
  entries,
  { socialSuggested = false, targets = null } = {}
) {
  const normalized = (Array.isArray(entries) ? entries : [])
    .map((entry) => {
      const url = String(entry?.url || "").trim();
      if (!url) return null;
      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      return {
        url: href,
        views: toMetricNumber(entry.views),
        likes: toMetricNumber(entry.likes),
        comments: toMetricNumber(entry.comments),
        shares: toMetricNumber(entry.shares),
        reach: toMetricNumber(entry.reach),
      };
    })
    .filter(Boolean)
    .slice(0, 12);

  const primary =
    normalized.find(
      (entry) =>
        entry.views != null ||
        entry.likes != null ||
        entry.comments != null ||
        entry.shares != null ||
        entry.reach != null
    ) || normalized[0] || null;

  return {
    proofLinks: normalized.map((entry) => entry.url),
    metrics: {
      platform: null,
      platformLabel: null,
      postUrl: primary?.url || null,
      title: null,
      views: primary?.views ?? null,
      likes: primary?.likes ?? null,
      comments: primary?.comments ?? null,
      shares: primary?.shares ?? null,
      reach: primary?.reach ?? null,
      source: "manual",
      extractedAt: null,
      socialSuggested: Boolean(socialSuggested),
      targets: normalizeMetricTargets(targets),
      entries: normalized,
    },
  };
}

export function metricsPayloadFromForm(metrics) {
  return {
    ...metrics,
    postUrl: metrics.postUrl || null,
    views: toMetricNumber(metrics.views),
    likes: toMetricNumber(metrics.likes),
    comments: toMetricNumber(metrics.comments),
    shares: toMetricNumber(metrics.shares),
    reach: toMetricNumber(metrics.reach),
  };
}

/** Social proof entries that have at least one engagement number (for client display). */
export function socialProofEntriesWithMetrics(report) {
  const metrics = report?.metrics && typeof report.metrics === "object" ? report.metrics : {};
  const entries = Array.isArray(metrics.entries) ? metrics.entries : null;
  if (entries?.length) {
    return entries.filter(
      (entry) =>
        entry?.url &&
        (entry.views != null ||
          entry.likes != null ||
          entry.comments != null ||
          entry.shares != null ||
          entry.reach != null)
    );
  }
  if (metrics.postUrl || metrics.views != null || metrics.likes != null) {
    return [
      {
        url: metrics.postUrl || null,
        views: metrics.views ?? null,
        likes: metrics.likes ?? null,
        comments: metrics.comments ?? null,
        shares: metrics.shares ?? null,
        reach: metrics.reach ?? null,
        platform: metrics.platform,
        platformLabel: metrics.platformLabel,
        title: metrics.title,
      },
    ].filter((entry) => entry.url || entry.views != null || entry.likes != null);
  }
  return [];
}
