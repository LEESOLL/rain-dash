"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { GameButton } from "@/components/GameButton";
import { StageMap } from "@/features/stage/components/StageMap";
import {
  fetchProgress,
  getCachedProgress,
  getServerProgressSnapshot,
  subscribeProgress,
} from "@/features/stage/stageProgressRepository";
import { getBundles } from "@/features/stage/stageRepository";
import { useIsTouch } from "@/lib/touch";

type Props = {
  onClose: () => void;
};

export function StageModal({ onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  // 모바일: 범례가 노드와 겹쳐 ⓘ 버튼으로 토글
  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
    fetchProgress().catch((e) => console.error("progress fetch failed", e));
  }, []);

  const progress = useSyncExternalStore(
    subscribeProgress,
    getCachedProgress,
    getServerProgressSnapshot,
  );

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    requestAnimationFrame(() => {
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
  }, [progress]);

  const bundles = getBundles();

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 z-50 overflow-y-auto font-mono text-white"
      style={{ background: "var(--backdrop)" }}
    >
      <div className="fixed left-4 top-4 z-[60]">
        <GameButton size="sm" onClick={onClose}>
          ← 메인으로
        </GameButton>
      </div>

      <div className="relative flex min-h-dvh flex-col items-center px-4 py-12">
        <div className="w-full max-w-xl">
          <StageMap bundles={bundles} progress={progress} />
        </div>
      </div>

      {isTouch ? (
        <>
          {legendOpen && (
            <div className="stage-legend stage-legend--mobile">
              <LegendItem color="var(--color-yellow)" label="현재 스테이지" />
              <LegendItem color="#6BD6AB" label="깬 스테이지" />
              <LegendItem color="#FF9BBC" label="아직 깨기 전" />
              <LegendItem color="#A8B0BB" label="준비 중" />
            </div>
          )}
          <button
            type="button"
            className="stage-legend-toggle"
            onClick={() => setLegendOpen((o) => !o)}
            aria-label="범례 보기"
          >
            ⓘ
          </button>
        </>
      ) : (
        <div className="stage-legend">
          <LegendItem color="var(--color-yellow)" label="현재 스테이지" />
          <LegendItem color="#6BD6AB" label="깬 스테이지" />
          <LegendItem color="#FF9BBC" label="아직 깨기 전" />
          <LegendItem color="#A8B0BB" label="준비 중" />
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="stage-legend__item">
      <span className="stage-legend__chip" style={{ background: color }} />
      {label}
    </div>
  );
}
