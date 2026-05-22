"use client";

import Link from "next/link";
import type { Bundle, StageProgress } from "../types";

const PAD_TOP = 60;
// 맨 위 번들 박스(BOX_TOP_PAD만큼 위로 확장)가 잘리지 않게 상단 여백 확보
const PAD_BOTTOM = 165;
const INTRA_GAP = 80;
const INTER_GAP = 140;
// 박스 상단 라벨 공간(맨 위 노드 위로 확보) — 모든 번들 통일
const BOX_TOP_PAD = 145;
const X_CENTER = 0.5;
const X_AMP = 0.34;

type Position = {
  x: number;
  yPx: number;
  bundleIdx: number;
  stageIdx: number;
};

// 인덱스 기반 의사난수 (0~1) — 매번 같은 불규칙 배치
function hashRand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// 번들별 스테이지 개수가 다를 수 있어 누적 배치 (아래→위, 첫 번들이 맨 아래)
function computeLayout(counts: number[]): {
  positions: Position[];
  totalHeight: number;
} {
  const meta: { bundleIdx: number; stageIdx: number; oy: number }[] = [];
  let oy = PAD_TOP;
  counts.forEach((cnt, bi) => {
    // 번들 사이 간격 — 박스가 위/아래로 커서 충분히 벌려야 겹치지 않음
    if (bi > 0) oy += INTER_GAP + INTRA_GAP;
    for (let s = 0; s < cnt; s++) {
      meta.push({ bundleIdx: bi, stageIdx: s, oy });
      if (s < cnt - 1) oy += INTRA_GAP;
    }
  });
  const maxOriginalY = meta.length > 0 ? meta[meta.length - 1].oy : PAD_TOP;
  const totalHeight = maxOriginalY + PAD_BOTTOM;
  const lastBundle = counts.length - 1;

  const positions = meta.map((m, gi) => {
    let x: number;
    if (m.bundleIdx === lastBundle) {
      // 우주(마지막 번들): 아래→위로 갈수록 왼쪽으로 극적으로 펼침 + 약간 랜덤
      const raw = 0.78 - m.stageIdx * 0.28 + (hashRand(gi) - 0.5) * 0.18;
      x = Math.max(0.12, Math.min(0.88, raw));
    } else {
      x = X_CENTER + (hashRand(gi) - 0.5) * 2 * X_AMP;
    }
    return {
      x,
      yPx: totalHeight - m.oy,
      bundleIdx: m.bundleIdx,
      stageIdx: m.stageIdx,
    };
  });
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
  const counts = bundles.map((b) => Math.max(1, b.stageIds.length));
  const { positions, totalHeight } = computeLayout(counts);

  // 첫 번째 미클리어 스테이지(현재 차례) — available 번들만
  let firstUnclearedGlobalIdx = -1;
  positions.forEach((pos, gi) => {
    if (firstUnclearedGlobalIdx !== -1) return;
    const bundle = bundles[pos.bundleIdx];
    if (bundle.status !== "available") return;
    const stageId = bundle.stageIds[pos.stageIdx];
    if (stageId && !progress.clearedStageIds.includes(stageId)) {
      firstUnclearedGlobalIdx = gi;
    }
  });

  const pathFull = buildPath(positions);

  return (
    <div className="relative w-full" style={{ height: totalHeight }}>
      {bundles.map((bundle, bi) => {
        const range = positions.filter((p) => p.bundleIdx === bi);
        if (range.length === 0) return null;
        const topY = range[range.length - 1].yPx;
        const bottomY = range[0].yPx;
        const isComingSoon = bundle.status === "coming-soon";
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

      {positions.map((pos, gi) => {
        const bundle = bundles[pos.bundleIdx];
        const stageId = bundle.stageIds[pos.stageIdx];

        let status: StageStatus;
        if (bundle.status === "coming-soon" || !stageId) {
          status = "placeholder";
        } else if (progress.clearedStageIds.includes(stageId)) {
          status = "cleared";
        } else if (gi === firstUnclearedGlobalIdx) {
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
              key={gi}
              href={`/play/${stageId}`}
              data-stage-status={status}
              className={cls}
              style={style}
            >
              {pos.stageIdx + 1}
            </Link>
          );
        }
        return (
          <div
            key={gi}
            data-stage-status={status}
            className={cls}
            style={style}
          >
            {pos.stageIdx + 1}
          </div>
        );
      })}
    </div>
  );
}
