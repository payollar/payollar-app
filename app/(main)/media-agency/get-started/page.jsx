import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { GetStartedGuide } from "./_components/get-started-guide";

export const metadata = {
  title: "Get started | Media agency",
  description: "Tour of the Payollar media agency dashboard.",
};

export default async function MediaAgencyGetStartedPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  return <GetStartedGuide />;
}
