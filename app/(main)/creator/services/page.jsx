import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CreatorServicesPage() {
  const user = await getCurrentUser();

  if (user?.role !== "DOCTOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  return (
    <div className="p-8 bg-black min-h-screen">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Services</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Services management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

