import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getAllTalents, getServiceCategories } from "@/actions/talents";
import { BrowseTalents } from "../_components/browse-talents";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function ClientTalentsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  const [talentsData, categoriesData] = await Promise.all([
    getAllTalents().catch(() => ({ talents: [] })),
    getServiceCategories().catch(() => ({ categories: [] })),
  ]);

  return (
    <BrowseTalents
      talents={talentsData.talents || []}
      categories={categoriesData.categories || []}
      specialties={[]}
    />
  );
}
