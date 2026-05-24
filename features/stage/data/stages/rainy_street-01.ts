import type { Stage } from "../../types";

// 1단계 — 매우 쉬움: 번개 없음, 비 약함, 쉘터 촘촘, 웅덩이 적고 모두 짧음, 하트 넉넉
export const rainyStreet01: Stage = {
  id: "rainy_street-01",
  bundleId: "rainy_street",
  name: "비 오는 거리 — 1",
  difficulty: "easy",
  goalDistance: 8000,
  shelters: [
    { x: 300, variant: "busStop" },
    { x: 1600, variant: "awning" },
    { x: 3000, variant: "phoneBooth" },
    { x: 4400, variant: "busStop" },
    { x: 5800, variant: "awning" },
    { x: 7000, variant: "phoneBooth" },
  ],
  puddles: [
    { x: 1100, size: "short" },
    { x: 3600, size: "short" },
    { x: 6200, size: "short" },
  ],
  items: [
    { x: 600, y: 75, type: "heart" },
    { x: 2000, y: 65, type: "umbrella" },
    { x: 2500, y: 95, type: "heart" },
    { x: 4000, y: 70, type: "boots" },
    { x: 5000, y: 75, type: "heart" },
    { x: 6600, y: 90, type: "raincoat" },
    { x: 7400, y: 80, type: "heart" },
  ],
  rainRate: 4,
  lightning: null,
};
