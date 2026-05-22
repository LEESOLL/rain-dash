"use client";

import Link from "next/link";
import type { Bundle, StageProgress } from "../types";

const STAGES_PER_THEME = 3;
const PAD_TOP = 60;
// 맨 위 번들 박스(BOX_TOP_PAD만큼 위로 확장)가 잘리지 않게 상단 여백 확보
const PAD_BOTTOM = 165;
const INTRA_GAP = 80;
const INTER_GAP = 140;
// 박스 상단 라벨 공간(맨 위 노드 위로 확보) — 모든 번들 통일
const BOX_TOP_PAD = 145;
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
    d += ` L ${positions[i].x * 100} ${positions[i].yPx}`;
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

  return (
    <div className="relative w-full" style={{ height: totalHeight }}>
      {bundles.map((bundle, themeIdx) => {
        const firstIdx = themeIdx * STAGES_PER_THEME;
        const lastIdx = firstIdx + STAGES_PER_THEME - 1;
        const topY = positions[lastIdx].yPx;
        const bottomY = positions[firstIdx].yPx;
        const isComingSoon = bundle.status === "coming-soon";
        // 라벨 묶음을 박스의 자식으로 — 박스 좌상단 기준으로 항상 박스 안에 위치
        return (
          <div
            key={`band-${bundle.id}`}
            className="stage-band"
            style={{
              top: topY - BOX_TOP_PAD,
              height: bottomY - topY + BOX_TOP_PAD + 50,
            }}
          >
            <div className="stage-label-group">
              {isComingSoon && <span className="stage-tag">COMING SOON</span>}
              <span className="stage-label">{bundle.name}</span>
            </div>
          </div>
        );
      })}

      <svg
        className="absolute inset-0 z-[1] h-full w-full"
        viewBox={`0 0 100 ${totalHeight}`}
        preserveAspectRatio="none"
      >
        <path
          d={pathFull}
          fill="none"
          stroke="rgba(255,255,255,0.92)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="0.1 18"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

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

        const cls = `stage-node stage-node--${status}`;
        const style = { left: `${pos.x * 100}%`, top: `${pos.yPx}px` };
        const clickable =
          (status === "cleared" || status === "current") && stageId;

        if (clickable) {
          return (
            <Link
              key={globalIdx}
              href={`/play/${stageId}`}
              data-stage-status={status}
              className={cls}
              style={style}
            >
              {stageIdx + 1}
            </Link>
          );
        }
        return (
          <div
            key={globalIdx}
            data-stage-status={status}
            className={cls}
            style={style}
          >
            {stageIdx + 1}
          </div>
        );
      })}
    </div>
  );
}
