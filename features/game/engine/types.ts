import type { Stage } from "@/features/stage/types";

export type Input = {
  left: boolean;
  right: boolean;
  jump: boolean;
};

export type GameStatus = "playing" | "won" | "dead";

export type GameState = {
  /** 플레이어 월드 X (오른쪽으로 증가) */
  px: number;
  /** 지면 위 높이 (0 = 지면, 양수 = 공중) */
  py: number;
  /** 수직 속도 — 점프·중력으로 갱신 */
  vy: number;
  /** 지면 위에 있나 */
  onGround: boolean;
  /** 남은 점프 횟수 — 착지 시 MAX_JUMPS로 리셋, 점프 시 -1 */
  jumpsLeft: number;
  /** 바라보는 방향 (1 = 오른쪽, -1 = 왼쪽) */
  facing: 1 | -1;

  /** 카메라 왼쪽 끝의 월드 X */
  cam: number;

  /** 게임 시작 후 실제 경과 시간 (초) */
  realT: number;

  /** 진행 / 승리 / 사망 */
  status: GameStatus;
};

export type EngineConfig = {
  canvas: HTMLCanvasElement;
  stage: Stage;
  onStateChange?: (state: GameState) => void;
};

export type Engine = {
  start: () => void;
  stop: () => void;
  setInput: (partial: Partial<Input>) => void;
  getState: () => GameState;
};
