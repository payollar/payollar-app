import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { MediaAgencyPageShell } from "../_components/media-agency-page-shell";
import { MediaAgencySettingsForm } from "./_components/media-agency-settings-form";
import { CompleteAgencyProfile } from "../_components/complete-agency-profile";

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
      <CompleteAgencyProfile
        defaultEmail={user.email || ""}
        defaultContactName={user.name || ""}
      />
    );
  }

  return (
    <MediaAgencyPageShell
      eyebrow="Media"
      title="Settings"
      description="Update your profile, contact details, and how clients see your media house."
    >
      <MediaAgencySettingsForm agency={mediaAgency} />
    </MediaAgencyPageShell>
  );
}
