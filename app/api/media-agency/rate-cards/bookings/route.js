import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

/**
 * POST /api/media-agency/rate-cards/bookings
 * Create a booking from a rate card row
 * Validates that the row is bookable and required fields are present
 */
export async function POST(request) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      rowId,
      rateCardId,
      clientName,
      clientEmail,
      clientPhone,
      quantity,
      startDate,
      endDate,
      notes,
    } = body;

    if (!rowId || !rateCardId || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: "Missing required fields: rowId, rateCardId, clientName, clientEmail" },
        { status: 400 }
      );
    }

    // Fetch row with all necessary data
    const row = await db.smartTableRow.findUnique({
      where: { id: rowId },
      include: {
        table: {
          include: {
            section: {
              include: {
                rateCard: {
                  include: {
                    agency: true,
                  },
                },
              },
            },
            columns: {
              where: { isRequiredForBooking: true },
              orderBy: { displayOrder: "asc" },
            },
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
      return NextResponse.json({ error: "Row not found" }, { status: 404 });
    }

    // Validate row is bookable
    if (!row.isBookable) {
      return NextResponse.json(
        { error: "This row is not available for booking" },
        { status: 400 }
      );
    }

    // Validate required booking columns have values
    const requiredColumns = row.table.columns;
    const missingRequiredFields = [];

    for (const column of requiredColumns) {
      const cell = row.cells.find((c) => c.columnId === column.id);
      if (!cell || !cell.value || cell.value.trim() === "") {
        missingRequiredFields.push(column.name);
      }
    }

    if (missingRequiredFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required booking fields",
          missingFields: missingRequiredFields,
        },
        { status: 400 }
      );
    }

    // Extract price and description from cells for snapshot
    const priceColumn = row.cells.find((c) =>
      ["CURRENCY", "NUMBER"].includes(c.column.dataType)
    );
    const descriptionColumn = row.cells.find((c) =>
      ["TEXT", "NOTES"].includes(c.column.dataType)
    );

    // Build snapshot data (all cell values)
    const snapshotData = {};
    row.cells.forEach((cell) => {
      snapshotData[cell.column.name] = cell.value;
    });

    // Calculate total amount if price and quantity are available
    let totalAmount = null;
    if (priceColumn?.value && quantity) {
      const price = parseFloat(priceColumn.value);
      if (!isNaN(price)) {
        totalAmount = price * quantity;
      }
    }

    // Create booking with snapshot
    const booking = await db.rateCardBookingItem.create({
      data: {
        rowId: row.id,
        rateCardId: row.table.section.rateCard.id,
        agencyId: row.table.section.rateCard.agency.id,
        snapshotData,
        snapshotPrice: priceColumn?.value ? parseFloat(priceColumn.value) : null,
        snapshotUnit: null, // Could be extracted from a unit column if exists
        snapshotDescription: descriptionColumn?.value || null,
        clientName,
        clientEmail,
        clientPhone: clientPhone || null,
        quantity: quantity || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        totalAmount,
        status: "PENDING",
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/media-agency/rate-cards/bookings
 * Get bookings for the authenticated media agency
 */
export async function GET(request) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "MEDIA_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mediaAgency = await db.mediaAgency.findUnique({
      where: { userId: user.id },
    });

    if (!mediaAgency) {
      return NextResponse.json({ error: "Media agency not found" }, { status: 404 });
    }

    const bookings = await db.rateCardBookingItem.findMany({
      where: { agencyId: mediaAgency.id },
      include: {
        rateCard: {
          select: {
            id: true,
            title: true,
          },
        },
        row: {
          include: {
            table: {
              include: {
                section: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: error.message },
      { status: 500 }
    );
  }
}
