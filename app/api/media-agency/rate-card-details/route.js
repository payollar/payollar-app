import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

function parseDateOnly(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  // date inputs are YYYY-MM-DD — pin noon to avoid timezone day-shift
  const d = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function PATCH(req) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "MEDIA_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      customPackageNotes,
      customPackageTerms,
      rateCardValidFrom,
      rateCardValidTo,
    } = body;

    const mediaAgency = await db.mediaAgency.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!mediaAgency) {
      return NextResponse.json(
        { error: "Media agency not found" },
        { status: 404 }
      );
    }

    const from = parseDateOnly(rateCardValidFrom);
    const to = parseDateOnly(rateCardValidTo);
    if (from && to && to < from) {
      return NextResponse.json(
        { error: "Valid to must be on or after Valid from" },
        { status: 400 }
      );
    }

    const updateData = {
      rateCardLastUpdated: new Date(),
    };
    if (customPackageNotes !== undefined) {
      updateData.customPackageNotes =
        String(customPackageNotes || "").trim() || null;
    }
    if (customPackageTerms !== undefined) {
      updateData.customPackageTerms =
        String(customPackageTerms || "").trim() || null;
    }
    if (rateCardValidFrom !== undefined) {
      updateData.rateCardValidFrom = from;
    }
    if (rateCardValidTo !== undefined) {
      updateData.rateCardValidTo = to;
    }

    await db.mediaAgency.update({
      where: { id: mediaAgency.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating rate card details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update rate card details" },
      { status: 500 }
    );
  }
}
