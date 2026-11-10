import { getTalentLeaderboardEntries } from "@/actions/doctors-listing";
import {
  CREATOR_LEADERBOARD_DEMO,
  shapeCreatorLeaderboard,
} from "@/lib/creator-leaderboard";
import { TalentLeaderboard } from "../components/talent-leaderboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Talent Leaderboard - Payollar",
  description: "See top ranked creators across all specialties on Payollar.",
};

export default async function TalentLeaderboardPage() {
  const { entries: liveEntries, error } = await getTalentLeaderboardEntries();

  if (error) {
    console.error("Talent leaderboard load failed:", error);
  }

  const shaped = shapeCreatorLeaderboard(liveEntries?.length ? liveEntries : []);
  const entries = shaped.entries.length >= 3 ? liveEntries : CREATOR_LEADERBOARD_DEMO;

  return <TalentLeaderboard entries={entries} />;
}
