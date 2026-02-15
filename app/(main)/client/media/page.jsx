import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { getClientMediaLibrary } from "@/actions/client-media";
import { MediaLibrary } from "../_components/media-library";
import { revalidatePath } from "next/cache";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function ClientMediaPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  const mediaData = await getClientMediaLibrary();
  
  // Revalidate to ensure fresh data
  revalidatePath("/client/media");

  return (
    <MediaLibrary
      bookings={mediaData.bookings || []}
      certificates={mediaData.certificates || []}
      reports={mediaData.reports || []}
    />
  );
}
