import {
  getCumulativeScore,
  getProgress,
} from "@/features/stage/stageProgressRepository";
import { getBundle } from "@/features/stage/stageRepository";
import { getUser } from "@/features/user/userRepository";
import { MOCK_USERS } from "./mockData";
import type { RankEntry } from "./types";

export function getCumulativeRanking(): RankEntry[] {
  const me = getUser();
  const myScore = getCumulativeScore();

  const entries: RankEntry[] = MOCK_USERS.map((u) => ({
    nickname: u.nickname,
    score: u.cumulativeScore,
    isMe: false,
  }));

  if (me) {
    entries.push({
      nickname: me.nickname,
      score: myScore,
      isMe: true,
    });
  }

  return entries.sort((a, b) => b.score - a.score);
}

export function getBundleRanking(bundleId: string): RankEntry[] {
  const me = getUser();
  const progress = getProgress();
  const bundle = getBundle(bundleId);

  const myBundleScore = bundle
    ? bundle.stageIds.reduce(
        (sum, sid) => sum + (progress.bestScores[sid] ?? 0),
        0,
      )
    : 0;

  const entries: RankEntry[] = MOCK_USERS.map((u) => ({
    nickname: u.nickname,
    score: u.bundleScores[bundleId] ?? 0,
    isMe: false,
  })).filter((e) => e.score > 0);

  if (me) {
    entries.push({
      nickname: me.nickname,
      score: myBundleScore,
      isMe: true,
    });
  }

  return entries.sort((a, b) => b.score - a.score);
}
