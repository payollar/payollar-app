/** Campaign taxonomy used by the create-campaign form and campaign labels. */
export const CAMPAIGN_CATEGORIES = [
  {
    name: "Social",
    detail: "Posts, clips, and community",
    subcategories: [
      "Short-form clips",
      "Sponsored posts",
      "Stories and reels",
      "User-generated content",
      "Community management",
    ],
  },
  {
    name: "Video",
    detail: "Edits, ads, and coverage",
    subcategories: [
      "Clipping",
      "Long-form edit",
      "Ad creative",
      "Faceless video",
      "Product demo",
      "Event coverage",
    ],
  },
  {
    name: "Influencer",
    detail: "Creators promoting the brand",
    subcategories: ["Product review", "Brand ambassador", "Unboxing", "Live session", "Affiliate"],
  },
  {
    name: "Audio",
    detail: "Radio, podcasts, and voice",
    subcategories: ["Radio spot", "Podcast", "Voice over", "Jingle"],
  },
  {
    name: "Outdoor",
    detail: "Billboards and physical placements",
    subcategories: ["Billboard", "Transit", "Retail display"],
  },
  {
    name: "Talent",
    detail: "People booked for the campaign",
    subcategories: ["Host", "DJ", "Performer", "Photographer", "Designer"],
  },
];

export function campaignCategoryLabel(campaign) {
  if (!campaign?.category) return "";
  return campaign.subcategory ? `${campaign.category} · ${campaign.subcategory}` : campaign.category;
}
