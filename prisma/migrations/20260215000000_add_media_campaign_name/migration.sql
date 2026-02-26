-- Add mediaCampaignName to RateCardBookingItem
ALTER TABLE "RateCardBookingItem" ADD COLUMN IF NOT EXISTS "mediaCampaignName" TEXT;
