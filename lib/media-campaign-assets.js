export const MEDIA_ASSET_TYPES = [
  { id: "tvc", label: "TVC", hint: "Television commercial / video spot" },
  { id: "jingle", label: "Jingle", hint: "Musical or sonic brand ID" },
  {
    id: "produced-spot",
    label: "Produced spot",
    hint: "Pre-recorded radio or voice spot",
  },
  { id: "live-read", label: "Live read script", hint: "Script for host read" },
  { id: "lpm", label: "LPM", hint: "Live programme mention materials" },
  { id: "sponsorship", label: "Sponsorship", hint: "Billboard / sponsorship creative" },
  { id: "announcement", label: "Announcement", hint: "Station announcement asset" },
  { id: "other", label: "Other", hint: "Any other campaign creative" },
];

export function mediaAssetTypeLabel(assetType) {
  return (
    MEDIA_ASSET_TYPES.find((type) => type.id === assetType)?.label ||
    assetType ||
    "Creative"
  );
}
