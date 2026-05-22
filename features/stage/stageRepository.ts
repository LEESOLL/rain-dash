import { BUNDLES } from "./data/bundles";
import { rainyDay01 } from "./data/stages/rainy-day-01";
import { rainyDay02 } from "./data/stages/rainy-day-02";
import { rainyDay03 } from "./data/stages/rainy-day-03";
import type { Bundle, Stage } from "./types";

const STAGES: Stage[] = [rainyDay01, rainyDay02, rainyDay03];

export function getBundles(): Bundle[] {
  return BUNDLES;
}

export function getBundle(bundleId: string): Bundle | null {
  return BUNDLES.find((b) => b.id === bundleId) ?? null;
}

export function getStage(stageId: string): Stage | null {
  return STAGES.find((s) => s.id === stageId) ?? null;
}

// 진입 가능 여부 — 클리어했거나, 직전까지 모두 클리어한 다음 차례 스테이지만 허용
export function isStageUnlocked(
  stageId: string,
  clearedStageIds: string[],
): boolean {
  const order: string[] = [];
  for (const b of BUNDLES) {
    if (b.status !== "available") continue;
    for (const sid of b.stageIds) order.push(sid);
  }
  const idx = order.indexOf(stageId);
  if (idx === -1) return false;
  if (clearedStageIds.includes(stageId)) return true;
  for (let i = 0; i < idx; i++) {
    if (!clearedStageIds.includes(order[i])) return false;
  }
  return true;
}

export function getNextStageId(stage: Stage): string | null {
  const bundle = getBundle(stage.bundleId);
  if (!bundle) return null;
  const idx = bundle.stageIds.indexOf(stage.id);
  if (idx === -1 || idx + 1 >= bundle.stageIds.length) return null;
  return bundle.stageIds[idx + 1];
}
