import React from "react";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isDashboard =
    pathname.startsWith("/creator") ||
    pathname.startsWith("/client") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/media-agency");
  const isTalentProfile = pathname.startsWith("/talents");
  const isCampaigns = pathname === "/campaigns" || pathname.startsWith("/campaigns/");
  const isOnboarding = pathname.startsWith("/onboarding");

  return (
    <div
      className={
        isTalentProfile || isCampaigns
          ? "w-full"
          : isDashboard
            ? "container mx-auto mb-20 mt-0"
            : "container mx-auto my-20"
      }
    >
      {children}
    </div>
  );
}
