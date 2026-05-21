import { clearMyRanking } from "@/features/ranking/rankingRepository";
import { clearProgress } from "@/features/stage/stageProgressRepository";
import { getData, removeData, setData } from "@/lib/storage";
import type { Settings } from "./types";

const KEY = "rd:settings";

const DEFAULT: Settings = { soundEnabled: true };

export function getSettings(): Settings {
  return getData<Settings>(KEY, DEFAULT);
}

export function setSoundEnabled(enabled: boolean): void {
  const current = getSettings();
  setData(KEY, { ...current, soundEnabled: enabled });
}

export function resetAllData(): void {
  removeData("rd:user");
  removeData("rd:settings");
  removeData("rd:audio");
  clearProgress().catch((e) => console.error("progress reset failed", e));
  clearMyRanking().catch((e) => console.error("ranking reset failed", e));
}
