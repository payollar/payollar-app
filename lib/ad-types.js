/**
 * Standard ad types for TV and Radio advertising.
 * Based on industry standards: TVC, LPM, sponsorship, jingles, live reads, etc.
 */

export const TV_AD_TYPES = [
  {
    id: "tvc",
    label: "TVC",
    fullName: "Television Commercial",
    description: "Pre-produced commercial spots that air during scheduled ad breaks. The most common format for brand advertising.",
    icon: "play",
  },
  {
    id: "lpm",
    label: "LPM",
    fullName: "Live Programme Mention",
    description: "Brand mention integrated into live programme content by presenters. Feels natural and trusted.",
    icon: "mic",
  },
  {
    id: "sponsorship",
    label: "Sponsorship",
    fullName: "Programme Sponsorship",
    description: "Brand association with programming (e.g. 'This programme is brought to you by...'). Builds strong brand affinity.",
    icon: "star",
  },
  {
    id: "product-placement",
    label: "Product Placement",
    fullName: "Product Placement",
    description: "Brand integration within programme content. Products used or visible in scenes.",
    icon: "box",
  },
  {
    id: "interview",
    label: "Interview",
    fullName: "Sponsored Interview",
    description: "Sponsored interview segments with hosts or guests. Ideal for thought leadership and brand storytelling.",
    icon: "message-circle",
  },
  {
    id: "documentary",
    label: "Documentary",
    fullName: "Sponsored Documentary",
    description: "Brand-sponsored documentary content. Extended format for deep storytelling.",
    icon: "film",
  },
]

export const RADIO_AD_TYPES = [
  {
    id: "jingle",
    label: "Jingle",
    fullName: "Jingle",
    description: "Musical ad with a catchy tune. Highly memorable and effective for brand recognition.",
    icon: "music",
  },
  {
    id: "produced-spot",
    label: "Produced Spot",
    fullName: "Produced Radio Spot",
    description: "Pre-recorded ad read by a voice actor. Typically 15–60 seconds. Professional and consistent.",
    icon: "mic",
  },
  {
    id: "live-read",
    label: "Live Read",
    fullName: "Live Read / Host Read",
    description: "Host reads your ad live on air. Authentic endorsement that sounds like part of the show.",
    icon: "radio",
  },
  {
    id: "lpm",
    label: "LPM",
    fullName: "Live Programme Mention",
    description: "Brand mention during live programming. Natural integration with programme content.",
    icon: "mic",
  },
  {
    id: "sponsorship",
    label: "Sponsorship",
    fullName: "Programme Sponsorship",
    description: "Sponsor news, weather, traffic, or entire shows. Packages include spots, mentions, and custom content.",
    icon: "star",
  },
  {
    id: "interview",
    label: "Interview",
    fullName: "Sponsored Interview",
    description: "Sponsored interview segments. Ideal for in-depth brand storytelling and credibility.",
    icon: "message-circle",
  },
]

export function getAdTypeById(mediaType, id) {
  const types = mediaType === "tv" ? TV_AD_TYPES : RADIO_AD_TYPES
  return types.find((t) => t.id === id) || null
}

export function getAdTypesForMediaType(mediaType) {
  const normalized = String(mediaType || "").toLowerCase()
  if (normalized === "tv") return TV_AD_TYPES
  if (normalized === "radio") return RADIO_AD_TYPES
  return TV_AD_TYPES // default fallback
}
