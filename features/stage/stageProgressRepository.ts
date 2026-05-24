import {
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  increment,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ensureAuth } from "@/features/user/authRepository";
import type { StageProgress } from "./types";

const DEFAULT_PROGRESS: StageProgress = {
  clearedStageIds: [],
  bestScores: {},
  attemptCounts: {},
  cumulativeScore: 0,
};

// 서버(Firestore)에서 가져온 진행도를 담는 인메모리 캐시.
// 동기 소비자(엔진·랭킹)는 이 캐시를 읽고, 영속화는 Firestore가 담당한다.
let cache: StageProgress = DEFAULT_PROGRESS;
// 서버에서 한 번이라도 진행도를 받아왔는지 — 재진입 시 로딩 스킵 판단용
let progressLoaded = false;
const listeners = new Set<() => void>();

export function isProgressLoaded(): boolean {
  return progressLoaded;
}

function notify() {
  for (const l of listeners) l();
}

function progressRef(uid: string) {
  return doc(db, "progress", uid);
}

// --- useSyncExternalStore 용 ---
export function subscribeProgress(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getCachedProgress(): StageProgress {
  return cache;
}

export function getServerProgressSnapshot(): StageProgress {
  return DEFAULT_PROGRESS;
}

export async function fetchProgress(): Promise<StageProgress> {
  const uid = await ensureAuth();
  const snap = await getDoc(progressRef(uid));
  cache = snap.exists()
    ? { ...DEFAULT_PROGRESS, ...(snap.data() as Partial<StageProgress>) }
    : DEFAULT_PROGRESS;
  progressLoaded = true;
  notify();
  return cache;
}

// --- 동기 읽기 (캐시 기반) ---
export function getProgress(): StageProgress {
  return cache;
}

export function getBestScore(stageId: string): number {
  return cache.bestScores[stageId] ?? 0;
}

export function getCumulativeScore(): number {
  return cache.cumulativeScore ?? 0;
}

// --- 변경 (캐시 낙관적 갱신 + Firestore 쓰기) ---
export async function markCleared(stageId: string): Promise<void> {
  if (cache.clearedStageIds.includes(stageId)) return;
  cache = {
    ...cache,
    clearedStageIds: [...cache.clearedStageIds, stageId],
  };
  notify();
  const uid = await ensureAuth();
  await setDoc(
    progressRef(uid),
    { clearedStageIds: arrayUnion(stageId) },
    { merge: true },
  );
}

export async function recordBestScore(
  stageId: string,
  score: number,
): Promise<void> {
  const prev = cache.bestScores[stageId] ?? 0;
  if (score <= prev) return;
  cache = {
    ...cache,
    bestScores: { ...cache.bestScores, [stageId]: score },
  };
  notify();
  const uid = await ensureAuth();
  await setDoc(
    progressRef(uid),
    { bestScores: { [stageId]: score } },
    { merge: true },
  );
}

export async function addCumulativeScore(amount: number): Promise<void> {
  cache = {
    ...cache,
    cumulativeScore: (cache.cumulativeScore ?? 0) + amount,
  };
  notify();
  const uid = await ensureAuth();
  await setDoc(
    progressRef(uid),
    { cumulativeScore: increment(amount) },
    { merge: true },
  );
}

export async function incrementAttemptCount(stageId: string): Promise<void> {
  const prev = cache.attemptCounts[stageId] ?? 0;
  cache = {
    ...cache,
    attemptCounts: { ...cache.attemptCounts, [stageId]: prev + 1 },
  };
  notify();
  const uid = await ensureAuth();
  await setDoc(
    progressRef(uid),
    { attemptCounts: { [stageId]: increment(1) } },
    { merge: true },
  );
}

/** 진행도 초기화 — 캐시·서버 문서 모두 제거 */
export async function clearProgress(): Promise<void> {
  cache = DEFAULT_PROGRESS;
  notify();
  const uid = await ensureAuth();
  await deleteDoc(progressRef(uid));
}
