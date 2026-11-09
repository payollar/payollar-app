/** Demo + helpers for the creator leaderboard (Trophy UI kit shape). */

export const LEADERBOARD_RUNS = {
  "24h": {
    id: "24h",
    label: "24h",
    fromDate: "2026-11-08",
    toDate: "2026-11-09",
  },
  "7d": {
    id: "7d",
    label: "7D",
    fromDate: "2026-11-02",
    toDate: "2026-11-09",
  },
  "30d": {
    id: "30d",
    label: "30D",
    fromDate: "2026-10-10",
    toDate: "2026-11-09",
  },
  seasonal: {
    id: "seasonal",
    label: "Seasonal",
    fromDate: "2026-09-01",
    toDate: "2026-11-09",
  },
};

export const LEADERBOARD_RUN_OPTIONS = Object.values(LEADERBOARD_RUNS).map((run) => ({
  id: run.id,
  label: run.label,
}));

function tierForValue(value) {
  if (value >= 250000) return "Legend";
  if (value >= 200000) return "Elite";
  if (value >= 150000) return "Pro";
  if (value >= 100000) return "Rising";
  return "Rookie";
}

/** Sample board so the page always has a full podium + rankings UI. */
export const CREATOR_LEADERBOARD_DEMO = [
  {
    userId: "c-1",
    userName: "Ama Mensah",
    specialty: "Influencer",
    avatarUrl: "https://i.pravatar.cc/96?img=32",
    value: 289400,
    completed: 42,
    booked: 21,
    winRate: 64,
    score: 1.23,
    rankChange: 2,
  },
  {
    userId: "c-2",
    userName: "Kwame Boateng",
    specialty: "Musician",
    avatarUrl: "https://i.pravatar.cc/96?img=12",
    value: 251800,
    completed: 38,
    booked: 24,
    winRate: 58,
    score: 1.11,
    rankChange: -1,
  },
  {
    userId: "c-3",
    userName: "Efua Addo",
    specialty: "Actor",
    avatarUrl: "https://i.pravatar.cc/96?img=15",
    value: 238300,
    completed: 35,
    booked: 19,
    winRate: 61,
    score: 1.08,
    rankChange: 1,
  },
  {
    userId: "c-4",
    userName: "Yaw Owusu",
    specialty: "Creator",
    avatarUrl: "https://i.pravatar.cc/96?img=33",
    value: 221700,
    completed: 31,
    booked: 22,
    winRate: 55,
    score: 0.97,
    rankChange: 0,
  },
  {
    userId: "c-5",
    userName: "Akosua Darko",
    specialty: "Model",
    avatarUrl: "https://i.pravatar.cc/96?img=47",
    value: 210900,
    completed: 29,
    booked: 18,
    winRate: 62,
    score: 1.04,
    rankChange: 3,
  },
  {
    userId: "c-6",
    userName: "Kofi Asante",
    specialty: "DJ",
    avatarUrl: "https://i.pravatar.cc/96?img=11",
    value: 199500,
    completed: 27,
    booked: 20,
    winRate: 52,
    score: 0.91,
    rankChange: -2,
  },
  {
    userId: "c-7",
    userName: "Abena Sarpong",
    specialty: "Host",
    avatarUrl: "https://i.pravatar.cc/96?img=5",
    value: 187200,
    completed: 24,
    booked: 17,
    winRate: 57,
    score: 0.88,
    rankChange: 1,
  },
  {
    userId: "c-8",
    userName: "Nana Serwaa",
    specialty: "Influencer",
    avatarUrl: "https://i.pravatar.cc/96?img=20",
    value: 176800,
    completed: 22,
    booked: 16,
    winRate: 49,
    score: 0.82,
    rankChange: 0,
  },
  {
    userId: "c-9",
    userName: "Fiifi Lamptey",
    specialty: "Comedian",
    avatarUrl: "https://i.pravatar.cc/96?img=52",
    value: 169300,
    completed: 20,
    booked: 15,
    winRate: 54,
    score: 0.79,
    rankChange: -1,
  },
  {
    userId: "c-10",
    userName: "Adwoa Poku",
    specialty: "Creator",
    avatarUrl: "https://i.pravatar.cc/96?img=29",
    value: 158100,
    completed: 18,
    booked: 14,
    winRate: 51,
    score: 0.74,
    rankChange: 2,
  },
  {
    userId: "c-11",
    userName: "Kojo Frimpong",
    specialty: "Photographer",
    avatarUrl: "https://i.pravatar.cc/96?img=8",
    value: 142600,
    completed: 16,
    booked: 13,
    winRate: 48,
    score: 0.69,
    rankChange: 0,
  },
  {
    userId: "c-12",
    userName: "Maame Esi",
    specialty: "Dancer",
    avatarUrl: "https://i.pravatar.cc/96?img=45",
    value: 130900,
    completed: 14,
    booked: 12,
    winRate: 46,
    score: 0.63,
    rankChange: -3,
  },
];

export function shapeCreatorLeaderboard(entries, { currentUserId } = {}) {
  const ranked = [...entries]
    .sort((a, b) => b.value - a.value)
    .map((entry, index) => {
      const rank = index + 1;
      const tier = tierForValue(entry.value);
      return {
        ...entry,
        rank,
        byline: `Level ${Math.max(12, 48 - index * 2)} · ${tier}`,
        displayed: rank <= 3 || rank >= entries.length - 2 || entry.userId === currentUserId || rank <= 8,
      };
    });

  const podiumRankings = ranked.slice(0, 3).map((entry) => ({
    userId: entry.userId,
    userName: entry.userName,
    rank: entry.rank,
    value: entry.value,
    avatarUrl: entry.avatarUrl,
  }));

  const rankings = ranked.map((entry) => ({
    userId: entry.userId,
    userName: entry.userName,
    rank: entry.rank,
    value: entry.value,
    byline: entry.byline,
    avatarUrl: entry.avatarUrl,
    rankChange: entry.rankChange,
    displayed: entry.displayed,
  }));

  return { podiumRankings, rankings, entries: ranked };
}
