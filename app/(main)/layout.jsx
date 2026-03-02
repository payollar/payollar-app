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

  return (
    <div
      className={
        isDashboard
          ? "container mx-auto mb-20 mt-0"
          : "container mx-auto my-20"
      }
    >
      {children}
    </div>
  );
}
