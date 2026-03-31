/**
 * Map published rate card smart tables → TV scheduler airtime slot cards.
 * Aligns with column roles used in rate-card-display (time_class, rate_ad_type, ad_type_identifier).
 */

import { TV_AD_TYPES } from "@/lib/ad-types";

export function getColumnRole(column) {
  if (!column?.config || typeof column.config !== "object") return null;
  return column.config.role ?? null;
}

function norm(v) {
  return (v && String(v).trim().toLowerCase()) || "";
}

/** Normalize for loose compare (hyphens, extra spaces) */
function normKey(v) {
  return norm(v).replace(/[\s-]+/g, "");
}

function getCell(row, columnId) {
  if (!row?.cells || !columnId) return "";
  const cell = row.cells.find((c) => c.columnId === columnId);
  return cell?.value != null ? String(cell.value).trim() : "";
}

/**
 * CURRENCY columns that map to spot length (secs), e.g. role rate_30s, "45 secs", "2 min".
 * @returns {Map<number, string>} seconds → column id
 */
export function findCurrencyColumnsByDurationSec(columns) {
  /** @type {Map<number, string>} */
  const secToColId = new Map();
  if (!columns?.length) return secToColId;
  for (const c of columns) {
    if (c.dataType !== "CURRENCY") continue;
    const role = getColumnRole(c);
    if (role) {
      const m = /^rate_(\d+)s$/i.exec(role);
      if (m) {
        const sec = Number(m[1]);
        if (!secToColId.has(sec)) secToColId.set(sec, c.id);
        continue;
      }
      if (/^rate_(120s|2min)$/i.test(role) || /^rate_2min$/i.test(role)) {
        if (!secToColId.has(120)) secToColId.set(120, c.id);
        continue;
      }
    }
    const name = c.name || "";
    let m = name.match(/(\d+)\s*secs?/i);
    if (m) {
      const sec = Number(m[1]);
      if (!secToColId.has(sec)) secToColId.set(sec, c.id);
      continue;
    }
    m = name.match(/(\d+)\s*min(?:ute)?s?/i);
    if (m) {
      const sec = Number(m[1]) * 60;
      if (!secToColId.has(sec)) secToColId.set(sec, c.id);
    }
  }
  return secToColId;
}

/**
 * @returns {Record<number, number>} sec → positive GHS (weekly basis, same as rate card)
 */
function buildRatesBySecForRow(row, columns) {
  const map = findCurrencyColumnsByDurationSec(columns);
  /** @type {Record<number, number>} */
  const out = {};
  for (const [sec, colId] of map) {
    const v = parseFloat(getCell(row, colId));
    if (!isNaN(v) && v > 0) out[sec] = v;
  }
  return out;
}

/** Ghana TV-style band names — matches common rate-card time windows */
const TIME_RANGE_LABEL_MIN = [
  [300, 360, "Early Morning"],
  [360, 540, "Morning Drive"],
  [540, 720, "Mid Morning"],
  [720, 840, "Midday"],
  [840, 1020, "Afternoon"],
  [1020, 1200, "Prime Time"],
  [1200, 1320, "Evening"],
];

/** Map legacy / short codes from dropdowns to the same friendly names */
const TIME_CLASS_CODE_TO_LABEL = {
  premium: "Prime Time",
  prime: "Prime Time",
  primetime: "Prime Time",
  "prime time": "Prime Time",
  pt: "Prime Time",
  m1: "Early Morning",
  m2: "Mid Morning",
  m3: "Midday",
  m4: "Afternoon",
  md: "Midday",
  morning: "Morning Drive",
  "morning drive": "Morning Drive",
  "mid morning": "Mid Morning",
  "early morning": "Early Morning",
  em: "Early Morning",
  midday: "Midday",
  p1: "Prime Time",
  p2: "Afternoon",
  p3: "Evening",
  afternoon: "Afternoon",
  evening: "Evening",
  "late night": "Late Night",
  ln: "Late Night",
};

/**
 * When the rate card row only has a time-class code (Premium, M1–M4) and no clock cells,
 * show typical broadcast windows so the scheduler still shows e.g. "5:00 - 6:00 AM".
 * Keys are norm() of code / alias; values are 24h ranges for internal parsing.
 */
