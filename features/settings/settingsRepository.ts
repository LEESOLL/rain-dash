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
  removeData("rd:progress");
  removeData("rd:settings");
  removeData("rd:audio");
}
