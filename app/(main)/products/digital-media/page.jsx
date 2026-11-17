import { redirect } from "next/navigation";

/**
 * Legacy digital media URL — send buyers to the Digital Media marketplace tab.
 * Rate cards & quotes live on /products?type=DIGITAL.
 */
export default async function DigitalMediaPage({ searchParams }) {
  const params = searchParams ? await searchParams : {};
  const next = new URLSearchParams();
  next.set("type", "DIGITAL");

  for (const key of ["demo", "listing", "rateCard", "quote"]) {
    const value = params?.[key];
    if (value != null && String(value).trim()) {
      next.set(key, String(value));
    }
  }

  redirect(`/products?${next.toString()}`);
}
