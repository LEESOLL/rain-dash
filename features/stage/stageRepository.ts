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

export function getNextStageId(stage: Stage): string | null {
  const bundle = getBundle(stage.bundleId);
  if (!bundle) return null;
  const idx = bundle.stageIds.indexOf(stage.id);
  if (idx === -1 || idx + 1 >= bundle.stageIds.length) return null;
  return bundle.stageIds[idx + 1];
}
