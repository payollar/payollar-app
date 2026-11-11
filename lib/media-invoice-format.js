export function formatMediaInvoiceMoney(value, currency = "GHS") {
  const amount = Number(value) || 0;
  if (currency === "GHS") {
    return `GH₵ ${amount.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${currency} ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
