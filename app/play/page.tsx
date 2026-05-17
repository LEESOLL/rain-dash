"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { StageMap } from "@/features/stage/components/StageMap";
import { getProgress } from "@/features/stage/stageProgressRepository";
import { getBundles } from "@/features/stage/stageRepository";
import type { StageProgress } from "@/features/stage/types";

const DEFAULT_PROGRESS: StageProgress = {
  clearedStageIds: [],
  bestScores: {},
  attemptCounts: {},
  cumulativeScore: 0,
};

let cachedProgress: StageProgress | undefined;
const progressListeners = new Set<() => void>();

function readProgress(): StageProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  if (!cachedProgress) cachedProgress = getProgress();
  return cachedProgress;
}

function subscribeProgress(cb: () => void): () => void {
  progressListeners.add(cb);
  return () => {
    progressListeners.delete(cb);
  };
}

function refreshProgress() {
  cachedProgress = undefined;
  for (const l of progressListeners) l();
}

function getServerProgressSnapshot(): StageProgress {
  return DEFAULT_PROGRESS;
}

export default function StageSelectPage() {
  useEffect(() => {
    refreshProgress();
    requestAnimationFrame(() => {
      const current = document.querySelector('[data-stage-status="current"]');
      if (current) {
        current.scrollIntoView({ block: "center" });
        return;
      }
      const cleared = document.querySelectorAll('[data-stage-status="cleared"]');
      if (cleared.length > 0) {
        cleared[cleared.length - 1].scrollIntoView({ block: "center" });
        return;
      }
      window.scrollTo({ top: document.body.scrollHeight });
    });
  }, []);

  const progress = useSyncExternalStore(
    subscribeProgress,
    readProgress,
    getServerProgressSnapshot,
  );

  const bundles = getBundles();

  return (
    <main className="flex min-h-dvh flex-col items-center bg-black px-4 py-10 font-mono text-white">
      <h1 className="mb-8 text-4xl font-bold tracking-widest">스테이지 선택</h1>

      <div className="w-full max-w-xl">
        <StageMap bundles={bundles} progress={progress} />
      </div>

      <Link
        href="/"
        className="mt-10 rounded border border-white/30 px-6 py-2 text-sm transition hover:bg-white/10"
      >
        ← 메인으로
      </Link>
    </main>
  );
}
