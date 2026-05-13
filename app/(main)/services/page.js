import {
  getPublicMarketplaceServices,
  getPublicServiceMarketplaceCategories,
} from "@/actions/services";
import { ServicesMarketplaceSection } from "@/components/landing/services-marketplace-section";
import { Footer } from "@/components/landing/footer";

export const dynamic = "force-dynamic";

export default async function ServicesMarketplacePage({ searchParams }) {
  const sp = await searchParams;
  const raw = sp?.category;
  let activeCategory = null;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (t === "__none__") activeCategory = "__none__";
    else if (t.length > 0) activeCategory = t;
  }

  const [{ categories, hasUncategorized }, { services = [] }] = await Promise.all([
    getPublicServiceMarketplaceCategories().catch(() => ({
      categories: [],
      hasUncategorized: false,
    })),
    getPublicMarketplaceServices({
      limit: 72,
      category: activeCategory ?? undefined,
    }).catch(() => ({ services: [] })),
  ]);

  return (
    <>
      <ServicesMarketplaceSection
        services={services}
        categories={categories}
        hasUncategorized={hasUncategorized}
        activeCategory={activeCategory}
      />
      <Footer />
    </>
  );
}
