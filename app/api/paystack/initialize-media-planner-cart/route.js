import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth as betterAuth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";

/**
 * Checkout for media planner cart items (TV/radio).
 * Does not require clients to open the published rate-card UI.
 */
export async function POST(request) {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await db.user.findUnique({
      where: { id: session.user.id, role: "CLIENT" },
    });
    if (!client) {
      return NextResponse.json({ error: "Only clients can check out media campaigns" }, { status: 403 });
    }

    const body = await request.json();
    const cartItems = Array.isArray(body?.items) ? body.items : [];
    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    const normalized = [];
    let totalAmount = 0;

    for (const item of cartItems) {
      if (!item?.rateCardId || !item?.mediaCampaignName?.trim()) {
        return NextResponse.json(
          { error: "Each cart item needs a station and campaign name" },
          { status: 400 }
        );
      }
      const slotIds = Array.isArray(item.slotIds) ? item.slotIds.filter(Boolean) : [];
      if (slotIds.length === 0) {
        return NextResponse.json(
          { error: "Each cart item needs at least one airtime slot" },
          { status: 400 }
        );
      }

      const rateCard = await db.rateCard.findUnique({
        where: { id: item.rateCardId },
        select: { id: true, title: true, agencyId: true, isPublished: true },
      });
      if (!rateCard || !rateCard.isPublished) {
        return NextResponse.json(
          { error: `Station rate card is unavailable (${item.rateCardTitle || item.rateCardId})` },
          { status: 404 }
        );
      }

      const amount = Math.round(Number(item.total) || 0);
      if (amount <= 0) {
        return NextResponse.json(
          { error: "Cart totals must be greater than zero" },
          { status: 400 }
        );
      }

      totalAmount += amount;
      normalized.push({
        rateCardId: rateCard.id,
        agencyId: rateCard.agencyId,
        rateCardTitle: rateCard.title,
        mediaCampaignName: String(item.mediaCampaignName).trim().slice(0, 200),
        brandName: item.brandName || null,
        audienceTypeIds: Array.isArray(item.audienceTypeIds) ? item.audienceTypeIds : [],
        audienceLabels: Array.isArray(item.audienceLabels) ? item.audienceLabels : [],
        objectiveIds: Array.isArray(item.objectiveIds) ? item.objectiveIds : [],
        objectiveLabels: Array.isArray(item.objectiveLabels) ? item.objectiveLabels : [],
        industryIds: Array.isArray(item.industryIds) ? item.industryIds : [],
        industryLabels: Array.isArray(item.industryLabels) ? item.industryLabels : [],
        channel: item.channel || "TV",
        adFormatId: item.adFormatId || null,
        adFormatLabel: item.adFormatLabel || null,
        campaignStart: item.campaignStart || null,
        campaignEnd: item.campaignEnd || null,
        dayCount: item.dayCount || 1,
        slotIds,
        slots: Array.isArray(item.slots) ? item.slots.slice(0, 40) : [],
        spotLengthsSec: Array.isArray(item.spotLengthsSec) ? item.spotLengthsSec : [],
        slotFrequencies:
          item.slotFrequencies && typeof item.slotFrequencies === "object" ? item.slotFrequencies : {},
        broadcastFrequencyId: item.broadcastFrequencyId || null,
        activeBroadcastDays: Array.isArray(item.activeBroadcastDays) ? item.activeBroadcastDays : [],
        contactName: item.contact?.name || "",
        contactEmail: item.contact?.email || "",
        contactPhone: item.contact?.phone || "",
        estimatedImpressions:
          item.estimatedImpressions != null && Number(item.estimatedImpressions) > 0
            ? Math.round(Number(item.estimatedImpressions))
            : null,
        subtotal: Number(item.subtotal) || 0,
        vat: Number(item.vat) || 0,
        nhilGetfund: Number(item.nhilGetfund) || 0,
        total: amount,
      });
    }

    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Total amount must be greater than 0" }, { status: 400 });
    }

    const contactName =
      normalized.find((item) => item.contactName)?.contactName || "";
    const contactEmail =
      normalized.find((item) => item.contactEmail)?.contactEmail || "";
    const contactPhone =
      normalized.find((item) => item.contactPhone)?.contactPhone || "";
    // Always link bookings/receipts to the signed-in account email.
    const clientName =
      client.name || contactName || client.email?.split("@")[0] || "Client";
    const clientEmail = client.email;
    const clientPhone = contactPhone || "";
    const paystackEmail = contactEmail || clientEmail;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
    const callbackUrl = `${baseUrl}/api/paystack/callback-media-booking`;

    // Paystack metadata values must be strings and stay reasonably small.
    const { authorizationUrl, reference } = await initializeTransaction({
      amount: totalAmount,
      email: paystackEmail,
      callbackUrl,
      metadata: {
        clientId: client.id,
        clientName,
        clientEmail,
        clientPhone,
        contactName,
        contactEmail,
        bookingType: "MEDIA_PLANNER_CART",
        mediaCampaignName: normalized[0]?.mediaCampaignName || "",
        cartItems: JSON.stringify(normalized),
        // Keep legacy keys empty so old parsers don't mis-handle this payment.
        rateCardId: normalized[0]?.rateCardId || "",
        selectedCells: "[]",
      },
      currency: "GHS",
    });

    return NextResponse.json({
      authorizationUrl,
      reference,
      amount: totalAmount,
    });
  } catch (error) {
    console.error("Paystack initialize media planner cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
