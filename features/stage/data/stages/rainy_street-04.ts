import type { Stage } from "../../types";

// 4단계 — 어려움: 번개 잦고 경고 짧음, 비 거셈, 긴 웅덩이 3개, 쉘터 간격 넓음
export const rainyStreet04: Stage = {
  id: "rainy_street-04",
  bundleId: "rainy_street",
  name: "비 오는 거리 — 4",
  difficulty: "hard",
  goalDistance: 11000,
  shelters: [
    { x: 500, variant: "busStop" },
    { x: 2500, variant: "awning" },
    { x: 4500, variant: "phoneBooth" },
    { x: 6500, variant: "busStop" },
    { x: 8500, variant: "awning" },
    { x: 10200, variant: "phoneBooth" },
  ],
  puddles: [
    { x: 800, size: "long" },
    { x: 2200, size: "short" },
    { x: 3600, size: "long" },
    { x: 5200, size: "short" },
    { x: 6900, size: "long" },
    { x: 9000, size: "short" },
  ],
  items: [
    { x: 700, y: 95, type: "heart" },
    { x: 2900, y: 75, type: "umbrella" },
    { x: 4300, y: 105, type: "boots" },
    { x: 6100, y: 95, type: "raincoat" },
    { x: 8000, y: 85, type: "heart" },
    { x: 10600, y: 75, type: "heart" },
  ],
  rainRate: 11,
  lightning: { gap: { min: 3, max: 6 }, warnSec: 1.0 },
};
