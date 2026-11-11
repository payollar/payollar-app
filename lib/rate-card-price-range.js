/**
 * Derive a browse “From” price range from smart-rate-card currency cells.
 */

function parseAmount(value) {
  if (value == null) return null;
  const n = parseFloat(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatListingPriceRange(amounts) {
  const nums = (amounts || []).filter(
    (n) => Number.isFinite(n) && n > 0
  );
  if (!nums.length) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const fmt = (n) =>
    `₵${Math.round(n).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
  if (min === max) return fmt(min);
  return `${fmt(min)} - ${fmt(max)}`;
}

/**
 * Collect positive currency amounts from a rate card shaped like Prisma include:
 * sections → tables → columns (CURRENCY) + rows → cells
 */
export function collectCurrencyAmountsFromRateCard(rateCard) {
  const amounts = [];
  for (const section of rateCard?.sections || []) {
    for (const table of section.tables || []) {
      const currencyColIds = new Set(
        (table.columns || [])
          .filter((c) => c.dataType === "CURRENCY")
          .map((c) => c.id)
      );
      if (currencyColIds.size === 0) continue;
      for (const row of table.rows || []) {
        for (const cell of row.cells || []) {
          if (!currencyColIds.has(cell.columnId)) continue;
          const n = parseAmount(cell.value);
          if (n != null) amounts.push(n);
        }
      }
    }
  }
  return amounts;
}

export function priceRangeFromRateCard(rateCard) {
  return formatListingPriceRange(collectCurrencyAmountsFromRateCard(rateCard));
}
