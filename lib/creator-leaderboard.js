/** Demo + helpers for the creator leaderboard (Trophy UI kit shape). */

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days, from = new Date()) {
  const next = new Date(from);
  next.setHours(12, 0, 0, 0);
  next.setDate(next.getDate() - days);
  return next;
}

function buildRuns(now = new Date()) {
  const end = new Date(now);
  end.setHours(12, 0, 0, 0);
  const seasonStart = new Date(Date.UTC(end.getFullYear(), end.getMonth() >= 8 ? 8 : 0, 1));

  return {
    "24h": {
      id: "24h",
      label: "24h",
      fromDate: isoDate(daysAgo(1, end)),
      toDate: isoDate(end),
    },
    "7d": {
      id: "7d",
      label: "7D",
      fromDate: isoDate(daysAgo(7, end)),
      toDate: isoDate(end),
    },
    "30d": {
      id: "30d",
      label: "30D",
      fromDate: isoDate(daysAgo(30, end)),
      toDate: isoDate(end),
    },
    seasonal: {
      id: "seasonal",
      label: "Seasonal",
      fromDate: isoDate(seasonStart),
      toDate: isoDate(end),
    },
  };
}

export const LEADERBOARD_RUNS = buildRuns();

export const LEADERBOARD_RUN_OPTIONS = Object.values(LEADERBOARD_RUNS).map((run) => ({
  id: run.id,
  label: run.label,
}));

/** Next Monday 00:00 local — used for the reset countdown. */
export function getLeaderboardResetAt(now = new Date()) {
  const next = new Date(now);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay(); // 0 Sun … 6 Sat
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  next.setDate(next.getDate() + daysUntilMonday);
  return next;
}

export function formatLeaderboardMetric(entry, sortId = "rank") {
  if (sortId === "winRate") {
    return {
      value: entry.winRate ?? 0,
      displayValue: `${Math.round(entry.winRate ?? 0)}%`,
      label: "Win rate",
    };
  }
  if (sortId === "score") {
    const score = Number(entry.score ?? 0);
    return {
      value: score,
      displayValue: score.toFixed(2),
      label: "Score",
    };
  }
  const points = Number(entry.value ?? 0);
  return {
    value: points,
    displayValue:
      points >= 1000
        ? points.toLocaleString("en-GH")
        : String(points),
    label: "Points",
  };
}

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

export function shapeCreatorLeaderboard(entries, { currentUserId, sortId = "rank" } = {}) {
  const ranked = [...entries].map((entry, index) => {
    const rank = index + 1;
    const tier = tierForValue(entry.value);
    const metric = formatLeaderboardMetric(entry, sortId);
    return {
      ...entry,
      rank,
      byline: `${entry.specialty || "Creator"} · ${tier}`,
      displayValue: metric.displayValue,
      metricLabel: metric.label,
      displayed:
        rank <= 10 ||
        entry.userId === currentUserId ||
        rank >= entries.length - 1,
    };
  });

  const podiumRankings = ranked.slice(0, 3).map((entry) => ({
    userId: entry.userId,
    userName: entry.userName,
    specialty: entry.specialty,
    rank: entry.rank,
    value: entry.value,
    displayValue: entry.displayValue,
    metricLabel: entry.metricLabel,
    avatarUrl: entry.avatarUrl,
  }));

  const rankings = ranked.map((entry) => ({
    userId: entry.userId,
    userName: entry.userName,
    specialty: entry.specialty,
    rank: entry.rank,
    value: entry.value,
    displayValue: entry.displayValue,
    metricLabel: entry.metricLabel,
    byline: entry.byline,
    avatarUrl: entry.avatarUrl,
    rankChange: entry.rankChange,
    displayed: entry.displayed,
  }));

  return { podiumRankings, rankings, entries: ranked, metricLabel: formatLeaderboardMetric({}, sortId).label };
}
