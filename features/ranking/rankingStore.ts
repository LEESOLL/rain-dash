import { getBundleRanking, getCumulativeRanking } from "./rankingRepository";
import type { RankEntry } from "./types";

const EMPTY: RankEntry[] = [];

let cumulativeCache: RankEntry[] | undefined;
const bundleCache = new Map<string, RankEntry[]>();
const listeners = new Set<() => void>();

export function readCumulativeRanking(): RankEntry[] {
  if (typeof window === "undefined") return EMPTY;
  if (cumulativeCache === undefined) {
    cumulativeCache = getCumulativeRanking();
  }
  return cumulativeCache;
}

export function readBundleRanking(bundleId: string): RankEntry[] {
  if (typeof window === "undefined") return EMPTY;
  let cached = bundleCache.get(bundleId);
  if (!cached) {
    cached = getBundleRanking(bundleId);
    bundleCache.set(bundleId, cached);
  }
  return cached;
}

export function subscribeRanking(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function refreshRanking(): void {
  cumulativeCache = undefined;
  bundleCache.clear();
  for (const l of listeners) l();
}

export function getServerRankingSnapshot(): RankEntry[] {
  return EMPTY;
}