const DEFAULT_24H_RANGE_BY_CODE = {
  premium: "17:00–20:00",
  prime: "17:00–20:00",
  primetime: "17:00–20:00",
  "prime time": "17:00–20:00",
  pt: "17:00–20:00",
  m1: "05:00–06:00",
  m2: "09:00–12:00",
  m3: "12:00–14:00",
  m4: "14:00–17:00",
  md: "12:00–14:00",
  p1: "17:00–20:00",
  p2: "14:00–17:00",
  p3: "20:00–22:00",
  morning: "06:00–09:00",
  "morning drive": "06:00–09:00",
  "mid morning": "09:00–12:00",
  "early morning": "05:00–06:00",
  em: "05:00–06:00",
  midday: "12:00–14:00",
  afternoon: "14:00–17:00",
  evening: "20:00–22:00",
  "late night": "23:00–05:00",
  ln: "23:00–05:00",
};

function default24hRangeForRaw(raw) {
  if (!raw || typeof raw !== "string") return "";
  const k = norm(raw);
  if (DEFAULT_24H_RANGE_BY_CODE[k]) return DEFAULT_24H_RANGE_BY_CODE[k];
  for (const [code, range] of Object.entries(DEFAULT_24H_RANGE_BY_CODE)) {
    if (k === norm(code)) return range;
  }
  return "";
}

function minutesFrom12h(h, min, meridian) {
  const m = meridian.toLowerCase();
  const isPM = m === "pm";
  const isAM = m === "am";
  let hour24;
  if (isPM) hour24 = h === 12 ? 12 : h + 12;
  else if (isAM) hour24 = h === 12 ? 0 : h;
  else hour24 = ((h % 24) + 24) % 24;
  return hour24 * 60 + min;
}

/** Normalize e.g. "05:00-06:00" → "05:00–06:00" (en dash) */
function normalizeTimeRangeDisplay(str) {
  if (!str || typeof str !== "string") return null;
  const m = /(\d{1,2}):(\d{2})\s*[–\-—]\s*(\d{1,2}):(\d{2})/.exec(str);
  if (!m) return null;
  const pad = (h, n) => `${String(h).padStart(2, "0")}:${String(n).padStart(2, "0")}`;
  const rest = str.slice((m.index ?? 0) + m[0].length).trim();
  const mer = rest.match(/^(am|pm)\b/i);
  if (mer) {
    const start = minutesFrom12h(parseInt(m[1], 10), parseInt(m[2], 10), mer[1]);
    const end = minutesFrom12h(parseInt(m[3], 10), parseInt(m[4], 10), mer[1]);
    const h24 = (mins) => {
      const t = ((mins % 1440) + 1440) % 1440;
      const hh = Math.floor(t / 60);
      const mm = t % 60;
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    };
    return `${h24(start)}–${h24(end)}`;
  }
  return `${pad(m[1], m[2])}–${pad(m[3], m[4])}`;
}

