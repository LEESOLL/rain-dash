import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getCumulativeScore,
  getProgress,
} from "@/features/stage/stageProgressRepository";
import { getBundle } from "@/features/stage/stageRepository";
import { ensureAuth, getCurrentUid } from "@/features/user/authRepository";
import { getUser } from "@/features/user/userRepository";
import type { RankEntry } from "./types";

const TOP_LIMIT = 50;

function bundleScoreSum(bundleId: string): number {
  const bundle = getBundle(bundleId);
  if (!bundle) return 0;
  const progress = getProgress();
  return bundle.stageIds.reduce(
    (sum, sid) => sum + (progress.bestScores[sid] ?? 0),
    0,
  );
}

/** 현재 내 누적·번들 점수를 Firestore rankings/{uid}에 제출 */
export async function submitMyScore(bundleId: string): Promise<void> {
  const user = getUser();
  if (!user) return;
  const uid = await ensureAuth();
  await setDoc(
    doc(db, "rankings", uid),
    {
      nickname: user.nickname,
      cumulativeScore: getCumulativeScore(),
      bundleScores: { [bundleId]: bundleScoreSum(bundleId) },
      updatedAt: Date.now(),
    },
    { merge: true },
  );
}

export async function fetchCumulativeRanking(): Promise<RankEntry[]> {
  const myUid = getCurrentUid();
  const q = query(
    collection(db, "rankings"),
    orderBy("cumulativeScore", "desc"),
    limit(TOP_LIMIT),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      nickname: (data.nickname as string) ?? "익명이",
      score: (data.cumulativeScore as number) ?? 0,
      isMe: d.id === myUid,
    };
  });
}

export async function fetchBundleRanking(
  bundleId: string,
): Promise<RankEntry[]> {
  const myUid = getCurrentUid();
  const q = query(
    collection(db, "rankings"),
    orderBy(`bundleScores.${bundleId}`, "desc"),
    limit(TOP_LIMIT),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      const score = (data.bundleScores?.[bundleId] as number) ?? 0;
      return {
        nickname: (data.nickname as string) ?? "?",
        score,
        isMe: d.id === myUid,
      };
    })
    .filter((e) => e.score > 0);
}
