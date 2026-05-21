/** Strip decorative bullets/asterisks from stored skill text. */
export function cleanSkillLabel(raw) {
  return String(raw ?? "")
    .replace(/\*+/g, "")
    .replace(/^[•·\s,;]+|[•·\s,;]+$/g, "")
    .trim();
}

/**
 * Normalize skill rows (or strings) into a deduplicated list of display labels.
 * Handles legacy data where many skills were saved in one field with • separators.
 */
export function getDisplaySkillLabels(skills) {
  if (!Array.isArray(skills) || skills.length === 0) return [];

  const labels = [];

  for (const item of skills) {
    const raw = cleanSkillLabel(typeof item === "string" ? item : item?.name);
    if (!raw) continue;

    if (/[•·]/.test(raw)) {
      for (const part of raw.split(/[•·]/)) {
        const label = cleanSkillLabel(part);
        if (label) labels.push(label);
      }
    } else {
      labels.push(raw);
    }
  }

  return [...new Set(labels)];
}
