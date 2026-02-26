import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { db } from "@/lib/prisma";

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
      selectedCells 
    } = result.metadata;

    if (!rateCardId || !clientId || !selectedCells) {
      return NextResponse.redirect(
        `${bookingsUrl}?success=0&error=invalid_metadata`
      );
    }

    // Parse selected cells from metadata
    let cellData;
    try {
      cellData = typeof selectedCells === "string" 
        ? JSON.parse(selectedCells) 
        : selectedCells;
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
      // Fetch the row with all necessary data
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

      // Build snapshot data from all cells
      const snapshotData = {};
      row.cells.forEach((cell) => {
        snapshotData[cell.column.name] = cell.value;
      });

      // Extract price and description
      const priceColumn = row.cells.find((c) =>
        ["CURRENCY", "NUMBER"].includes(c.column.dataType)
      );
      const descriptionColumn = row.cells.find((c) =>
        ["TEXT", "NOTES"].includes(c.column.dataType)
      );

      // Calculate total amount
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
