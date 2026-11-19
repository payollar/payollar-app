import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import {
  agencyUsesCustomPackages,
  agencyUsesSmartRateCard,
  effectiveAgencyMediaType,
  isMediaAgencyAdminEmail,
} from "@/lib/media-agency-type";
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

  const agency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    select: { email: true, primaryMediaType: true },
  });
  const isMediaAdmin =
    isMediaAgencyAdminEmail(user.email) ||
    isMediaAgencyAdminEmail(agency?.email);
  const scopedMediaType = effectiveAgencyMediaType({
    email: user.email,
    agencyEmail: agency?.email,
    primaryMediaType: agency?.primaryMediaType,
    isMediaAdmin,
  });
  const showSmartRateCard = agencyUsesSmartRateCard(scopedMediaType, {
    isMediaAdmin,
  });
  const showCustomPackages = agencyUsesCustomPackages(scopedMediaType, {
    isMediaAdmin,
  });

  return (
    <GetStartedGuide
      showSmartRateCard={showSmartRateCard}
      showCustomPackages={showCustomPackages}
    />
  );
}
