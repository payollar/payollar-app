import { defaultTimeRangeForSegment } from "@/lib/rate-card-time-range";

const LEGACY_CODES = new Set(["premium", "m1", "m2", "m3", "m4"]);
const STARTER = "Prime";

function norm(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");
}

function getRole(column) {
  if (!column?.config || typeof column.config !== "object") return null;
  return column.config.role ?? null;
}

function isTimeClassColumn(column) {
  return (
    getRole(column) === "time_class" ||
    /time\s*class|segment|daypart/i.test(column?.name || "")
  );
}

function isDayBandColumn(column) {
  return (
    getRole(column) === "day_band" ||
    /^(days?|day\s*band)$/i.test(String(column?.name || "").trim())
  );
}

function isTimeRangeColumn(column) {
  return (
    getRole(column) === "time_range" ||
    /^time\s*range$/i.test(String(column?.name || "").trim())
  );
}

function cellValue(row, columnId) {
  const cell = (row.cells || []).find((c) => c.columnId === columnId);
  return cell?.value ?? "";
}

/** True if options/rows look like the old Premium + M1–M4 seed. */
export function tableHasLegacyTimeClassSeed(table) {
  const columns = table?.columns || [];
  const timeClassCol = columns.find(isTimeClassColumn);
  if (!timeClassCol) return false;

  const options = Array.isArray(timeClassCol.config?.options)
    ? timeClassCol.config.options.map(norm)
    : [];
  const optionHits = options.filter((o) => LEGACY_CODES.has(o));
  if (optionHits.length >= 3) return true;

  const rows = table?.rows || [];
  const segmentHits = new Set();
  for (const row of rows) {
    const v = norm(cellValue(row, timeClassCol.id));
    if (LEGACY_CODES.has(v) || v === "prime") segmentHits.add(v === "prime" ? "premium" : v);
  }
  // Legacy seed typically has several of M1–M4 present
  const legacyRowHits = [...segmentHits].filter((s) => LEGACY_CODES.has(s));
  return legacyRowHits.length >= 3;
}

/**
 * Collapse a smart table to a Prime starter (options + rows).
 * @param {import("@prisma/client").PrismaClient} db
 * @param {string} tableId
 */
export async function simplifyTableTimeClassSegments(db, tableId) {
  const table = await db.smartTable.findUnique({
    where: { id: tableId },
    include: {
      columns: { orderBy: { displayOrder: "asc" } },
      rows: {
        orderBy: { sortOrder: "asc" },
        include: {
          cells: true,
          _count: { select: { bookingItems: true } },
        },
      },
    },
  });

  if (!table) {
    return { success: false, error: "Table not found" };
  }

  const timeClassCol = table.columns.find(isTimeClassColumn);
  if (!timeClassCol) {
    return { success: false, error: "No Time Class / Segment column" };
  }

  const dayBandCol = table.columns.find(isDayBandColumn);
  const timeRangeCol = table.columns.find(isTimeRangeColumn);
  const adTypeCol = table.columns.find(
    (c) =>
      getRole(c) === "ad_type_identifier" ||
      /^ad\s*type$/i.test(String(c.name || "").trim())
  );

  const hasBookings = table.rows.some((r) => r._count.bookingItems > 0);
  if (hasBookings) {
    // Still clean dropdown options so people aren't offered M1–M4
    const nextConfig = {
      ...(typeof timeClassCol.config === "object" && timeClassCol.config
        ? timeClassCol.config
        : {}),
      role: "time_class",
      options: [STARTER],
      placeholder: "e.g. Prime",
    };
    await db.smartTableColumn.update({
      where: { id: timeClassCol.id },
      data: { config: nextConfig },
    });
    return {
      success: true,
      partial: true,
      message:
        "Updated segment options to Prime. Some rows have bookings so they were left in place.",
    };
  }

  // Capture an ad-type id from an existing row if present
  let adTypeValue = "";
  if (adTypeCol) {
    for (const row of table.rows) {
      const v = String(cellValue(row, adTypeCol.id) || "").trim();
      if (v) {
        adTypeValue = v;
        break;
      }
    }
  }

  const nextConfig = {
    ...(typeof timeClassCol.config === "object" && timeClassCol.config
      ? timeClassCol.config
      : {}),
    role: "time_class",
    options: [STARTER],
    placeholder: "e.g. Prime",
  };

  await db.$transaction(async (tx) => {
    await tx.smartTableColumn.update({
      where: { id: timeClassCol.id },
      data: { config: nextConfig },
    });

    // Remove all existing rows (cascade cells)
    await tx.smartTableRow.deleteMany({ where: { tableId: table.id } });

    const dayBands = dayBandCol ? ["Mon–Fri", "Sat–Sun"] : [null];
    const range = defaultTimeRangeForSegment(STARTER);

    for (let i = 0; i < dayBands.length; i++) {
      const band = dayBands[i];
      const row = await tx.smartTableRow.create({
        data: {
          tableId: table.id,
          isBookable: true,
          sortOrder: i,
        },
      });

      const cells = table.columns.map((col) => {
        let value = "";
        if (col.id === timeClassCol.id) value = STARTER;
        else if (dayBandCol && col.id === dayBandCol.id) value = band || "";
        else if (timeRangeCol && col.id === timeRangeCol.id) value = range;
        else if (adTypeCol && col.id === adTypeCol.id) value = adTypeValue;
        return {
          rowId: row.id,
          columnId: col.id,
          value,
        };
      });

      if (cells.length) {
        await tx.smartTableCell.createMany({ data: cells });
      }
    }
  });

  return {
    success: true,
    message: dayBandCol
      ? "Reset to Prime × Mon–Fri / Sat–Sun. Add more segments as you need them."
      : "Reset to a single Prime starter row. Add more segments as you need them.",
  };
}
