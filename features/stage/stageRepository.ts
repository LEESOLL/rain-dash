import { BUNDLES } from "./data/bundles";
import { rainyDay01 } from "./data/stages/rainy-day-01";
import type { Bundle, Stage } from "./types";

const STAGES: Stage[] = [
  rainyDay01,
];

export function getBundles(): Bundle[] {
  return BUNDLES;
}

export function getBundle(bundleId: string): Bundle | null {
  return BUNDLES.find((b) => b.id === bundleId) ?? null;
}

export function getStage(stageId: string): Stage | null {
  return STAGES.find((s) => s.id === stageId) ?? null;
}
