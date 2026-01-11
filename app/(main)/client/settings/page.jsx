import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientProfile } from "../_components/profile";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function ClientSettingsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  return (
    <ClientProfile user={user} />
  );
}
