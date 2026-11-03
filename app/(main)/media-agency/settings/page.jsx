import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { MediaAgencyPageShell } from "../_components/media-agency-page-shell";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { MediaAgencySettingsForm } from "./_components/media-agency-settings-form";

export const dynamic = "force-dynamic";

export default async function MediaAgencySettingsPage() {
  const user = await checkUser();

  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
  });

  if (!mediaAgency) {
    return (
      <MediaAgencyPageShell
        eyebrow="Agency"
        title="Settings"
        description="Complete your media agency profile."
      >
        <div className={`${DASHBOARD_CARD_CLASS} px-6 py-10 text-center`}>
          <p className="text-sm text-slate-500">
            Media agency profile not found. Please contact support.
          </p>
        </div>
      </MediaAgencyPageShell>
    );
  }

  return (
    <MediaAgencyPageShell
      eyebrow="Agency"
      title="Settings"
      description="Update your profile, contact details, and how clients see your agency."
    >
      <MediaAgencySettingsForm agency={mediaAgency} />
    </MediaAgencyPageShell>
  );
}
