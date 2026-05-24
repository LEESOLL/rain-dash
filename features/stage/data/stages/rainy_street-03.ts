import type { Stage } from "../../types";

// 3단계 — 보통: 번개 보통, 비 강함, 긴 웅덩이 2개
export const rainyStreet03: Stage = {
  id: "rainy_street-03",
  bundleId: "rainy_street",
  name: "비 오는 거리 — 3",
  difficulty: "medium",
  goalDistance: 10000,
  shelters: [
    { x: 300, variant: "busStop" },
    { x: 1900, variant: "awning" },
    { x: 3500, variant: "phoneBooth" },
    { x: 5100, variant: "busStop" },
    { x: 6700, variant: "awning" },
    { x: 8500, variant: "phoneBooth" },
  ],
  puddles: [
    { x: 900, size: "short" },
    { x: 2600, size: "long" },
    { x: 4300, size: "short" },
    { x: 6100, size: "long" },
    { x: 8000, size: "short" },
  ],
  items: [
    { x: 700, y: 85, type: "heart" },
    { x: 2200, y: 105, type: "umbrella" },
    { x: 4000, y: 65, type: "boots" },
    { x: 5500, y: 75, type: "heart" },
    { x: 7000, y: 95, type: "raincoat" },
    { x: 8800, y: 85, type: "heart" },
  ],
  rainRate: 8,
  lightning: { gap: { min: 5, max: 9 }, warnSec: 1.2 },
};
