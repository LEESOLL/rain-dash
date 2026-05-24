import type { Stage } from "../../types";

// 2단계 — 쉬움: 번개 드물게(느슨한 경고), 비 보통, 긴 웅덩이 1개 등장
export const rainyStreet02: Stage = {
  id: "rainy_street-02",
  bundleId: "rainy_street",
  name: "비 오는 거리 — 2",
  difficulty: "easy",
  goalDistance: 9000,
  shelters: [
    { x: 400, variant: "busStop" },
    { x: 2000, variant: "awning" },
    { x: 3600, variant: "phoneBooth" },
    { x: 5200, variant: "busStop" },
    { x: 6800, variant: "awning" },
    { x: 8200, variant: "phoneBooth" },
  ],
  puddles: [
    { x: 1200, size: "short" },
    { x: 3200, size: "long" },
    { x: 5400, size: "short" },
    { x: 7400, size: "short" },
  ],
  items: [
    { x: 700, y: 75, type: "heart" },
    { x: 2400, y: 95, type: "umbrella" },
    { x: 3900, y: 65, type: "boots" },
    { x: 5700, y: 85, type: "heart" },
    { x: 7100, y: 85, type: "raincoat" },
    { x: 8000, y: 75, type: "heart" },
  ],
  rainRate: 5,
  lightning: { gap: { min: 7, max: 11 }, warnSec: 1.4 },
};
