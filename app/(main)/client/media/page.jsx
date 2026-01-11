import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function ClientMediaPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Library</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Media library coming soon...</p>
      </CardContent>
    </Card>
  );
}
