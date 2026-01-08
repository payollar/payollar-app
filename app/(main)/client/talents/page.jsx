import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ClientTalentsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/client">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Browse Talents</h1>
          <p className="text-muted-foreground">
            Discover and book talented creators for your campaigns
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Browse Talents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Browse all available talents
            </p>
            <Link href="/talents">
              <Button>View All Talents</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
