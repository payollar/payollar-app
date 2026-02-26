import { NextResponse } from "next/server";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(request) {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await db.user.findUnique({
      where: { id: session.user.id, role: "CLIENT" },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Only clients can make bookings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      rateCardId, 
      selectedCells, 
      mediaCampaignName,
    } = body;

    if (!rateCardId || !selectedCells || !Array.isArray(selectedCells) || selectedCells.length === 0) {
      return NextResponse.json(
        { error: "rateCardId and selectedCells are required" },
        { status: 400 }
      );
    }

    if (!mediaCampaignName?.trim()) {
      return NextResponse.json(
        { error: "Media campaign name is required" },
        { status: 400 }
      );
    }

    // Use logged-in client's name and email
    const clientName = client.name || client.email?.split("@")[0] || "Client";
    const clientEmail = client.email;

    // Verify rate card exists
    const rateCard = await db.rateCard.findUnique({
      where: { id: rateCardId },
      include: {
        agency: true,
      },
    });

    if (!rateCard) {
      return NextResponse.json(
        { error: "Rate card not found" },
        { status: 404 }
      );
    }

    // Calculate total amount from selected cells
    let totalAmount = 0;
    const cellData = [];

    for (const cellInfo of selectedCells) {
      const { rowId, columnId, value } = cellInfo;
      
      // Get the row and column to determine data type
      const row = await db.smartTableRow.findUnique({
        where: { id: rowId },
        include: {
          table: {
            include: {
              columns: true,
            },
          },
        },
      });

      if (!row) continue;

      const column = row.table.columns.find(col => col.id === columnId);
      if (!column) continue;

      // If it's a currency column, add to total
      if (column.dataType === "CURRENCY" && value) {
        const amount = parseFloat(value) || 0;
        totalAmount += amount;
      }

      cellData.push({
        rowId,
        columnId,
        value,
        rowTitle: row.title || "",
        columnName: column.name || "",
        tableTitle: row.table.title || "",
      });
    }

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: "Total amount must be greater than 0" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
    const callbackUrl = `${baseUrl}/api/paystack/callback-media-booking`;

    const { authorizationUrl, reference } = await initializeTransaction({
      amount: totalAmount,
      email: clientEmail,
      callbackUrl,
      metadata: {
        rateCardId,
        clientId: client.id,
        mediaCampaignName: mediaCampaignName || "",
        clientName,
        clientEmail,
        clientPhone: "",
        notes: "",
        bookingType: "RATE_CARD",
        selectedCells: JSON.stringify(cellData),
      },
      currency: "GHS",
    });

    return NextResponse.json({ 
      authorizationUrl, 
      reference,
      amount: totalAmount 
    });
  } catch (error) {
    console.error("Paystack initialize media booking error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
