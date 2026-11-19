/**
 * Time range column for smart rate cards (clock window next to segment).
 */

/** Buyer-facing defaults for common segment codes (12h). */
const DEFAULT_TIME_RANGE_BY_CODE = {
  premium: "6:00pm – 10:00pm",
  prime: "6:00pm – 10:00pm",
  primetime: "6:00pm – 10:00pm",
  "prime time": "6:00pm – 10:00pm",
  pt: "6:00pm – 10:00pm",
  p1: "6:00pm – 10:00pm",
  m1: "6:00am – 10:00am",
  "early morning": "5:00am – 6:00am",
  em: "5:00am – 6:00am",
  morning: "6:00am – 10:00am",
  "morning drive": "6:00am – 10:00am",
  m2: "10:00am – 2:00pm",
  "mid morning": "10:00am – 2:00pm",
  m3: "2:00pm – 6:00pm",
  midday: "12:00pm – 2:00pm",
  md: "12:00pm – 2:00pm",
  m4: "6:00pm – 10:00pm",
  afternoon: "2:00pm – 6:00pm",
  p2: "2:00pm – 6:00pm",
  evening: "8:00pm – 10:00pm",
  p3: "8:00pm – 10:00pm",
  "late night": "11:00pm – 5:00am",
  ln: "11:00pm – 5:00am",
};

function norm(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");
}

export const TIME_RANGE_COLUMN_PAYLOAD = {
  name: "Time range",
  dataType: "TEXT",
  isVisibleOnFrontend: true,
  isRequiredForBooking: false,
  config: {
    role: "time_range",
    placeholder: "e.g. 6:00pm – 10:00pm",
  },
};

function getRole(column) {
  if (!column?.config || typeof column.config !== "object") return null;
  return column.config.role ?? null;
}

export function isTimeRangeColumn(column) {
  if (!column) return false;
  return (
    getRole(column) === "time_range" ||
    /^time\s*range$/i.test((column.name || "").trim()) ||
    /^(air\s*time|airtime|time\s*window|clock)$/i.test(
      (column.name || "").trim()
    )
  );
}

export function hasTimeRangeColumn(columns = []) {
  return columns.some((c) => isTimeRangeColumn(c));
}

export function tableNeedsTimeRangeColumn(columns = []) {
  const hasTimeClass = columns.some(
    (c) =>
      getRole(c) === "time_class" ||
      /time\s*class|segment|daypart/i.test(c.name || "")
  );
  return hasTimeClass && !hasTimeRangeColumn(columns);
}

/** Insert immediately after Time Class / Segment when possible. */
export function nextTimeRangeDisplayOrder(columns = []) {
  const timeClass = columns.find(
    (c) =>
      getRole(c) === "time_class" ||
      /time\s*class|segment|daypart/i.test(c.name || "")
  );
  if (timeClass && typeof timeClass.displayOrder === "number") {
    return timeClass.displayOrder + 1;
  }
  return undefined;
}

/**
 * Default clock window for a segment label (Premium, M1, Prime Time, …).
 * @param {unknown} segmentLabel
 * @returns {string}
 */
export function defaultTimeRangeForSegment(segmentLabel) {
  const key = norm(segmentLabel);
  if (!key) return "";
  if (DEFAULT_TIME_RANGE_BY_CODE[key]) return DEFAULT_TIME_RANGE_BY_CODE[key];
  for (const [code, range] of Object.entries(DEFAULT_TIME_RANGE_BY_CODE)) {
    if (norm(code) === key) return range;
  }
  return "";
}

/** "18:00" → "6:00pm" */
export function formatClock12h(hhmm) {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return "";
  const [hRaw, mRaw] = hhmm.split(":");
  let h = parseInt(hRaw, 10);
  const m = parseInt(mRaw, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  h = ((h % 24) + 24) % 24;
  const period = h >= 12 ? "pm" : "am";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, "0")}${period}`;
}

/** "6:00pm" | "18:00" | "6:00 pm" → "18:00" for <input type="time"> */
export function toClock24h(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return "";
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = Math.min(23, Math.max(0, parseInt(m24[1], 10)));
    const m = Math.min(59, Math.max(0, parseInt(m24[2], 10)));
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!m12) return "";
  let h = parseInt(m12[1], 10);
  const m = parseInt(m12[2], 10);
  const period = m12[3].toLowerCase();
  if (period === "pm" && h !== 12) h += 12;
  if (period === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Parse stored range → 24h start/end for pickers.
 * @returns {{ start: string, end: string }}
 */
export function parseTimeRangeParts(value) {
  const raw = String(value || "")
    .trim()
    .replace(/[–—]/g, "-");
  if (!raw) return { start: "", end: "" };

  const parts = raw.split(/\s*-\s*/);
  if (parts.length < 2) return { start: "", end: "" };

  // "6:00pm - 10:00pm" or "6:00 pm - 10:00 pm"
  const left = parts[0].replace(/\s+(am|pm)$/i, "$1").replace(/\s+/g, "");
  const right = parts.slice(1).join("-").replace(/\s+(am|pm)$/i, "$1").replace(/\s+/g, "");

  // Also handle "6:00 pm-10:00 pm" after split quirks
  const start = toClock24h(left) || toClock24h(parts[0]);
  const end = toClock24h(right) || toClock24h(parts[1]);
  return { start, end };
}

/** Build stored display string from 24h inputs. */
export function formatTimeRangeFromClocks(start24, end24) {
  const a = formatClock12h(start24);
  const b = formatClock12h(end24);
  if (!a || !b) return "";
  return `${a} – ${b}`;
}
