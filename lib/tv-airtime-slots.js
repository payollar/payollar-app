/**
 * Map published rate card smart tables → TV scheduler airtime slot cards.
 * Aligns with column roles used in rate-card-display
 * (time_class, day_band, rate_30s / rate_Ns, rate_ad_type, ad_type_identifier,
 * programs, impressions). Prefers duration columns; baseline rateGhs is 30s.
 * Rows with Mon–Fri / Sat–Sun day bands merge into one slot with ratesByDayBand.
 */

import { RADIO_AD_TYPES, TV_AD_TYPES } from "@/lib/ad-types";

export function getColumnRole(column) {
  if (!column?.config || typeof column.config !== "object") return null;
  return column.config.role ?? null;
}

/** Canonical day-band keys used in ratesByDayBand */
export const DAY_BAND_MON_FRI = "mon-fri";
export const DAY_BAND_SAT_SUN = "sat-sun";

/**
 * Normalize rate-card day band labels → "mon-fri" | "sat-sun" | null
 * @param {unknown} value
 */
export function normalizeDayBand(value) {
  const raw = (value != null ? String(value).trim().toLowerCase() : "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, "");
  if (!raw) return null;
  if (
    /^(mon-fri|monfri|weekdays?|weekday)$/.test(raw) ||
    raw.includes("mon-fri") ||
    raw.includes("monday")
  ) {
    return DAY_BAND_MON_FRI;
  }
  if (
    /^(sat-sun|satsun|weekends?|weekend)$/.test(raw) ||
    raw.includes("sat-sun") ||
    raw.includes("saturday")
  ) {
    return DAY_BAND_SAT_SUN;
  }
  return null;
}

/**
 * From Sun–Sat active-day toggles → preference for rate lookup.
 * @param {boolean[] | null | undefined} activeDays length 7, Sun=0
 * @returns {"mon-fri" | "sat-sun" | "mixed"}
 */
export function inferDayBandPreference(activeDays) {
  if (!Array.isArray(activeDays) || activeDays.length !== 7) {
    return DAY_BAND_MON_FRI;
  }
  const weekdayOn = [1, 2, 3, 4, 5].some((i) => activeDays[i]);
  const weekendOn = activeDays[0] || activeDays[6];
  if (weekdayOn && !weekendOn) return DAY_BAND_MON_FRI;
  if (weekendOn && !weekdayOn) return DAY_BAND_SAT_SUN;
  if (weekdayOn && weekendOn) return "mixed";
  return DAY_BAND_MON_FRI;
}

/**
 * Weights for blending Mon–Fri vs Sat–Sun rates from active-day toggles.
 * @returns {{ monFri: number, satSun: number }}
 */
export function dayBandWeights(activeDays) {
  if (!Array.isArray(activeDays) || activeDays.length !== 7) {
    return { monFri: 5, satSun: 0 };
  }
  let monFri = 0;
  let satSun = 0;
  for (let i = 1; i <= 5; i++) if (activeDays[i]) monFri += 1;
  if (activeDays[0]) satSun += 1;
  if (activeDays[6]) satSun += 1;
  if (monFri === 0 && satSun === 0) return { monFri: 5, satSun: 0 };
  return { monFri, satSun };
}

/**
 * Rate for one slot at a given spot length.
 * Uses duration columns when present; respects ratesByDayBand + active days.
 * @param {object | null | undefined} slot
 * @param {number} sec
 * @param {boolean[] | null | undefined} activeDays
 */
export function getSlotRateForSec(slot, sec, activeDays) {
  if (!slot) return 0;

  const pickFromRates = (rates) => {
    if (!rates || typeof rates !== "object") return null;
    const v = rates[sec] ?? rates[String(sec)];
    if (typeof v === "number" && !isNaN(v) && v > 0) return v;
    return null;
  };

  const byBand = slot.ratesByDayBand;
  if (byBand && typeof byBand === "object") {
    const pref = inferDayBandPreference(activeDays);
    const monFriRate = pickFromRates(byBand[DAY_BAND_MON_FRI]);
    const satSunRate = pickFromRates(byBand[DAY_BAND_SAT_SUN]);

    if (pref === DAY_BAND_MON_FRI) {
      if (monFriRate != null) return monFriRate;
      if (satSunRate != null) return satSunRate;
    } else if (pref === DAY_BAND_SAT_SUN) {
      if (satSunRate != null) return satSunRate;
      if (monFriRate != null) return monFriRate;
    } else {
      const { monFri, satSun } = dayBandWeights(activeDays);
      if (monFriRate != null && satSunRate != null && monFri + satSun > 0) {
        return Math.round(
          (monFriRate * monFri + satSunRate * satSun) / (monFri + satSun)
        );
      }
      if (monFriRate != null) return monFriRate;
      if (satSunRate != null) return satSunRate;
    }
  }

  const fromSec = pickFromRates(slot.ratesBySec);
  if (fromSec != null) return fromSec;
  const base = slot.rateGhs ?? slot.weeklyGhs ?? 0;
  return base * (sec / 30);
}

/** Find day-band column by role or name. */
export function findDayBandColumn(columns) {
  if (!columns?.length) return null;
  const byRole = columns.find((c) => getColumnRole(c) === "day_band");
  if (byRole) return byRole;
  return (
    columns.find((c) =>
      /^(days?|day\s*band|day\s*type)$/i.test((c.name || "").trim())
    ) || null
  );
}

/**
 * Parse a programs cell into a clean list.
 * Accepts newlines, commas, semicolons, or " · " separators.
 * @param {string | null | undefined} raw
 * @returns {string[]}
 */
export function parseProgramsCell(raw) {
  if (raw == null) return [];
  const text = String(raw).trim();
  if (!text) return [];
  return text
    .split(/\n+|[,;]+|\s+·\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Find the programs column: role "programs", else exact name "Programs" / "Programmes". */
export function findProgramsColumn(columns) {
  if (!columns?.length) return null;
  const byRole = columns.find((c) => getColumnRole(c) === "programs");
  if (byRole) return byRole;
  return (
    columns.find((c) => /^(programs|programmes)$/i.test((c.name || "").trim())) ||
    null
  );
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

/**
 * Legacy Mon–Fri / Sat–Sun currency columns (e.g. rate_mon_fri_30, "Sat–Sun Rate (30s)").
 * @returns {Record<string, Record<number, number>>}
 */
function buildLegacyDayBandRatesFromRow(row, columns) {
  /** @type {Record<string, Record<number, number>>} */
  const out = {};
  if (!columns?.length) return out;

  for (const c of columns) {
    if (c.dataType !== "CURRENCY") continue;
    const role = getColumnRole(c) || "";
    const name = (c.name || "").toLowerCase();
    let band = null;
    let sec = null;

    const roleMatch = /^rate_(mon_fri|weekend)_(\d+)$/i.exec(role);
    if (roleMatch) {
      band =
        roleMatch[1].toLowerCase() === "weekend"
          ? DAY_BAND_SAT_SUN
          : DAY_BAND_MON_FRI;
      sec = Number(roleMatch[2]);
    } else if (/mon[\s–\-]?fri|weekday/.test(name)) {
      band = DAY_BAND_MON_FRI;
      const sm = name.match(/(\d+)\s*s/);
      sec = sm ? Number(sm[1]) : 30;
    } else if (/sat[\s–\-]?sun|weekend/.test(name)) {
      band = DAY_BAND_SAT_SUN;
      const sm = name.match(/(\d+)\s*s/);
      sec = sm ? Number(sm[1]) : 30;
    }

    if (!band || !Number.isFinite(sec)) continue;
    const v = parseFloat(getCell(row, c.id));
    if (isNaN(v) || v <= 0) continue;
    if (!out[band]) out[band] = {};
    if (out[band][sec] == null) out[band][sec] = v;
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

const IMPRESSIONS_ROLES = new Set(["impressions", "avg_impressions", "avg_audience", "audience_size"]);

/**
 * Demo avg impressions / airing by daypart (used until the agency fills their rate card).
 * Agency-entered values always win when present.
 */
const DEMO_IMPRESSIONS_BY_DAYPART = {
  "prime time": 280_000,
  premium: 280_000,
  "morning drive": 220_000,
  "early morning": 200_000,
  m1: 200_000,
  evening: 180_000,
  "mid morning": 150_000,
  m2: 150_000,
  midday: 120_000,
  m3: 120_000,
  afternoon: 100_000,
  m4: 70_000,
  "late night": 55_000,
};

const DEMO_IMPRESSIONS_DEFAULT = 120_000;

/**
 * Demo reach estimate for a slot label / time-class code.
 * @returns {number}
 */
export function getDemoImpressionsPerAiring(label, range = "") {
  const keys = [label, range].filter(Boolean).map((v) => norm(v));
  for (const key of keys) {
    if (DEMO_IMPRESSIONS_BY_DAYPART[key]) return DEMO_IMPRESSIONS_BY_DAYPART[key];
  }
  for (const key of keys) {
    for (const [daypart, value] of Object.entries(DEMO_IMPRESSIONS_BY_DAYPART)) {
      if (key.includes(daypart) || daypart.includes(key)) return value;
    }
  }
  const mapped = friendlyLabelFromCode(label);
  if (mapped) {
    const mappedKey = norm(mapped);
    if (DEMO_IMPRESSIONS_BY_DAYPART[mappedKey]) return DEMO_IMPRESSIONS_BY_DAYPART[mappedKey];
  }
  return DEMO_IMPRESSIONS_DEFAULT;
}

/**
 * Avg impressions / audience size per airing from a rate-card row.
 * Prefers explicit column role, then NUMBER/TEXT columns named like impressions/viewers.
 * @returns {number | null}
 */
export function findImpressionsPerAiring(row, columns) {
  if (!row || !columns?.length) return null;

  const byRole = columns.find((c) => IMPRESSIONS_ROLES.has(getColumnRole(c) || ""));
  if (byRole) {
    const v = parseFloat(getCell(row, byRole.id).replace(/,/g, ""));
    if (!isNaN(v) && v > 0) return Math.round(v);
  }

  for (const col of columns) {
    if (col.dataType !== "NUMBER" && col.dataType !== "TEXT") continue;
    if (
      !/impression|avg\s*audience|audience\s*size|viewers|listeners|avg\s*reach/i.test(
        col.name || ""
      )
    ) {
      continue;
    }
    const v = parseFloat(getCell(row, col.id).replace(/,/g, ""));
    if (!isNaN(v) && v > 0) return Math.round(v);
  }

  return null;
}

/**
 * Resolve impressions for a slot: agency rate-card value first, else demo daypart estimate.
 * @returns {{ impressionsPerAiring: number, impressionsSource: "agency" | "demo" }}
 */
export function resolveSlotImpressions(row, columns, label, range = "") {
  const agency = findImpressionsPerAiring(row, columns);
  if (agency != null) {
    return { impressionsPerAiring: agency, impressionsSource: "agency" };
  }
  return {
    impressionsPerAiring: getDemoImpressionsPerAiring(label, range),
    impressionsSource: "demo",
  };
}

/**
 * Sample programs by daypart — preview for buyers until the agency fills Programs.
 * Ghana TV / radio style show names; not guarantees.
 */
const DEMO_PROGRAMS_BY_DAYPART = {
  "prime time": ["Evening News", "Prime Drama", "Late Show"],
  premium: ["Evening News", "Prime Drama", "Late Show"],
  "morning drive": ["Morning Show", "Traffic Watch", "News @ 7"],
  "early morning": ["Sunrise Show", "Early News", "Devotion"],
  m1: ["Sunrise Show", "Early News", "Devotion"],
  "mid morning": ["Mid-Morning Live", "Talk Time", "Lifestyle"],
  m2: ["Mid-Morning Live", "Talk Time", "Lifestyle"],
  midday: ["Midday News", "Lunch Hour Hits", "Market Report"],
  m3: ["Midday News", "Lunch Hour Hits", "Market Report"],
  afternoon: ["Drive Time", "Sports Roundup", "Request Hour"],
  m4: ["Drive Time", "Sports Roundup", "Request Hour"],
  evening: ["Evening News", "Soap Hour", "Night Mix"],
  "late night": ["Night Cap", "Replay Hour", "Late Talk"],
};

const DEMO_PROGRAMS_DEFAULT = ["Featured Show", "News Bulletin", "Local Hit"];

/**
 * Demo program list for a slot label / time-class code.
 * @returns {string[]}
 */
export function getDemoPrograms(label, range = "") {
  const keys = [label, range].filter(Boolean).map((v) => norm(v));
  for (const key of keys) {
    if (DEMO_PROGRAMS_BY_DAYPART[key]) return [...DEMO_PROGRAMS_BY_DAYPART[key]];
  }
  for (const key of keys) {
    for (const [daypart, programs] of Object.entries(DEMO_PROGRAMS_BY_DAYPART)) {
      if (key.includes(daypart) || daypart.includes(key)) return [...programs];
    }
  }
  const mapped = friendlyLabelFromCode(label);
  if (mapped) {
    const mappedKey = norm(mapped);
    if (DEMO_PROGRAMS_BY_DAYPART[mappedKey]) {
      return [...DEMO_PROGRAMS_BY_DAYPART[mappedKey]];
    }
  }
  return [...DEMO_PROGRAMS_DEFAULT];
}

/**
 * Resolve programs for a slot: agency Programs cell first, else demo daypart samples.
 * @returns {{ programs: string[], programsSource: "agency" | "demo" }}
 */
export function resolveSlotPrograms(row, columns, label, range = "") {
  const programsCol = findProgramsColumn(columns);
  if (programsCol) {
    const agency = parseProgramsCell(getCell(row, programsCol.id));
    if (agency.length) {
      return { programs: agency, programsSource: "agency" };
    }
  }
  return {
    programs: getDemoPrograms(label, range),
    programsSource: "demo",
  };
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
  const t =
    TV_AD_TYPES.find((x) => x.id === selectedAdFormatId) ||
    RADIO_AD_TYPES.find((x) => x.id === selectedAdFormatId);
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

function mergeSlotRates(existing, {
  dayBandKey,
  ratesBySec,
  rateGhs,
  legacyDayBands,
  impressions,
  programs,
  row,
}) {
  if (!existing.ratesByDayBand) existing.ratesByDayBand = {};

  if (dayBandKey && Object.keys(ratesBySec).length > 0) {
    existing.ratesByDayBand[dayBandKey] = {
      ...(existing.ratesByDayBand[dayBandKey] || {}),
      ...ratesBySec,
    };
  }
  for (const [band, rates] of Object.entries(legacyDayBands || {})) {
    existing.ratesByDayBand[band] = {
      ...(existing.ratesByDayBand[band] || {}),
      ...rates,
    };
  }

  const preferMonFri =
    dayBandKey === DAY_BAND_MON_FRI ||
    !existing.ratesBySec ||
    Object.keys(existing.ratesBySec).length === 0;
  if (preferMonFri && Object.keys(ratesBySec).length > 0) {
    existing.ratesBySec = ratesBySec;
    if (rateGhs > 0) existing.rateGhs = rateGhs;
  }

  if (
    impressions.impressionsSource === "agency" &&
    existing.impressionsSource !== "agency"
  ) {
    existing.impressionsPerAiring = impressions.impressionsPerAiring;
    existing.impressionsSource = impressions.impressionsSource;
  }
  if (
    programs.programsSource === "agency" &&
    existing.programsSource !== "agency"
  ) {
    existing.programs = programs.programs;
    existing.programsSource = programs.programsSource;
  }
  if (row.isBookable === false) existing.booked = true;
}

function baselineRateGhsFromRatesBySec(ratesBySec, rateAdTypeCol, row, columns, durationColIds) {
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
  return rateGhs;
}

/**
 * @param {import("@prisma/client").RateCard & { sections: any[] }} rateCard
 * @param {{ selectedAdFormatId?: string | null }} options
 * @returns {{ id: string, range: string, label: string, rateGhs: number, ratesBySec: Record<number, number>, ratesByDayBand?: Record<string, Record<number, number>>, impressionsPerAiring: number, impressionsSource: "agency" | "demo", programs: string[], programsSource: "agency" | "demo", booked: boolean }[]}
 * `rateGhs` is the agency-entered amount from the rate card (baseline 30s when using a single rate column).
 * Day-band rows (Mon–Fri / Sat–Sun) for the same daypart merge into one slot with `ratesByDayBand`.
 */
export function mapRateCardToAirtimeSlots(rateCard, options = {}) {
  const { selectedAdFormatId = null } = options;
  /** @type {Map<string, object>} */
  const slotByKey = new Map();
  const filterByAd = Boolean(selectedAdFormatId);

  for (const section of rateCard.sections || []) {
    for (const table of section.tables || []) {
      const columns = table.columns || [];
      const adTypeCol = findAdTypeColumn(table);
      // Tables without an ad-type column are generic — still include them
      // when an ad format is selected (legacy time-class / spot sheets).

      const dayBandCol = findDayBandColumn(columns);
      const timeClassCol =
        columns.find((c) => getColumnRole(c) === "time_class") ||
        columns.find(
          (c) =>
            (!dayBandCol || c.id !== dayBandCol.id) &&
            /time\s*class|slot|window|airtime|period|segment/i.test(
              c.name || ""
            )
        );
      const rateAdTypeCol = columns.find(
        (c) => getColumnRole(c) === "rate_ad_type"
      );
      const programsCol = findProgramsColumn(columns);
      const durationMap = findCurrencyColumnsByDurationSec(columns);
      const durationColIds = new Set(durationMap.values());
      const textCols = columns.filter(
        (c) => c.dataType === "TEXT" || c.dataType === "NOTES"
      );

      for (const row of table.rows || []) {
        if (filterByAd && adTypeCol) {
          const adVal = getCell(row, adTypeCol.id);
          if (!cellMatchesSelectedAdFormat(adVal, selectedAdFormatId)) continue;
        }

        let ratesBySec = buildRatesBySecForRow(row, columns);
        const legacyDayBands = !dayBandCol
          ? buildLegacyDayBandRatesFromRow(row, columns)
          : {};
        if (
          Object.keys(ratesBySec).length === 0 &&
          Object.keys(legacyDayBands).length > 0
        ) {
          ratesBySec =
            legacyDayBands[DAY_BAND_MON_FRI] ||
            legacyDayBands[DAY_BAND_SAT_SUN] ||
            {};
        }
        const rateGhs = baselineRateGhsFromRatesBySec(
          ratesBySec,
          rateAdTypeCol,
          row,
          columns,
          durationColIds
        );

        const timeClassRaw = timeClassCol ? getCell(row, timeClassCol.id) : "";
        const dayBandRaw = dayBandCol ? getCell(row, dayBandCol.id) : "";
        const dayBandKey = normalizeDayBand(dayBandRaw);
        const scannedRange = findTimeRangeStringInRow(row, columns);

        let labelFromText = "";
        for (const col of textCols) {
          if (timeClassCol && col.id === timeClassCol.id) continue;
          if (dayBandCol && col.id === dayBandCol.id) continue;
          if (programsCol && col.id === programsCol.id) continue;
          if (adTypeCol && col.id === adTypeCol.id) continue;
          const t = getCell(row, col.id);
          if (t && !/\d{1,2}:\d{2}\s*[–\-—]\s*\d{1,2}:\d{2}/.test(t)) {
            labelFromText = t;
            break;
          }
        }

        let rangeDisplay =
          normalizeTimeRangeDisplay(timeClassRaw) ||
          normalizeTimeRangeDisplay(scannedRange) ||
          (/\d{1,2}:\d{2}\s*[–\-—]\s*\d{1,2}:\d{2}/.test(timeClassRaw)
            ? timeClassRaw.trim()
            : "") ||
          scannedRange ||
          "";

        if (!parseMinutesFromRange(rangeDisplay)) {
          const fallback =
            default24hRangeForRaw(timeClassRaw) ||
            default24hRangeForRaw(labelFromText);
          if (fallback) rangeDisplay = fallback;
        }

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

        const timeRangeText = parseMinutesFromRange(rangeDisplay)
          ? formatTimeRange12hForDisplay(rangeDisplay) || ""
          : "";

        const impressions = resolveSlotImpressions(
          row,
          columns,
          daypartLabel,
          timeRangeText
        );
        const programs = resolveSlotPrograms(
          row,
          columns,
          daypartLabel,
          timeRangeText
        );

        const mergeKey = [
          daypartLabel,
          timeRangeText,
          norm(timeClassRaw),
          table.id || "",
        ].join("|");

        const existing = slotByKey.get(mergeKey);
        if (existing) {
          mergeSlotRates(existing, {
            dayBandKey,
            ratesBySec,
            rateGhs,
            legacyDayBands,
            impressions,
            programs,
            row,
          });
          continue;
        }

        const slot = {
          id: row.id,
          label: daypartLabel,
          range: timeRangeText,
          rateGhs,
          ratesBySec,
          impressionsPerAiring: impressions.impressionsPerAiring,
          impressionsSource: impressions.impressionsSource,
          programs: programs.programs,
          programsSource: programs.programsSource,
          booked: !row.isBookable,
        };
        if (dayBandKey) {
          slot.ratesByDayBand = {
            [dayBandKey]: { ...ratesBySec },
          };
        } else if (Object.keys(legacyDayBands).length > 0) {
          slot.ratesByDayBand = { ...legacyDayBands };
        }
        slotByKey.set(mergeKey, slot);
      }
    }
  }

  return Array.from(slotByKey.values());
}
