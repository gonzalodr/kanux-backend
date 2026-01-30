// analytics.types.ts

export interface AnalyticsSummary {
  totalCandidates: number;
  activeChallenges: number;
  completionRate: number;
  topMatchScore: number;
}

export type StatChangeType = "positive" | "negative" | "neutral" | "info";

export interface StatChange {
  value: number;
  label: string;
  type: StatChangeType;
}

export interface ChallengePerformance {
  challengeId: string;
  title: string;
  avgScore: number;
  submissions: number;
}

export type ScoreRange = "90-100" | "80-89" | "70-79" | "60-69" | "below-60";

export type ScoreDistribution = Record<ScoreRange, number>;

export interface TopCandidate {
  id: string;
  name: string;
  score: number;
  skills: string[];
}

export type CandidateQualityTier = "high" | "medium" | "low";

export type CandidateQuality = Record<CandidateQualityTier, number>;

export interface AnalyticsDashboard {
  summary: AnalyticsSummary;
  summaryChanges: {
    totalCandidates: StatChange;
    completionRate: StatChange;
    activeChallenges: StatChange;
  };
  challengePerformance: ChallengePerformance[];
  scoreDistribution: ScoreDistribution;
  topCandidates: TopCandidate[];
  candidateQuality: CandidateQuality;
}
