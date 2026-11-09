/** Client-side cart for TV / radio media planners (not the rate-card cell cart). */

export const MEDIA_PLANNER_CART_KEY = "payollarMediaPlannerCart";

const VAT_RATE = 0.15;
const NHIL_GETFUND_RATE = 0.05;
const TAX_FACTOR = 1 + VAT_RATE + NHIL_GETFUND_RATE;

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

/** Attach negotiation refs onto a cart flight (client-side). */
export function patchMediaPlannerCartItem(id, patch) {
  const next = loadMediaPlannerCart().map((item) =>
    item.id === id ? { ...item, ...patch } : item
  );
  saveMediaPlannerCart(next);
  return next;
}

/**
 * Apply an agreed all-in total (same basis as cart `total`) back onto a flight.
 * Keeps VAT / NHIL+GETFund proportions used by the TV/radio planners.
 */
export function applyNegotiatedTotalToCartItem(id, agreedTotal) {
  const amount = Math.round(Number(agreedTotal) || 0);
  if (!id || amount <= 0) return loadMediaPlannerCart();

  const next = loadMediaPlannerCart().map((item) => {
    if (item.id !== id) return item;
    const subtotal = Math.round(amount / TAX_FACTOR);
    const vat = Math.round(subtotal * VAT_RATE);
    const nhilGetfund = Math.max(0, amount - subtotal - vat);
    return {
      ...item,
      listTotal: item.listTotal != null ? item.listTotal : item.total,
      subtotal,
      vat,
      nhilGetfund,
      total: amount,
      negotiatedAmount: amount,
      negotiatedAt: new Date().toISOString(),
    };
  });
  saveMediaPlannerCart(next);
  return next;
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
