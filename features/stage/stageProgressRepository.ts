import { setData, getData } from "@/lib/storage";
import type { StageProgress } from "./types";

const KEY = "rd:progress";

const DEFAULT_PROGRESS: StageProgress = {
  clearedStageIds: [],
  bestScores: {},
  attemptCounts: {},
  cumulativeScore: 0,
};

export function getProgress(): StageProgress {
  return getData<StageProgress>(KEY, DEFAULT_PROGRESS);
}

export function markCleared(stageId: string): StageProgress {
  const current = getProgress();
  if (current.clearedStageIds.includes(stageId)) return current;

  const updated: StageProgress = {
    ...current,
    clearedStageIds: [...current.clearedStageIds, stageId],
  };
  setData(KEY, updated);
  return updated;
}

export function getBestScore(stageId: string): number {
  return getProgress().bestScores[stageId] ?? 0;
}

export function recordBestScore(stageId: string, score: number): StageProgress {
  const current = getProgress();
  const prevBest = current.bestScores[stageId] ?? 0;
  if (score <= prevBest) return current;

  const updated: StageProgress = {
    ...current,
    bestScores: { ...current.bestScores, [stageId]: score },
  };
  setData(KEY, updated);
  return updated;
}

export function getCumulativeScore(): number {
  return getProgress().cumulativeScore ?? 0;
}

export function addCumulativeScore(amount: number): StageProgress {
  const current = getProgress();
  const updated: StageProgress = {
    ...current,
    cumulativeScore: (current.cumulativeScore ?? 0) + amount,
  };
  setData(KEY, updated);
  return updated;
}

export function incrementAttemptCount(stageId: string): StageProgress {
  const current = getProgress();
  const prevCount = current.attemptCounts[stageId] ?? 0;

  const updated: StageProgress = {
    ...current,
    attemptCounts: { ...current.attemptCounts, [stageId]: prevCount + 1 },
  };
  setData(KEY, updated);
  return updated;
}
