import { createData, fetchData } from "@/lib/storage";
import type { StageProgress } from "./types";

const KEY = "rd:progress";

const DEFAULT_PROGRESS: StageProgress = {
  clearedStageIds: [],
  bestScores: {},
  attemptCounts: {},
};

export function getProgress(): StageProgress {
  return fetchData<StageProgress>(KEY, DEFAULT_PROGRESS);
}

export function markCleared(stageId: string): StageProgress {
  const current = getProgress();
  if (current.clearedStageIds.includes(stageId)) return current;

  const updated: StageProgress = {
    ...current,
    clearedStageIds: [...current.clearedStageIds, stageId],
  };
  createData(KEY, updated);
  return updated;
}

export function recordBestScore(stageId: string, score: number): StageProgress {
  const current = getProgress();
  const prevBest = current.bestScores[stageId] ?? 0;
  if (score <= prevBest) return current;

  const updated: StageProgress = {
    ...current,
    bestScores: { ...current.bestScores, [stageId]: score },
  };
  createData(KEY, updated);
  return updated;
}

export function incrementAttemptCount(stageId: string): StageProgress {
  const current = getProgress();
  const prevCount = current.attemptCounts[stageId] ?? 0;

  const updated: StageProgress = {
    ...current,
    attemptCounts: { ...current.attemptCounts, [stageId]: prevCount + 1 },
  };
  createData(KEY, updated);
  return updated;
}
