import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function CreatorSettingsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Settings page coming soon...</p>
      </CardContent>
    </Card>
  );
}

