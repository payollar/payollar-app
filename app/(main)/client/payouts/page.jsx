import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { ClientPayoutsPage } from "../_components/client-payouts";

export default async function ClientPayoutsPageRoute() {
  const user = await getCurrentUser();

  if (user?.role !== "CLIENT") {
    redirect("/onboarding");
  }

  return <ClientPayoutsPage user={user} />;
}
