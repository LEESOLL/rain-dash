"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { GameButton } from "@/components/GameButton";
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

type Props = {
  onClose: () => void;
};

export function StageModal({ onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshProgress();
    requestAnimationFrame(() => {
      const root = scrollRef.current;
      if (!root) return;
      const current = root.querySelector('[data-stage-status="current"]');
      if (current) {
        current.scrollIntoView({ block: "center" });
        return;
      }
      const cleared = root.querySelectorAll('[data-stage-status="cleared"]');
      if (cleared.length > 0) {
        cleared[cleared.length - 1].scrollIntoView({ block: "center" });
        return;
      }
      root.scrollTo({ top: root.scrollHeight });
    });
  }, []);

  const progress = useSyncExternalStore(
    subscribeProgress,
    readProgress,
    getServerProgressSnapshot,
  );

  const bundles = getBundles();

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/45 font-mono text-white"
    >
      <div className="fixed left-4 top-4 z-[60]">
        <GameButton size="sm" onClick={onClose}>
          ← 메인으로
        </GameButton>
      </div>

      <div className="relative flex min-h-dvh flex-col items-center px-4 py-10">
        <h1 className="mb-8 text-4xl font-bold tracking-widest [text-shadow:_0_2px_8px_rgb(0_0_0_/_85%)]">
          스테이지 선택
        </h1>

        <div className="w-full max-w-xl">
          <StageMap bundles={bundles} progress={progress} />
        </div>
      </div>
    </div>
  );
}
