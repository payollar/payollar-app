import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { ClientPayoutsPage } from "../_components/client-payouts";

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function ClientPayoutsPageRoute() {
  const user = await getCurrentUser();

  if (user?.role !== "CLIENT") {
    redirect("/onboarding");
  }

  return <ClientPayoutsPage user={user} />;
}
