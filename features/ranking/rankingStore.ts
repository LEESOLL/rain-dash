import {
  fetchBundleRanking,
  fetchCumulativeRanking,
} from "./rankingRepository";
import type { RankEntry } from "./types";

const EMPTY: RankEntry[] = [];

let cumulativeCache: RankEntry[] = EMPTY;
const bundleCache = new Map<string, RankEntry[]>();
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function readCumulativeRanking(): RankEntry[] {
  return cumulativeCache;
}

export function readBundleRanking(bundleId: string): RankEntry[] {
  return bundleCache.get(bundleId) ?? EMPTY;
}

export function subscribeRanking(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** 누적 랭킹을 Firestore에서 가져와 캐시 갱신 */
export function refreshRanking(): Promise<void> {
  return fetchCumulativeRanking()
    .then((entries) => {
      cumulativeCache = entries;
      notify();
    })
    .catch((e) => console.error("cumulative ranking fetch failed", e));
}

/** 특정 번들 랭킹을 Firestore에서 가져와 캐시 갱신 */
export function refreshBundleRanking(bundleId: string): Promise<void> {
  return fetchBundleRanking(bundleId)
    .then((entries) => {
      bundleCache.set(bundleId, entries);
      notify();
    })
    .catch((e) => console.error("bundle ranking fetch failed", e));
}

export function getServerRankingSnapshot(): RankEntry[] {
  return EMPTY;
}
