/** Client-side cart for TV / radio media planners (not the rate-card cell cart). */

export const MEDIA_PLANNER_CART_KEY = "payollarMediaPlannerCart";

export function loadMediaPlannerCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MEDIA_PLANNER_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMediaPlannerCart(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEDIA_PLANNER_CART_KEY, JSON.stringify(items || []));
  window.dispatchEvent(new CustomEvent("media-planner-cart-change"));
}

export function addMediaPlannerCartItem(item) {
  const items = loadMediaPlannerCart();
  const next = [
    ...items,
    {
      ...item,
      id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: item.createdAt || new Date().toISOString(),
    },
  ];
  saveMediaPlannerCart(next);
  return next;
}

export function removeMediaPlannerCartItem(id) {
  const next = loadMediaPlannerCart().filter((item) => item.id !== id);
  saveMediaPlannerCart(next);
  return next;
}

export function clearMediaPlannerCart() {
  saveMediaPlannerCart([]);
}

export function mediaPlannerCartCount(items = loadMediaPlannerCart()) {
  return items.length;
}

export function mediaPlannerCartTotal(items = loadMediaPlannerCart()) {
  return items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
}
