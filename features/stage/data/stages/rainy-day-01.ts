import type { Stage } from "../../types";

export const rainyDay01: Stage = {
  id: "rainy-day-01",
  bundleId: "rainy-day",
  name: "비 오는 낮 거리 — 1",
  difficulty: "easy",
  goalDistance: 1600,
  shelters: [
    { x: 200, variant: "busStop" },
    { x: 650, variant: "awning" },
    { x: 1150, variant: "phoneBooth" },
  ],
  puddles: [
    { x: 420, width: 60 },
    { x: 1320, width: 70 },
  ],
  items: [
    { x: 350, y: 0, type: "heart" },
    { x: 800, y: 60, type: "umbrella" },
    { x: 1450, y: 0, type: "boots" },
  ],
  rainRate: 8,
  lightningGap: null,
};