function parseMinutesFromRange(str) {
  if (!str || typeof str !== "string") return null;
  const s = str.trim();
  const m12 = s.match(
    /^(\d{1,2}):(\d{2})\s*[–\-—]\s*(\d{1,2}):(\d{2})\s*(am|pm)\b/i
  );
  if (m12) {
    const start = minutesFrom12h(parseInt(m12[1], 10), parseInt(m12[2], 10), m12[5]);
    let end = minutesFrom12h(parseInt(m12[3], 10), parseInt(m12[4], 10), m12[5]);
    if (end <= start) end += 1440;
    return { start, end };
  }
  const m = s.match(/(\d{1,2}):(\d{2})\s*[–\-—]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  let start = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  let end = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
  if (end <= start) end += 1440;
  return { start, end };
}

/** Single clock for display (12h + AM/PM) */
function formatTime12hParts(totalMinutes) {
  const t = ((totalMinutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(t / 60);
  const min = t % 60;
  const isPM = h24 >= 12;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return {
    h12,
    m: min,
    period: isPM ? "PM" : "AM",
    fmt: () => `${h12}:${String(min).padStart(2, "0")}`,
  };
}

/**
 * Display like the TV scheduler screenshot: "5:00 - 6:00 AM" (same meridian on one line).
 * Cross-midnight: "10:00 PM - 12:00 AM"
 */
export function formatTimeRange12hForDisplay(str) {
  if (!str || typeof str !== "string") return null;
  const p = parseMinutesFromRange(str);
  if (!p) return null;
  let { start, end } = p;
  if (end <= start) end += 1440;

  const a = formatTime12hParts(start);
  const b = formatTime12hParts(end);
  const samePeriod = a.period === b.period && end - start < 13 * 60;

  if (samePeriod) {
    return `${a.fmt()} - ${b.fmt()} ${a.period}`;
  }
  return `${a.fmt()} ${a.period} - ${b.fmt()} ${b.period}`;
}

/** Infer band label from "05:00–06:00" style window (midpoint classification) */
export function inferLabelFromTimeRangeString(str) {
  const p = parseMinutesFromRange(str);
  if (!p) return null;
  const mid = ((p.start + p.end) / 2) % 1440;
  for (const [lo, hi, label] of TIME_RANGE_LABEL_MIN) {
    if (mid >= lo && mid < hi) return label;
  }
  if (mid >= 1320 || mid < 300) return "Late Night";
  return null;
}

function friendlyLabelFromCode(raw) {
  if (!raw || typeof raw !== "string") return null;
  const k = norm(raw);
  if (TIME_CLASS_CODE_TO_LABEL[k]) return TIME_CLASS_CODE_TO_LABEL[k];
  for (const [code, label] of Object.entries(TIME_CLASS_CODE_TO_LABEL)) {
    if (k === norm(code)) return label;
  }
  if (inferLabelFromTimeRangeString(raw)) return inferLabelFromTimeRangeString(raw);
  return null;
}

/** Scan row for first cell that looks like a time window */
function findTimeRangeStringInRow(row, columns) {
  for (const col of columns) {
    const v = getCell(row, col.id);
    if (/\d{1,2}:\d{2}\s*[–\-—]\s*\d{1,2}:\d{2}/.test(v)) {
      return normalizeTimeRangeDisplay(v) || v.trim();
    }
  }
  return "";
}

/**
 * Column that identifies ad format: explicit role, or a dropdown named like "Ad type" / "Format".
 */
export function findAdTypeColumn(table) {
  const columns = table.columns || [];
  const byRole = columns.find((c) => getColumnRole(c) === "ad_type_identifier");
  if (byRole) return byRole;
  return (
    columns.find(
      (c) =>
        (c.dataType === "DROPDOWN" || c.dataType === "TEXT") &&
        /ad\s*type|format|spot\s*type|package|ad\s*format/i.test(c.name || "")
    ) || null
  );
}

/** Match cell to scheduler ad id — rate cards may store id, short label, or full name */
function cellMatchesSelectedAdFormat(cellValue, selectedAdFormatId) {
  if (!selectedAdFormatId) return true;
  const cell = norm(cellValue);
  if (!cell) return false;
  const t = TV_AD_TYPES.find((x) => x.id === selectedAdFormatId);
  const candidates = new Set();
  candidates.add(norm(selectedAdFormatId));
  if (t) {
    candidates.add(norm(t.id));
    candidates.add(norm(t.label));
    candidates.add(norm(t.fullName));
  }
  if (candidates.has(cell)) return true;
  const cellCompact = normKey(cellValue);
  for (const c of candidates) {
    if (c && normKey(c) === cellCompact) return true;
  }
  return false;
}

/**
 * @param {import("@prisma/client").RateCard & { sections: any[] }} rateCard
 * @param {{ selectedAdFormatId?: string | null }} options
 * @returns {{ id: string, range: string, label: string, rateGhs: number, ratesBySec: Record<number, number>, booked: boolean }[]}
 * `rateGhs` is the agency-entered amount from the rate card (baseline 30s when using a single rate column).
 */
export function mapRateCardToAirtimeSlots(rateCard, options = {}) {
  const { selectedAdFormatId = null } = options;
  const slots = [];
  const filterByAd = Boolean(selectedAdFormatId);

  for (const section of rateCard.sections || []) {
    for (const table of section.tables || []) {
      const columns = table.columns || [];
      const adTypeCol = findAdTypeColumn(table);
      if (filterByAd && !adTypeCol) {
        continue;
      }

      const timeClassCol =
        columns.find((c) => getColumnRole(c) === "time_class") ||
        columns.find((c) => /time|slot|band|window|airtime|period/i.test(c.name || ""));
      const rateAdTypeCol = columns.find((c) => getColumnRole(c) === "rate_ad_type");
      const durationMap = findCurrencyColumnsByDurationSec(columns);
      const durationColIds = new Set(durationMap.values());
      const textCols = columns.filter((c) => c.dataType === "TEXT");

      for (const row of table.rows || []) {
        if (filterByAd && adTypeCol) {
          const adVal = getCell(row, adTypeCol.id);
          if (!cellMatchesSelectedAdFormat(adVal, selectedAdFormatId)) continue;
        }

        const ratesBySec = buildRatesBySecForRow(row, columns);

        let rateGhs = 0;
        if (ratesBySec[30] != null && ratesBySec[30] > 0) {
          rateGhs = ratesBySec[30];
        } else if (Object.keys(ratesBySec).length > 0) {
          for (const s of [15, 45, 60, 120]) {
            if (ratesBySec[s] != null && ratesBySec[s] > 0) {
              rateGhs = ratesBySec[s] * (30 / s);
              break;
            }
          }
        }
        if (rateGhs === 0 && rateAdTypeCol) {
          const v = parseFloat(getCell(row, rateAdTypeCol.id));
          if (!isNaN(v) && v > 0) rateGhs = v;
        }
        if (rateGhs === 0) {
          for (const col of columns.filter((c) => c.dataType === "CURRENCY")) {
            if (durationColIds.has(col.id)) continue;
            const v = parseFloat(getCell(row, col.id));
            if (!isNaN(v) && v > 0) {
              rateGhs = v;
              break;
            }
          }
        }
        if (rateGhs === 0) {
          for (const col of columns.filter((c) => c.dataType === "CURRENCY")) {
            const v = parseFloat(getCell(row, col.id));
            if (!isNaN(v) && v > 0) {
              rateGhs = v;
              break;
            }
          }
        }

        const timeClassRaw = timeClassCol ? getCell(row, timeClassCol.id) : "";
        const scannedRange = findTimeRangeStringInRow(row, columns);

        let labelFromText = "";
        for (const col of textCols) {
          if (timeClassCol && col.id === timeClassCol.id) continue;
          const t = getCell(row, col.id);
          if (t && !/\d{1,2}:\d{2}\s*[–\-—]\s*\d{1,2}:\d{2}/.test(t)) {
            labelFromText = t;
            break;
          }
        }

        /** Only real clock windows from cells — never use "Premium", "M2", etc. as a time range */
        let rangeDisplay =
          normalizeTimeRangeDisplay(timeClassRaw) ||
          normalizeTimeRangeDisplay(scannedRange) ||
          (/\d{1,2}:\d{2}\s*[–\-—]\s*\d{1,2}:\d{2}/.test(timeClassRaw) ? timeClassRaw.trim() : "") ||
          scannedRange ||
          "";

        /** Dropdown-only rows (Premium, M1–M4) have no clock cells — use typical windows for display */
        if (!parseMinutesFromRange(rangeDisplay)) {
          const fallback =
            default24hRangeForRaw(timeClassRaw) || default24hRangeForRaw(labelFromText);
          if (fallback) rangeDisplay = fallback;
        }

        /** Line 1 (bold): daypart — Early Morning, Prime Time, Mid Morning… never raw codes when mappable */
        let daypartLabel =
          inferLabelFromTimeRangeString(rangeDisplay) ||
          friendlyLabelFromCode(timeClassRaw) ||
          friendlyLabelFromCode(labelFromText) ||
          inferLabelFromTimeRangeString(timeClassRaw) ||
          "";

        if (!daypartLabel && labelFromText) {
          daypartLabel = friendlyLabelFromCode(labelFromText) || labelFromText;
        }
        if (!daypartLabel) {
          daypartLabel = table.title || section.title || "Airtime";
        }

        /** Line 2: 12h time only when we have a parseable window */
        const timeRangeText = parseMinutesFromRange(rangeDisplay)
          ? formatTimeRange12hForDisplay(rangeDisplay) || ""
          : "";

        slots.push({
          id: row.id,
          label: daypartLabel,
          range: timeRangeText,
          rateGhs,
          ratesBySec,
          booked: !row.isBookable,
        });
      }
    }
  }

  return slots;
}
