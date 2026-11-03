import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata = {
  title: "Media - Payollar",
  description: "Buy and schedule media advertising",
};

export const dynamic = "force-dynamic";

export default async function MediaLayout({ children }) {
  const user = await checkUser();

  if (user?.role === "CREATOR") {
    redirect("/creator");
  }

  return (
    <div
      data-theme="light"
      data-media-landing
      className="relative isolate min-h-dvh w-full bg-background text-foreground"
    >
      <LandingNavbar />
      <div className="relative z-10 w-full bg-background">{children}</div>
    </div>
  );
}
