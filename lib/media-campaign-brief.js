/** Shared options for media planner campaign brief (step 1). */

export const MEDIA_CAMPAIGN_OBJECTIVES = [
  { id: "awareness", label: "Brand awareness", hint: "Reach and recall" },
  { id: "launch", label: "Product launch", hint: "Introduce something new" },
  { id: "promo", label: "Promo & sales", hint: "Drive offers and response" },
  { id: "event", label: "Event", hint: "Build attendance or buzz" },
  { id: "corporate", label: "Corporate / CSR", hint: "Reputation and trust" },
];

export const MEDIA_AUDIENCE_TYPES = [
  { id: "general", label: "General / mass", hint: "Broad national reach" },
  { id: "youth", label: "Youth 18–34", hint: "Students & young adults" },
  { id: "professionals", label: "Professionals", hint: "Working & urban" },
  { id: "families", label: "Families", hint: "Parents & households" },
  { id: "affluent", label: "Affluent", hint: "Premium buyers" },
  { id: "niche", label: "Niche", hint: "Special-interest" },
];

export const MEDIA_INDUSTRY_OPTIONS = [
  { id: "fmcg", label: "FMCG", hint: "Food, beverages, household" },
  { id: "telecom", label: "Telecom", hint: "Mobile, data, ISP" },
  { id: "finance", label: "Banking & finance", hint: "Banks, credit, payments" },
  { id: "fintech", label: "Fintech & mobile money", hint: "Wallets, transfers, apps" },
  { id: "insurance", label: "Insurance", hint: "Life, health, motor" },
  { id: "health", label: "Health & pharma", hint: "Clinics, OTC, wellness" },
  { id: "education", label: "Education", hint: "Schools, edtech, training" },
  { id: "entertainment", label: "Entertainment & media", hint: "Film, music, streaming" },
  { id: "sports", label: "Sports", hint: "Teams, leagues, fitness" },
  { id: "auto", label: "Automotive", hint: "Cars, bikes, dealers" },
  { id: "retail", label: "Retail & e‑commerce", hint: "Stores, marketplaces" },
  { id: "fashion", label: "Fashion & beauty", hint: "Apparel, cosmetics" },
  { id: "hospitality", label: "Hospitality & travel", hint: "Hotels, tourism, airlines" },
  { id: "real-estate", label: "Real estate", hint: "Housing, developers" },
  { id: "energy", label: "Energy & utilities", hint: "Oil, gas, power, solar" },
  { id: "agriculture", label: "Agriculture & agribusiness", hint: "Farming, inputs, food processing" },
  { id: "tech", label: "Technology & SaaS", hint: "Software, devices, IT" },
  { id: "ngo", label: "NGO & development", hint: "Nonprofits, social impact" },
  { id: "gov", label: "Government & politics", hint: "Public sector, campaigns" },
  { id: "religion", label: "Faith & religion", hint: "Churches, ministries" },
  { id: "professional", label: "Professional services", hint: "Legal, consulting, agencies" },
  { id: "logistics", label: "Logistics & transport", hint: "Shipping, delivery, fleet" },
  { id: "construction", label: "Construction & industrial", hint: "Building, materials, B2B" },
  { id: "other", label: "Other", hint: "Not listed above" },
];

export function mediaBriefLabel(options, id) {
  return options.find((option) => option.id === id)?.label || null;
}

export function mediaBriefLabels(options, ids = []) {
  return (ids || [])
    .map((id) => mediaBriefLabel(options, id))
    .filter(Boolean);
}
