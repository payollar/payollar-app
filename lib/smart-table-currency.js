/**
 * Currency options for Smart Rate Card CURRENCY columns (secs / rate columns).
 * Stored on SmartTableColumn.config as { currencyCode, currencySymbol }.
 */

export const SMART_TABLE_CURRENCIES = [
  { code: "GHS", symbol: "₵", label: "GHS — Ghana Cedi" },
  { code: "USD", symbol: "$", label: "USD — US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR — Euro" },
  { code: "GBP", symbol: "£", label: "GBP — British Pound" },
  { code: "NGN", symbol: "₦", label: "NGN — Nigerian Naira" },
  { code: "KES", symbol: "KSh", label: "KES — Kenyan Shilling" },
  { code: "ZAR", symbol: "R", label: "ZAR — South African Rand" },
];

export const DEFAULT_SMART_TABLE_CURRENCY = "GHS";

export function getCurrencyMeta(code) {
  const normalized = String(code || DEFAULT_SMART_TABLE_CURRENCY).toUpperCase();
  return (
    SMART_TABLE_CURRENCIES.find((c) => c.code === normalized) ||
    SMART_TABLE_CURRENCIES[0]
  );
}

/** Resolve currency from a SmartTableColumn (or plain config object). */
export function getColumnCurrency(columnOrConfig) {
  const config =
    columnOrConfig?.config && typeof columnOrConfig.config === "object"
      ? columnOrConfig.config
      : columnOrConfig && typeof columnOrConfig === "object"
        ? columnOrConfig
        : {};

  const code =
    config.currencyCode ||
    (config.currencySymbol
      ? SMART_TABLE_CURRENCIES.find((c) => c.symbol === config.currencySymbol)
          ?.code
      : null) ||
    DEFAULT_SMART_TABLE_CURRENCY;

  const meta = getCurrencyMeta(code);
  return {
    code: meta.code,
    symbol: config.currencySymbol || meta.symbol,
    label: meta.label,
  };
}

/** Prefer the first CURRENCY column's currency on a table. */
export function getTableCurrency(table) {
  const currencyCol = (table?.columns || []).find(
    (c) => c.dataType === "CURRENCY"
  );
  return getColumnCurrency(currencyCol);
}

/** First CURRENCY column across a full rate card (sections → tables). */
export function getRateCardCurrency(rateCard) {
  for (const section of rateCard?.sections || []) {
    for (const table of section.tables || []) {
      const currencyCol = (table.columns || []).find(
        (c) => c.dataType === "CURRENCY"
      );
      if (currencyCol) return getColumnCurrency(currencyCol);
    }
  }
  return getColumnCurrency(null);
}

export function formatSmartTableMoney(value, columnOrCurrency, options = {}) {
  const { maximumFractionDigits = 0, minimumFractionDigits } = options;
  const num =
    typeof value === "number" ? value : parseFloat(String(value ?? "").replace(/,/g, ""));
  if (!Number.isFinite(num)) return String(value ?? "");

  const currency =
    columnOrCurrency?.symbol != null && columnOrCurrency?.code != null
      ? columnOrCurrency
      : getColumnCurrency(columnOrCurrency);

  const formatted = num.toLocaleString("en-GH", {
    maximumFractionDigits,
    ...(minimumFractionDigits != null ? { minimumFractionDigits } : {}),
  });

  return `${currency.symbol}${formatted}`;
}

export function currencyConfigPatch(code) {
  const meta = getCurrencyMeta(code);
  return {
    currencyCode: meta.code,
    currencySymbol: meta.symbol,
  };
}
