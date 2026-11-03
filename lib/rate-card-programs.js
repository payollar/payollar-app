/**
 * Slot-guidance columns for smart rate cards (programs + impressions).
 * Clients see these on the airtime slot picker.
 */

export const PROGRAMS_COLUMN_PAYLOAD = {
  name: "Programs",
  dataType: "NOTES",
  isVisibleOnFrontend: true,
  isRequiredForBooking: false,
  config: {
    role: "programs",
    placeholder: "Add programs…",
  },
};

export const IMPRESSIONS_COLUMN_PAYLOAD = {
  name: "Impressions",
  dataType: "NUMBER",
  isVisibleOnFrontend: true,
  isRequiredForBooking: false,
  config: {
    role: "impressions",
    placeholder: "Add impressions…",
  },
};

/** Prefer inserting Impressions before Programs / Notes so it stays visible. */
export function nextImpressionsDisplayOrder(columns = []) {
  const anchor = columns.find(
    (c) =>
      isProgramsColumn(c) ||
      getRole(c) === "notes" ||
      /^notes$/i.test((c.name || "").trim())
  );
  if (anchor && typeof anchor.displayOrder === "number") {
    return anchor.displayOrder;
  }
  return undefined;
}

function getRole(column) {
  if (!column?.config || typeof column.config !== "object") return null;
  return column.config.role ?? null;
}

export function isProgramsColumn(column) {
  if (!column) return false;
  return (
    getRole(column) === "programs" ||
    /^(programs|programmes)$/i.test((column.name || "").trim())
  );
}

export function isImpressionsColumn(column) {
  if (!column) return false;
  if (
    ["impressions", "avg_impressions", "avg_audience", "audience_size"].includes(
      getRole(column) || ""
    )
  ) {
    return true;
  }
  return /impression|avg\s*audience|audience\s*size|viewers|listeners|avg\s*reach/i.test(
    column.name || ""
  );
}

/** Empty-cell / input placeholder for known guidance columns. */
export function getColumnEmptyHint(column) {
  if (isProgramsColumn(column)) return "Add programs…";
  if (isImpressionsColumn(column)) return "Add impressions…";
  return null;
}

export function hasTimeClassColumn(columns = []) {
  return columns.some(
    (c) =>
      getRole(c) === "time_class" ||
      /time\s*class|segment|daypart/i.test(c.name || "")
  );
}

export function hasProgramsColumn(columns = []) {
  return columns.some((c) => isProgramsColumn(c));
}

export function hasImpressionsColumn(columns = []) {
  return columns.some((c) => isImpressionsColumn(c));
}

/** True when this table should get a Programs column (time bands, no Programs yet). */
export function tableNeedsProgramsColumn(columns = []) {
  return hasTimeClassColumn(columns) && !hasProgramsColumn(columns);
}

/** True when this table should get an impressions column (time bands, none yet). */
export function tableNeedsImpressionsColumn(columns = []) {
  return hasTimeClassColumn(columns) && !hasImpressionsColumn(columns);
}
