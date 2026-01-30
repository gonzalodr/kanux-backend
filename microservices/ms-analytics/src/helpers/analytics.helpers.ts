// analytics.helpers.ts

import {
  CandidateQuality,
  CandidateQualityTier,
  ScoreDistribution,
  ScoreRange,
  StatChange,
} from "../types/analytics.types";

export function buildScoreDistribution(
  rows: { range: ScoreRange; total: number }[],
): ScoreDistribution {
  return rows.reduce<ScoreDistribution>(
    (acc, r) => {
      acc[r.range] = r.total;
      return acc;
    },
    {
      "90-100": 0,
      "80-89": 0,
      "70-79": 0,
      "60-69": 0,
      "below-60": 0,
    },
  );
}

export function buildCandidateQuality(
  rows: { tier: CandidateQualityTier; total: number }[],
): CandidateQuality {
  return rows.reduce<CandidateQuality>(
    (acc, r) => {
      acc[r.tier] += r.total;
      return acc;
    },
    { high: 0, medium: 0, low: 0 },
  );
}

export function buildStatChange(
  current: number,
  previous: number,
  label = "vs previous period",
): StatChange {
  if (previous === 0) {
    return { value: 0, label, type: "neutral" };
  }

  const diff = Math.round(((current - previous) / previous) * 100);

  return {
    value: diff,
    label,
    type: diff > 0 ? "positive" : diff < 0 ? "negative" : "neutral",
  };
}
