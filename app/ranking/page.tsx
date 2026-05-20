"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { GameButton } from "@/components/GameButton";
import {
  getServerRankingSnapshot,
  readBundleRanking,
  readCumulativeRanking,
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
      <div className="relative z-10 flex w-full flex-col items-center">
        <h1 className="mb-8 text-4xl font-bold tracking-widest [text-shadow:_0_2px_8px_rgb(0_0_0_/_85%)]">
          랭킹
        </h1>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTab("cumulative")}
            className={`rounded px-5 py-2 text-sm transition ${
              tab === "cumulative"
                ? "bg-white font-bold text-black"
                : "border border-white/30 hover:bg-white/10"
            }`}
          >
            누적점수
          </button>
          <button
            onClick={() => setTab("theme")}
            className={`rounded px-5 py-2 text-sm transition ${
              tab === "theme"
                ? "bg-white font-bold text-black"
                : "border border-white/30 hover:bg-white/10"
            }`}
          >
            테마별 랭킹
          </button>
        </div>

        <div className="w-full max-w-md">
          {tab === "cumulative" && <RankList entries={cumulative} />}

          {tab === "theme" && (
            <div className="flex flex-col gap-4">
              <select
                value={bundleId}
                onChange={(e) => setBundleId(e.target.value)}
                className="rounded border border-white/30 bg-white/10 px-3 py-2 text-white outline-none focus:border-white"
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

        <div className="mt-10">
          <GameButton size="md" href="/">
            ← 메인으로
          </GameButton>
        </div>
      </div>
    </main>
  );
}

function RankList({ entries }: { entries: RankEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded border border-white/10 py-8 text-center text-sm opacity-50">
        기록 없음
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-1">
      {entries.map((e, i) => (
        <li
          key={`${e.nickname}-${i}`}
          className={`flex items-center justify-between rounded px-4 py-3 ${
            e.isMe
              ? "border border-yellow-400/60 bg-yellow-400/15"
              : "bg-white/5"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-10 opacity-50">#{i + 1}</span>
            <span
              className={e.isMe ? "font-bold text-yellow-200" : "text-white/90"}
            >
              {e.nickname}
            </span>
            {e.isMe && (
              <span className="rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-black">
                ME
              </span>
            )}
          </div>
          <span
            className={e.isMe ? "font-bold text-yellow-200" : "text-white/80"}
          >
            {e.score.toLocaleString()}
          </span>
        </li>
      ))}
    </ol>
  );
}
