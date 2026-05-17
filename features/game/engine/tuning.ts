export const VIEWPORT_WIDTH = 1280;
export const VIEWPORT_HEIGHT = 720;
export const GROUND_Y = 576;

export const PLAYER_SPEED = 230;
export const PLAYER_GRAVITY = 1700;
export const PLAYER_JUMP_VEL = 640;
export const MAX_JUMPS = 2;

export const PLAYER_WIDTH = 26;
export const PLAYER_HEIGHT = 40;

export const STILL_TIME_SCALE = 0.1;

export const AUTO_SCROLL_SPEED = 55;
export const PLAYER_SCREEN_LIMIT_RATIO = 0.5;

export const RAIN_VX = -90;
export const RAIN_VY = 540;
export const RAIN_STREAK_LENGTH = 30;

export const MAX_LIVES = 3;
export const IFRAME_DURATION = 1.0;

export const LIGHTNING_WIDTH = 50;
export const LIGHTNING_WARN_DURATION = 1.2;
export const LIGHTNING_STRIKE_DURATION = 0.15;
export const LIGHTNING_LINGER_DURATION = 0.5;
export const LIGHTNING_SPAWN_MARGIN = 100;
export const LIGHTNING_PLAYER_BIAS_RADIUS = 280;

export const ITEM_SIZE = 22;
export const ITEM_DURATION = 3;
export const ITEM_BLINK_THRESHOLD = 1;

export const ITEM_SCORE: Record<
  "heart" | "umbrella" | "boots" | "raincoat",
  number
> = {
  heart: 200,
  umbrella: 100,
  boots: 100,
  raincoat: 150,
};

export const SCORE_POPUP_DURATION = 1.0;
export const SCORE_POPUP_RISE = 40;

/** 거리 1px당 누적되는 점수. 낮출수록 점수 증가 속도 느려짐 */
export const DISTANCE_SCORE_RATE = 0.5;

/** 시간 스케일(ts)에 따른 거리 점수 배수 — ts가 STILL일 때 MIN, 1.0일 때 MAX */
export const SPEED_MULT_MIN = 1.0;
export const SPEED_MULT_MAX = 5.0;

/** 엔드 보너스 — 빨리 깬 1초당 점수 (멈춤만 했을 때 시간 대비 단축 시간) */
export const TIME_BONUS_PER_SEC = 30;

/** 엔드 보너스 — 남은 하트 1개당 점수 */
export const HEART_BONUS = 500;
