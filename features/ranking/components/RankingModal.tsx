"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { GameButton } from "@/components/GameButton";
import { PillTabs } from "@/components/PillTabs";
import { Select } from "@/components/Select";
import {
  getServerRankingSnapshot,
  readBundleRanking,
  readCumulativeRanking,
  refreshBundleRanking,
  refreshRanking,
  subscribeRanking,
} from "@/features/ranking/rankingStore";
import type { RankEntry } from "@/features/ranking/types";
import { getBundles } from "@/features/stage/stageRepository";

type Tab = "cumulative" | "theme";

type Props = {
  onClose: () => void;
};

export function RankingModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>("cumulative");
  const [bundleId, setBundleId] = useState<string>("rainy_street");
  // 매 진입마다 로딩을 먼저 보여주고 동기화 완료 후 데이터 표시 (오래된 캐시 번쩍임 방지)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshRanking()
      .catch((e) => console.error("ranking fetch failed", e))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refreshBundleRanking(bundleId);
  }, [bundleId]);

  const cumulative = useSyncExternalStore(
    subscribeRanking,
    readCumulativeRanking,
    getServerRankingSnapshot,
  );

  const bundleEntries = useSyncExternalStore(
    subscribeRanking,
    () => readBundleRanking(bundleId),
    getServerRankingSnapshot,
  );

  const bundles = getBundles();
  const bundleOptions = bundles.map((b) => ({ value: b.id, label: b.name }));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col font-mono text-white"
      style={{ background: "var(--backdrop)" }}
    >
      <div className="fixed left-4 top-4 z-[60]">
        <GameButton size="sm" onClick={onClose}>
          ← 메인으로
        </GameButton>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center px-4 py-12">
        <h1 className="mb-8 text-4xl font-bold tracking-widest [text-shadow:_0_2px_8px_rgb(0_0_0_/_45%)]">
          랭킹
        </h1>

        {isLoading ? (
          <div className="fixed inset-0 flex items-center justify-center px-4 text-center">
            <span className="animate-pulse text-xl font-bold tracking-widest text-white [text-shadow:_0_1px_6px_rgb(0_0_0_/_60%)] sm:text-2xl">
              랭킹을 불러오는 중 ...
            </span>
          </div>
        ) : (
          <>
            <div className="mb-6 shrink-0">
              <PillTabs
                items={[
                  { value: "cumulative", label: "누적점수" },
                  { value: "theme", label: "테마별 랭킹" },
                ]}
                value={tab}
                onChange={(v) => setTab(v as Tab)}
              />
            </div>

            <div className="flex min-h-0 w-full max-w-2xl flex-1 flex-col">
              {tab === "cumulative" && (
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <RankList entries={cumulative} />
                </div>
              )}

              {tab === "theme" && (
                <div className="flex min-h-0 flex-1 flex-col gap-4">
                  <div className="shrink-0">
                    <Select
                      value={bundleId}
                      options={bundleOptions}
                      onChange={setBundleId}
                    />
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <RankList entries={bundleEntries} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RankList({ entries }: { entries: RankEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-white/30 bg-white/10 py-8 text-center text-sm text-white/70 backdrop-blur">
        기록 없음
      </div>
    );
  }

  return (
    <div className="rank-list">
      {entries.map((e, i) => (
        <div
          key={`${e.nickname}-${i}`}
          className={`rank-item ${e.isMe ? "rank-item--me" : ""}`}
        >
          <div className="rank-item__no">#{i + 1}</div>
          <div className="rank-item__name">
            {e.nickname}
            {e.isMe && <span className="me-badge">ME</span>}
          </div>
          <div className="rank-item__score">{e.score.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
