import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { CreatorProfile } from "../_components/creator-profile";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function CreatorSettingsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CREATOR") {
    redirect("/onboarding");
  }

  return (
    <CreatorProfile user={user} />
  );
}
