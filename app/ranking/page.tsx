"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { GameButton } from "@/components/GameButton";
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

export default function RankingsPage() {
  const [tab, setTab] = useState<Tab>("cumulative");
  const [bundleId, setBundleId] = useState<string>("rainy-day");

  useEffect(() => {
    refreshRanking();
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

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-4 py-12 font-mono text-white">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/sprites/background/street-bg.png)" }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/55" />

      <div className="fixed left-4 top-4 z-30">
        <GameButton size="sm" href="/">
          ← 메인으로
        </GameButton>
      </div>

      <div className="relative z-10 flex w-full flex-col items-center">
        <h1 className="mb-8 text-4xl font-bold tracking-widest [text-shadow:_0_2px_8px_rgb(0_0_0_/_85%)]">
          랭킹
        </h1>

        <div className="mb-6 flex gap-2">
          <GameButton
            size="sm"
            variant={tab === "cumulative" ? "primary" : "secondary"}
            onClick={() => setTab("cumulative")}
          >
            누적점수
          </GameButton>
          <GameButton
            size="sm"
            variant={tab === "theme" ? "primary" : "secondary"}
            onClick={() => setTab("theme")}
          >
            테마별 랭킹
          </GameButton>
        </div>

        <div className="w-full max-w-md">
          {tab === "cumulative" && <RankList entries={cumulative} />}

          {tab === "theme" && (
            <div className="flex flex-col gap-4">
              <select
                value={bundleId}
                onChange={(e) => setBundleId(e.target.value)}
                className="rounded-2xl border-2 border-white/40 bg-white/15 px-4 py-2.5 text-white outline-none backdrop-blur transition focus:border-sky-300"
              >
                {bundles.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className="bg-black text-white"
                  >
                    {b.name}
                  </option>
                ))}
              </select>
              <RankList entries={bundleEntries} />
            </div>
          )}
        </div>
      </div>
    </main>
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
    <ol className="flex flex-col gap-2">
      {entries.map((e, i) => (
        <li
          key={`${e.nickname}-${i}`}
          className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 backdrop-blur ${
            e.isMe
              ? "border-sky-300/80 bg-sky-400/30"
              : "border-white/30 bg-white/15"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-10 opacity-50">#{i + 1}</span>
            <span
              className={e.isMe ? "font-bold text-white" : "text-white/90"}
            >
              {e.nickname}
            </span>
            {e.isMe && (
              <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-sky-600">
                ME
              </span>
            )}
          </div>
          <span
            className={e.isMe ? "font-bold text-white" : "text-white/80"}
          >
            {e.score.toLocaleString()}
          </span>
        </li>
      ))}
    </ol>
  );
}
