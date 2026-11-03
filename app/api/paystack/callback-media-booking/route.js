import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { db } from "@/lib/prisma";

async function createBookingItemsFromPlannerCart({ cartItems, clientName, clientEmail, clientPhone }) {
  const creates = [];

  for (const item of cartItems) {
    const rateCard = await db.rateCard.findUnique({
      where: { id: item.rateCardId },
      select: { id: true, agencyId: true },
    });
    if (!rateCard) continue;

    const slotIds = Array.isArray(item.slotIds) ? item.slotIds : [];
    const slotCount = Math.max(1, slotIds.length);
    const itemTotal = Number(item.total) || 0;
    const perSlotTotal = itemTotal / slotCount;
    const startDate = item.campaignStart ? new Date(item.campaignStart) : null;
    const endDate = item.campaignEnd ? new Date(item.campaignEnd) : startDate;
    for (const rowId of slotIds) {
      const row = await db.smartTableRow.findUnique({
        where: { id: rowId },
        include: {
          cells: { include: { column: true } },
        },
      });
      if (!row) continue;

      const snapshotData = {};
      row.cells.forEach((cell) => {
        snapshotData[cell.column.name] = cell.value;
      });

      const priceColumn = row.cells.find((c) =>
        ["CURRENCY", "NUMBER"].includes(c.column.dataType)
      );
      const descriptionColumn = row.cells.find((c) =>
        ["TEXT", "NOTES"].includes(c.column.dataType)
      );
      const slotMeta = Array.isArray(item.slots)
        ? item.slots.find((slot) => slot.id === rowId)
        : null;
      const frequencyId =
        slotMeta?.frequencyId ||
        item.slotFrequencies?.[rowId] ||
        item.broadcastFrequencyId ||
        null;

      const notes = JSON.stringify({
        source: "media_planner_cart",
        channel: item.channel || "TV",
        brandName: item.brandName || null,
        audienceTypeIds: item.audienceTypeIds || [],
        audienceLabels: item.audienceLabels || [],
        objectiveIds: item.objectiveIds || [],
        objectiveLabels: item.objectiveLabels || [],
        industryIds: item.industryIds || [],
        industryLabels: item.industryLabels || [],
        adFormatId: item.adFormatId || null,
        adFormatLabel: item.adFormatLabel || null,
        spotLengthsSec: item.spotLengthsSec || [],
        frequencyId,
        slotFrequencies: item.slotFrequencies || {},
        broadcastFrequencyId: item.broadcastFrequencyId || null,
        activeBroadcastDays: item.activeBroadcastDays || [],
        dayCount: item.dayCount || 1,
        impressionsPerAiring: slotMeta?.impressionsPerAiring ?? null,
        lineImpressions: slotMeta?.lineImpressions ?? null,
        estimatedImpressions: item.estimatedImpressions ?? null,
        subtotal: item.subtotal || 0,
        vat: item.vat || 0,
        nhilGetfund: item.nhilGetfund || 0,
        total: itemTotal,
      });

      creates.push(
        db.rateCardBookingItem.create({
          data: {
            rowId: row.id,
            rateCardId: rateCard.id,
            agencyId: rateCard.agencyId,
            snapshotData,
            snapshotPrice: priceColumn?.value ? parseFloat(priceColumn.value) : null,
            snapshotUnit: "campaign estimate",
            snapshotDescription:
              slotMeta?.label ||
              descriptionColumn?.value ||
              item.adFormatLabel ||
              null,
            mediaCampaignName: item.mediaCampaignName || null,
            clientName: item.contactName || clientName || "",
            clientEmail: item.contactEmail || clientEmail || "",
            clientPhone: item.contactPhone || clientPhone || "",
            quantity: item.dayCount || 1,
            startDate: startDate && !Number.isNaN(startDate.getTime()) ? startDate : null,
            endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
            notes,
            totalAmount: Math.round(perSlotTotal * 100) / 100,
            status: "PENDING",
          },
        })
      );
    }
  }

  if (creates.length === 0) {
    throw new Error("No bookable slots found for planner cart");
  }
  await Promise.all(creates);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
  const bookingsUrl = `${baseUrl}/client/media`;

  if (!reference) {
    return NextResponse.redirect(
      `${bookingsUrl}?success=0&error=missing_reference`
    );
  }

  try {
    const result = await verifyTransaction(reference);
    if (!result.success || !result.metadata) {
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=verification_failed`
      );
    }

    const {
      rateCardId,
      clientId,
      mediaCampaignName,
      clientName,
      clientEmail,
      clientPhone,
      notes,
      bookingType,
      selectedCells,
      cartItems: cartItemsRaw,
    } = result.metadata;

    if (!clientId) {
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=invalid_metadata`
      );
    }

    // Planner cart checkout (TV/radio confirm → cart → Paystack)
    if (bookingType === "MEDIA_PLANNER_CART") {
      let cartItems;
      try {
        cartItems =
          typeof cartItemsRaw === "string" ? JSON.parse(cartItemsRaw) : cartItemsRaw;
      } catch (e) {
        console.error("Error parsing planner cartItems:", e);
        return NextResponse.redirect(
          `${bookingsUrl}?success=0&error=invalid_cart_data`
        );
      }
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return NextResponse.redirect(
          `${bookingsUrl}?success=0&error=invalid_cart_data`
        );
      }

      await createBookingItemsFromPlannerCart({
        cartItems,
        clientName,
        clientEmail,
        clientPhone,
      });

      return NextResponse.redirect(
        `${bookingsUrl}?success=1&payment=completed&source=planner_cart`
      );
    }

    if (!rateCardId || !selectedCells) {
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=invalid_metadata`
      );
    }

    // Parse selected cells from metadata
    let cellData;
    try {
      cellData =
        typeof selectedCells === "string" ? JSON.parse(selectedCells) : selectedCells;
    } catch (e) {
      console.error("Error parsing selectedCells:", e);
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=invalid_cell_data`
      );
    }

    // Verify rate card exists
    const rateCard = await db.rateCard.findUnique({
      where: { id: rateCardId },
      include: {
        agency: true,
      },
    });

    if (!rateCard) {
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=rate_card_not_found`
      );
    }

    // Group selected cells by row (each row becomes one booking item)
    const rowsToBook = new Map();

    for (const cell of cellData) {
      const { rowId, columnId, value } = cell;

      if (!rowsToBook.has(rowId)) {
        rowsToBook.set(rowId, {
          rowId,
          selectedColumns: [],
        });
      }

      const rowData = rowsToBook.get(rowId);
      rowData.selectedColumns.push({
        columnId,
        value,
      });
    }

    // Create booking items for each row
    const bookingPromises = Array.from(rowsToBook.values()).map(async (rowData) => {
      const row = await db.smartTableRow.findUnique({
        where: { id: rowData.rowId },
        include: {
          table: {
            include: {
              columns: true,
            },
          },
          cells: {
            include: {
              column: true,
            },
          },
        },
      });

      if (!row) {
        throw new Error(`Row ${rowData.rowId} not found`);
      }

      const snapshotData = {};
      row.cells.forEach((cell) => {
        snapshotData[cell.column.name] = cell.value;
      });

      const priceColumn = row.cells.find((c) =>
        ["CURRENCY", "NUMBER"].includes(c.column.dataType)
      );
      const descriptionColumn = row.cells.find((c) =>
        ["TEXT", "NOTES"].includes(c.column.dataType)
      );

      let totalAmount = null;
      if (priceColumn?.value) {
        const price = parseFloat(priceColumn.value);
        if (!isNaN(price)) {
          totalAmount = price;
        }
      }

      return db.rateCardBookingItem.create({
        data: {
          rowId: row.id,
          rateCardId: rateCard.id,
          agencyId: rateCard.agencyId,
          snapshotData,
          snapshotPrice: priceColumn?.value ? parseFloat(priceColumn.value) : null,
          snapshotUnit: null,
          snapshotDescription: descriptionColumn?.value || null,
          mediaCampaignName: mediaCampaignName || null,
          clientName: clientName || "",
          clientEmail: clientEmail || "",
          clientPhone: clientPhone || "",
          notes: notes || "",
          totalAmount,
          status: "PENDING",
        },
      });
    });

    await Promise.all(bookingPromises);

    return NextResponse.redirect(`${bookingsUrl}?success=1&payment=completed`);
  } catch (error) {
    console.error("Paystack callback media booking error:", error);
    return NextResponse.redirect(
      `${bookingsUrl}?success=0&error=booking_failed`
    );
  }
}
