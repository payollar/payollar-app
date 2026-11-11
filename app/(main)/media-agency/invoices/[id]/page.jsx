import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import {
  MediaAgencyPageShell,
  mediaAgencyCardClass,
} from "../../_components/media-agency-page-shell";
import { MediaInvoiceView } from "@/components/media/media-invoice-view";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MediaAgencyInvoicePage({ params }) {
  const user = await checkUser();
  if (!user || user.role !== "MEDIA_AGENCY") {
    redirect("/");
  }

  const { id } = await params;

  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!mediaAgency) {
    redirect("/media-agency/settings");
  }

  const invoice = await db.mediaInvoice.findFirst({
    where: {
      id,
      OR: [
        { agencyId: mediaAgency.id },
        { bookingItems: { some: { agencyId: mediaAgency.id } } },
      ],
    },
    include: {
      agency: {
        select: { id: true, agencyName: true },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  // Agencies only see their own line items on multi-station carts.
  const allItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  const agencyItems = allItems.filter(
    (item) => !item.agencyId || item.agencyId === mediaAgency.id
  );
  const scopedInvoice = {
    ...invoice,
    lineItems: agencyItems.length > 0 ? agencyItems : allItems,
    amount:
      agencyItems.length > 0 && agencyItems.length < allItems.length
        ? agencyItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
        : invoice.amount,
  };

  return (
    <MediaAgencyPageShell
      eyebrow="Billing"
      title="Media receipt"
      description="Paid booking receipt linked to this station."
    >
      <Link
        href="/media-agency/requests"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to requests
      </Link>
      <div className={cn(mediaAgencyCardClass, "border-0 p-0 overflow-hidden")}>
        <MediaInvoiceView invoice={scopedInvoice} />
      </div>
    </MediaAgencyPageShell>
  );
}
