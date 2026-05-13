import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** Matches client UI: credit `amount` is shown as ₵ directly (see client-payouts history). */
function talentSpendFromCredits(amountCredits) {
  return Math.abs(Number(amountCredits) || 0);
}

function txDescription(type, amount) {
  switch (type) {
    case "CREDIT_PURCHASE":
      return amount > 0 ? "Credit purchase" : "Credit adjustment";
    case "APPOINTMENT_DEDUCTION":
      return amount < 0 ? "Talent appointment (credits)" : "Credit transfer";
    case "ADMIN_ADJUSTMENT":
      return "Account adjustment";
    default:
      return "Transaction";
  }
}

function txStatus(type, amount) {
  if (type === "CREDIT_PURCHASE" && amount > 0) return "COMPLETED";
  if (type === "APPOINTMENT_DEDUCTION" && amount < 0) return "COMPLETED";
  if (type === "ADMIN_ADJUSTMENT") return "COMPLETED";
  return "COMPLETED";
}

export async function GET() {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, email: true },
    });

    if (!user || user.role !== "CLIENT" || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const clientEmail = user.email;

    const [
      transactions,
      appointmentDeductions,
      productSalesCompleted,
      productSalesPending,
      mediaBookingsAll,
      rateCardBookingsAll,
      acceptedCampaignApps,
    ] = await Promise.all([
      db.creditTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.creditTransaction.findMany({
        where: {
          userId: user.id,
          type: "APPOINTMENT_DEDUCTION",
          amount: { lt: 0 },
        },
      }),
      db.digitalProductSale.findMany({
        where: { buyerId: user.id, status: "COMPLETED" },
        select: { id: true, amount: true, createdAt: true, product: { select: { title: true } } },
      }),
      db.digitalProductSale.findMany({
        where: { buyerId: user.id, status: "PENDING" },
        select: { id: true, amount: true, createdAt: true, product: { select: { title: true } } },
      }),
      db.mediaBooking.findMany({
        where: { clientEmail },
        include: {
          listing: { select: { name: true } },
          agency: { select: { agencyName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.rateCardBookingItem.findMany({
        where: { clientEmail },
        include: {
          rateCard: { select: { title: true } },
          agency: { select: { agencyName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.campaignApplication.findMany({
        where: {
          status: "ACCEPTED",
          campaign: { clientId: user.id },
          rate: { not: null },
        },
        select: {
          id: true,
          rate: true,
          createdAt: true,
          name: true,
          campaign: { select: { title: true } },
        },
      }),
    ]);

    const talentAppointmentGhs = appointmentDeductions.reduce(
      (s, t) => s + talentSpendFromCredits(t.amount),
      0
    );
    const talentProductsGhs = productSalesCompleted.reduce((s, p) => s + (p.amount || 0), 0);
    const talentsTotal = talentAppointmentGhs + talentProductsGhs;

    const mediaCommittedStatuses = ["CONFIRMED", "COMPLETED"];
    const mediaSpentGhs = [...mediaBookingsAll, ...rateCardBookingsAll].reduce((sum, b) => {
      if (!mediaCommittedStatuses.includes(b.status)) return sum;
      return sum + (b.totalAmount || 0);
    }, 0);

    const campaignPayoutsGhs = acceptedCampaignApps.reduce((s, a) => s + (a.rate || 0), 0);

    const expenseBreakdown = {
      talents: {
        total: talentsTotal,
        appointmentBookingsGhs: talentAppointmentGhs,
        creatorProductsGhs: talentProductsGhs,
      },
      mediaBookings: {
        total: mediaSpentGhs,
      },
      campaignPayouts: {
        total: campaignPayoutsGhs,
        acceptedApplications: acceptedCampaignApps.length,
      },
    };

    const pendingMediaAmount = [...mediaBookingsAll, ...rateCardBookingsAll].reduce((sum, b) => {
      if (b.status !== "PENDING" || b.totalAmount == null) return sum;
      return sum + b.totalAmount;
    }, 0);

    const pendingProductAmount = productSalesPending.reduce((s, p) => s + (p.amount || 0), 0);

    const totalSpent = talentsTotal + mediaSpentGhs + campaignPayoutsGhs;

    const stats = {
      totalSpent,
      inEscrow: pendingMediaAmount,
      pendingPayments: pendingProductAmount,
      completedPayments: talentProductsGhs + mediaSpentGhs,
    };

    const escrowPayments = [];

    for (const b of mediaBookingsAll) {
      if (b.status !== "PENDING" || b.totalAmount == null) continue;
      escrowPayments.push({
        id: `media-${b.id}`,
        title: b.listing?.name ? `Media: ${b.listing.name}` : "Media booking",
        amount: b.totalAmount,
        status: "IN_ESCROW",
        recipientName: b.agency?.agencyName || "Media partner",
        createdAt: b.createdAt,
        paymentReference: b.id.slice(0, 8),
        description: b.packageName || "Awaiting confirmation",
      });
    }
    for (const b of rateCardBookingsAll) {
      if (b.status !== "PENDING" || b.totalAmount == null) continue;
      escrowPayments.push({
        id: `rate-${b.id}`,
        title: b.rateCard?.title ? `Rate card: ${b.rateCard.title}` : "Smart rate card booking",
        amount: b.totalAmount,
        status: "IN_ESCROW",
        recipientName: b.agency?.agencyName || "Media partner",
        createdAt: b.createdAt,
        paymentReference: b.id.slice(0, 8),
        description: b.snapshotDescription || "Awaiting confirmation",
      });
    }
    for (const p of productSalesPending) {
      escrowPayments.push({
        id: `product-${p.id}`,
        title: p.product?.title ? `Digital: ${p.product.title}` : "Digital product purchase",
        amount: p.amount || 0,
        status: "PENDING",
        recipientName: "Creator",
        createdAt: p.createdAt,
        paymentReference: p.id.slice(0, 8),
        description: "Payment processing",
      });
    }

    escrowPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const enrichedTransactions = transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      createdAt: t.createdAt,
      description: txDescription(t.type, t.amount),
      status: txStatus(t.type, t.amount),
    }));

    return NextResponse.json({
      transactions: enrichedTransactions,
      escrowPayments,
      stats,
      expenseBreakdown,
    });
  } catch (error) {
    console.error("Error fetching client payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch payouts data" },
      { status: 500 }
    );
  }
}
