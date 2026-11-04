/** Common follower ranges for campaign briefs. */
export const FOLLOWER_RANGE_PRESETS = [
  { id: "1k-5k", label: "1K – 5K", min: 1000, max: 5000 },
  { id: "5k-10k", label: "5K – 10K", min: 5000, max: 10000 },
  { id: "10k-50k", label: "10K – 50K", min: 10000, max: 50000 },
  { id: "50k-100k", label: "50K – 100K", min: 50000, max: 100000 },
  { id: "100k-plus", label: "100K+", min: 100000, max: null },
  { id: "any", label: "Any size", min: null, max: null },
];

export function formatFollowerCount(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  if (number >= 1000000) {
    const millions = number / 1000000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  if (number >= 1000) {
    const thousands = number / 1000;
    return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`;
  }
  return String(Math.round(number));
}

export function formatFollowerRange(campaign) {
  const min = Number.isFinite(Number(campaign?.followerMin))
    ? Number(campaign.followerMin)
    : null;
  const max = Number.isFinite(Number(campaign?.followerMax))
    ? Number(campaign.followerMax)
    : null;

  if (min != null && max != null) {
    return `${formatFollowerCount(min)} – ${formatFollowerCount(max)} followers`;
  }
  if (min != null) return `${formatFollowerCount(min)}+ followers`;
  if (max != null) return `Up to ${formatFollowerCount(max)} followers`;
  return null;
}

export function matchFollowerPreset(min, max) {
  const minValue = min === "" || min == null ? null : Number(min);
  const maxValue = max === "" || max == null ? null : Number(max);
  return (
    FOLLOWER_RANGE_PRESETS.find((preset) => {
      const presetMin = preset.min;
      const presetMax = preset.max;
      const minMatch =
        (presetMin == null && (minValue == null || Number.isNaN(minValue))) ||
        presetMin === minValue;
      const maxMatch =
        (presetMax == null && (maxValue == null || Number.isNaN(maxValue))) ||
        presetMax === maxValue;
      return minMatch && maxMatch;
    })?.id || "custom"
  );
}
