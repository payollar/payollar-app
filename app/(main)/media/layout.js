import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Media - Payollar",
  description: "Buy and schedule media advertising",
};

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = 'force-dynamic';

export default async function MediaLayout({ children }) {
  const user = await checkUser();

  // Redirect creators away from media pages - only CLIENT and ADMIN can access
  if (user?.role === "CREATOR") {
    redirect("/creator");
  }

  return <>{children}</>;
}
