"use client";

import Link from "next/link";
import { Fragment } from "react";
import type { Bundle, StageProgress } from "../types";

const STAGES_PER_THEME = 3;
const PAD_TOP = 60;
const PAD_BOTTOM = 40;
const INTRA_GAP = 80;
const INTER_GAP = 40;
const X_CENTER = 0.5;
const X_AMP = 0.34;

type Position = { x: number; yPx: number };

// 인덱스 기반 의사난수 (0~1) — 매번 같은 불규칙 배치
function hashRand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function computeLayout(themeCount: number): {
  positions: Position[];
  totalHeight: number;
} {
  const themeBlockHeight = STAGES_PER_THEME * INTRA_GAP + INTER_GAP;
  const maxOriginalY =
    PAD_TOP +
    (themeCount - 1) * themeBlockHeight +
    (STAGES_PER_THEME - 1) * INTRA_GAP;
  const totalHeight = maxOriginalY + PAD_BOTTOM;

  const positions: Position[] = [];
  for (let t = 0; t < themeCount; t++) {
    for (let s = 0; s < STAGES_PER_THEME; s++) {
      const globalIdx = t * STAGES_PER_THEME + s;
      const originalY = PAD_TOP + t * themeBlockHeight + s * INTRA_GAP;
      const yPx = totalHeight - originalY;
      const x = X_CENTER + (hashRand(globalIdx) - 0.5) * 2 * X_AMP;
      positions.push({ x, yPx });
    }
  }
  return { positions, totalHeight };
}

function buildPath(positions: Position[]): string {
  if (positions.length < 2) return "";
  let d = `M ${positions[0].x * 100} ${positions[0].yPx}`;
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const cp1x = prev.x + (curr.x - prev.x) * 0.5;
    const cp1y = prev.yPx;
    const cp2x = prev.x + (curr.x - prev.x) * 0.5;
    const cp2y = curr.yPx;
    d += ` C ${cp1x * 100} ${cp1y}, ${cp2x * 100} ${cp2y}, ${curr.x * 100} ${curr.yPx}`;
  }
  return d;
}

type StageStatus = "cleared" | "current" | "locked" | "placeholder";

type Props = {
  bundles: Bundle[];
  progress: StageProgress;
};

export function StageMap({ bundles, progress }: Props) {
  const { positions, totalHeight } = computeLayout(bundles.length);

  let lastClearedGlobalIdx = -1;
  let firstUnclearedGlobalIdx = -1;
  bundles.forEach((bundle, themeIdx) => {
    bundle.stageIds.forEach((stageId, stageIdx) => {
      if (stageIdx >= STAGES_PER_THEME) return;
      const globalIdx = themeIdx * STAGES_PER_THEME + stageIdx;
      if (progress.clearedStageIds.includes(stageId)) {
        lastClearedGlobalIdx = Math.max(lastClearedGlobalIdx, globalIdx);
      } else if (firstUnclearedGlobalIdx === -1) {
        firstUnclearedGlobalIdx = globalIdx;
      }
    });
  });

  const pathFull = buildPath(positions);
  const pathActive =
    lastClearedGlobalIdx >= 1
      ? buildPath(positions.slice(0, lastClearedGlobalIdx + 1))
      : "";

  return (
    <div className="relative w-full" style={{ height: totalHeight }}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 100 ${totalHeight}`}
        preserveAspectRatio="none"
      >
        <path
          d={pathFull}
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="0.1 14"
          vectorEffect="non-scaling-stroke"
        />
        {pathActive && (
          <path
            d={pathActive}
            fill="none"
            stroke="rgb(94 201 226)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="0.1 14"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {bundles.map((bundle, themeIdx) => {
        const firstIdx = themeIdx * STAGES_PER_THEME;
        const lastIdx = firstIdx + STAGES_PER_THEME - 1;
        // flipped: lastIdx is now topmost (smallest y), firstIdx is bottommost
        const topY = positions[lastIdx].yPx;
        const bottomY = positions[firstIdx].yPx;
        const midY = (topY + bottomY) / 2;
        const isComingSoon = bundle.status === "coming-soon";

        return (
          <Fragment key={bundle.id}>
            <div
              className="absolute left-0 right-0 text-center"
              style={{ top: topY - 38 }}
            >
              <h3
                className={`text-xs tracking-[0.3em] ${isComingSoon ? "opacity-30" : "opacity-60"}`}
              >
                {bundle.name}
              </h3>
            </div>

            {isComingSoon && (
              <div
                className="pointer-events-none absolute left-1/2 -translate-x-1/2"
                style={{ top: midY - 14 }}
              >
                <div className="rounded bg-black/70 px-3 py-1 text-[10px] tracking-widest text-zinc-400 backdrop-blur-sm">
                  COMING SOON
                </div>
              </div>
            )}
          </Fragment>
        );
      })}

      {positions.map((pos, globalIdx) => {
        const themeIdx = Math.floor(globalIdx / STAGES_PER_THEME);
        const stageIdx = globalIdx % STAGES_PER_THEME;
        const bundle = bundles[themeIdx];
        const stageId = bundle.stageIds[stageIdx];

        let status: StageStatus;
        if (bundle.status === "coming-soon" || !stageId) {
          status = "placeholder";
        } else if (progress.clearedStageIds.includes(stageId)) {
          status = "cleared";
        } else if (globalIdx === firstUnclearedGlobalIdx) {
          status = "current";
        } else {
          status = "locked";
        }

        return (
          <div
            key={globalIdx}
            data-stage-status={status}
            className="absolute"
            style={{
              left: `${pos.x * 100}%`,
              top: `${pos.yPx}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <StageCircle
              stageId={stageId}
              index={stageIdx + 1}
              status={status}
            />
          </div>
        );
      })}
    </div>
  );
}

function StageCircle({
  stageId,
  index,
  status,
}: {
  stageId: string | undefined;
  index: number;
  status: StageStatus;
}) {
  const base =
    "relative flex h-14 w-14 items-center justify-center bg-contain bg-center bg-no-repeat text-base font-bold [image-rendering:pixelated]";
  const isBright = status === "current" || status === "cleared";
  const textColor = isBright
    ? "text-black/75 [text-shadow:_0_1px_0_rgb(255_255_255_/_35%)]"
    : "text-white/45";
  const label = <span className="relative z-10">{index}</span>;
  const style = { backgroundImage: `url(/sprites/nodes/${status}.png)` };

  if (status === "placeholder") {
    return (
      <div className={`${base} ${textColor}`} style={style}>
        {label}
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className={`${base} ${textColor} cursor-not-allowed`} style={style}>
        {label}
      </div>
    );
  }

  if (status === "cleared") {
    return (
      <Link
        href={`/play/${stageId}`}
        className={`${base} ${textColor} transition hover:brightness-110`}
        style={style}
      >
        {label}
      </Link>
    );
  }

  // current
  return (
    <Link
      href={`/play/${stageId}`}
      className={`${base} ${textColor} animate-pulse transition hover:brightness-110`}
      style={style}
    >
      {label}
    </Link>
  );
}
