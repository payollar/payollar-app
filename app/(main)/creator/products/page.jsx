import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { CreatorPageShell, creatorCardClass } from "../_components/creator-page-shell";

export const dynamic = "force-dynamic";

export default async function CreatorProductsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "CREATOR") {
    redirect("/onboarding");
  }

  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/creator/verification");
  }

  return (
    <CreatorPageShell
      eyebrow="Catalog"
      title="Digital Products"
      description="Sell downloads, packs, and digital assets to your audience."
    >
      <section className={`${creatorCardClass} px-6 py-16 text-center`}>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#0055ff]">
          <ShoppingBag className="h-6 w-6" />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#0055ff]">
          Coming soon
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Digital products are on the way
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          We&apos;re finishing the seller tools for listings, checkout, and delivery. Check
          back soon.
        </p>
      </section>
    </CreatorPageShell>
  );
}
