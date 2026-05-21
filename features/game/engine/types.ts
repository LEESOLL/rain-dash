import type { Item, Puddle, Stage } from "@/features/stage/types";

export type Input = {
  left: boolean;
  right: boolean;
  jump: boolean;
};

export type GameStatus = "playing" | "won" | "dead";

/** 빗방울 (월드 X, 화면 Y) */
export type Drop = {
  /** 월드 X (cam과 같은 좌표계) */
  x: number;
  /** 화면 Y — 0이 상단, GROUND_Y가 지면 */
  y: number;
};

/** 아이템 픽업 시 위로 떠오르는 점수 텍스트 */
export type ScorePopup = {
  /** 월드 X (spawn 시점의 아이템 중심) */
  x: number;
  /** 캔버스 Y (spawn 시점의 시작 높이) */
  y: number;
  /** 표시할 점수 (양수) */
  value: number;
  /** 남은 lifetime (실시간 초) */
  t: number;
};

export type LightningPhase = "warn" | "strike" | "linger";

/** 번개 이벤트 — warn → strike → linger 순으로 진행 */
export type Lightning = {
  /** 월드 X (낙뢰 중심) */
  x: number;
  phase: LightningPhase;
  /** 현재 phase 남은 시간. warn은 실시간(1.2초 고정), strike/linger는 게임 시간(ts 영향) */
  t: number;
};

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

  /** 현재 화면에 있는 빗방울들 */
  drops: Drop[];

  /** 진행 중인 번개 이벤트들 */
  lightnings: Lightning[];

  /** 다음 번개 스폰까지 남은 시간 (실시간 초) — stage.lightning이 null이면 사용 안 함 */
  nextStrikeT: number;

  /** 누적 점수 — 거리 + 아이템 픽업으로 게임 중 실시간 증가 */
  score: number;

  /** 진행 중인 점수 팝업 (아이템 픽업 시 +N 떠오름) */
  scorePopups: ScorePopup[];

  /** 이 스테이지의 베스트 점수 (게임 시작 시 로드, won 시점에 갱신) */
  bestScore: number;

  /** 이번 클리어가 새 베스트인지 (won 시점에 결정) */
  isNewBest: boolean;

  /** 시간 보너스 (won 시점에 확정 — draw 재계산 방지) */
  timeBonus: number;

  /** 하트 보너스 (won 시점에 확정 — draw 재계산 방지) */
  heartBonus: number;

  /** 남은 라이프 — 0이 되면 status가 dead로 전환 */
  lives: number;

  /** 무적 잔여 시간 (초) — 피격 직후 짧게 지속 */
  iframeT: number;

  /** 스테이지에 남아 있는 아이템 (픽업 시 splice) */
  items: Item[];

  /** 물웅덩이 (게임 시작 시 생성, shelter 회피) */
  puddles: Puddle[];

  /** 우산 잔여 시간 (실시간 초) — > 0 이면 비 데미지 자동 방어 */
  umbrellaT: number;

  /** 장화 잔여 시간 (실시간 초) — > 0 이면 물웅덩이 데미지 자동 방어 */
  bootsT: number;

  /** 우비 잔여 시간 (실시간 초) — > 0 이면 비/물웅덩이 모두 방어 */
  raincoatT: number;

  /** 진행 / 승리 / 사망 */
  status: GameStatus;
};

export type EngineConfig = {
  canvas: HTMLCanvasElement;
  stage: Stage;
  onStateChange?: (state: GameState) => void;
  /** 모든 에셋 로딩이 끝나 첫 렌더가 가능해진 시점에 1회 호출 */
  onReady?: () => void;
};

export type Engine = {
  start: () => void;
  stop: () => void;
  setInput: (partial: Partial<Input>) => void;
  getState: () => GameState;
  restart: () => void;
  setPaused: (paused: boolean) => void;
};
