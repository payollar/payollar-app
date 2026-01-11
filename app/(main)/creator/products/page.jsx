import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getCreatorProducts, getCreatorProductEarnings } from "@/actions/products";
import { CreatorProducts } from "../_components/products";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function CreatorProductsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  const [productsData, productEarningsData] = await Promise.all([
    getCreatorProducts().catch(() => ({ products: [] })),
    getCreatorProductEarnings().catch(() => ({ earnings: {}, recentSales: [] })),
  ]);

  return (
    <CreatorProducts 
      products={productsData.products || []}
      productEarnings={productEarningsData.earnings || {}}
    />
  );
}

