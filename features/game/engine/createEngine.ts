import type { Engine, EngineConfig, GameState, Input } from "./types";
import {
  AUTO_SCROLL_SPEED,
  GROUND_Y,
  PLAYER_HEIGHT,
  PLAYER_SCREEN_LIMIT_RATIO,
  PLAYER_SPEED,
  PLAYER_WIDTH,
  VIEWPORT_WIDTH,
} from "./tuning";

export function createEngine(config: EngineConfig): Engine {
  const { canvas, stage, onStateChange } = config;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context를 가져올 수 없어요");
  }

  const input: Input = { left: false, right: false, jump: false };

  function initialState(): GameState {
    return {
      px: 30,
      py: 0,
      vy: 0,
      onGround: true,
      facing: 1,
      cam: 0,
      realT: 0,
      status: "playing",
    };
  }

  const state: GameState = initialState();

  let raf: number | null = null;
  let lastT = 0;

  function step(dt: number) {
    let vx = 0;
    if (input.right && !input.left) {
      vx = PLAYER_SPEED;
      state.facing = 1;
    } else if (input.left && !input.right) {
      vx = -PLAYER_SPEED;
      state.facing = -1;
    }

    state.cam += AUTO_SCROLL_SPEED * dt;
    state.px += vx * dt;

    const desiredCam = state.px - VIEWPORT_WIDTH * PLAYER_SCREEN_LIMIT_RATIO;
    if (desiredCam > state.cam) state.cam = desiredCam;

    if (state.px < state.cam) state.px = state.cam;
    if (state.px < 0) state.px = 0;

    state.realT += dt;
  }

  function draw() {
    const W = canvas.width;
    const H = canvas.height;

    ctx!.fillStyle = "#0d0d18";
    ctx!.fillRect(0, 0, W, H);

    ctx!.fillStyle = "#3a2f24";
    ctx!.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx!.fillStyle = "#5d4f3e";
    ctx!.fillRect(0, GROUND_Y, W, 3);

    const screenX = state.px - state.cam;
    const playerTop = GROUND_Y - state.py - PLAYER_HEIGHT;
    ctx!.fillStyle = "#fff";
    ctx!.fillRect(
      screenX - PLAYER_WIDTH / 2,
      playerTop,
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
    );

    ctx!.fillStyle = "#888";
    ctx!.font = "22px monospace";
    ctx!.fillText(`stage: ${stage.name}`, 24, 44);
    ctx!.fillText(
      `px: ${state.px.toFixed(0)}  cam: ${state.cam.toFixed(0)}`,
      24,
      72,
    );
  }

  function loop(now: number) {
    if (raf === null) return;
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    step(dt);
    draw();
    onStateChange?.(state);

    raf = requestAnimationFrame(loop);
  }

  return {
    start() {
      if (raf !== null) return;
      lastT = performance.now();
      raf = requestAnimationFrame(loop);
    },
    stop() {
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    },
    setInput(partial: Partial<Input>) {
      Object.assign(input, partial);
    },
    getState() {
      return state;
    },
  };
}
