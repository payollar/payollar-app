/** Client-side drafts for TV / radio media planners. */

export const MEDIA_PLANNER_DRAFTS_KEY = "payollarMediaPlannerDrafts";

function newId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadMediaPlannerDrafts() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MEDIA_PLANNER_DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMediaPlannerDrafts(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEDIA_PLANNER_DRAFTS_KEY, JSON.stringify(items || []));
  window.dispatchEvent(new CustomEvent("media-planner-drafts-change"));
}

export function getMediaPlannerDraft(id) {
  if (!id) return null;
  return loadMediaPlannerDrafts().find((item) => item.id === id) || null;
}

/**
 * Create or update a draft. Pass `id` to update an existing draft.
 */
export function upsertMediaPlannerDraft(item) {
  const items = loadMediaPlannerDrafts();
  const now = new Date().toISOString();
  const id = item.id || newId();
  const index = items.findIndex((entry) => entry.id === id);
  const nextItem = {
    ...item,
    id,
    status: "draft",
    updatedAt: now,
    createdAt: index >= 0 ? items[index].createdAt || now : item.createdAt || now,
  };

  const next =
    index >= 0
      ? items.map((entry, i) => (i === index ? nextItem : entry))
      : [nextItem, ...items];

  saveMediaPlannerDrafts(next);
  return nextItem;
}

export function removeMediaPlannerDraft(id) {
  const next = loadMediaPlannerDrafts().filter((item) => item.id !== id);
  saveMediaPlannerDrafts(next);
  return next;
}

export function mediaPlannerDraftsCount(items = loadMediaPlannerDrafts()) {
  return items.length;
}

export function mediaPlannerDraftContinueHref(draft) {
  if (!draft?.id) return "/products";
  const channel = String(draft.channel || "TV").toUpperCase();
  const base = channel === "RADIO" ? "/products/radio-media" : "/products/tv-media";
  return `${base}?draft=${encodeURIComponent(draft.id)}`;
}
