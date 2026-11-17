import { redirect } from "next/navigation";

/**
 * Legacy billboard media URL — send buyers to the Billboard marketplace tab.
 * Sites, rate cards, quotes & proof live on /products?type=BILLBOARD.
 */
export default async function BillboardMediaPage({ searchParams }) {
  const params = searchParams ? await searchParams : {};
  const next = new URLSearchParams();
  next.set("type", "BILLBOARD");

  for (const key of ["demo", "listing", "site", "quote"]) {
    const value = params?.[key];
    if (value != null && String(value).trim()) {
      next.set(key === "site" ? "demo" : key, String(value));
    }
  }

  redirect(`/products?${next.toString()}`);
}
