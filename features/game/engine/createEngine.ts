import type { Engine, EngineConfig, GameState, Input } from "./types";
import {
  AUTO_SCROLL_SPEED,
  GROUND_Y,
  MAX_JUMPS,
  PLAYER_GRAVITY,
  PLAYER_HEIGHT,
  PLAYER_JUMP_VEL,
  PLAYER_SCREEN_LIMIT_RATIO,
  PLAYER_SPEED,
  PLAYER_WIDTH,
  RAIN_STREAK_LENGTH,
  RAIN_VX,
  RAIN_VY,
  STILL_TIME_SCALE,
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
      jumpsLeft: MAX_JUMPS,
      facing: 1,
      cam: 0,
      realT: 0,
      drops: [],
      status: "playing",
    };
  }

  const state: GameState = initialState();

  let raf: number | null = null;
  let lastT = 0;
  let prevJump = false;
  let spawnAcc = 0;

  function getTimeScale(): number {
    return input.left || input.right ? 1 : STILL_TIME_SCALE;
  }

  function step(dt: number) {
    if (input.jump && !prevJump && state.jumpsLeft > 0) {
      state.vy = PLAYER_JUMP_VEL;
      state.onGround = false;
      state.jumpsLeft--;
    }
    prevJump = input.jump;

    if (!state.onGround) {
      state.vy -= PLAYER_GRAVITY * dt;
      state.py += state.vy * dt;
      if (state.py <= 0) {
        state.py = 0;
        state.vy = 0;
        state.onGround = true;
        state.jumpsLeft = MAX_JUMPS;
      }
    }

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

    const ts = getTimeScale();

    spawnAcc += dt * ts * stage.rainRate;
    while (spawnAcc >= 1) {
      spawnAcc -= 1;
      const spawnX = state.cam - 40 + Math.random() * (VIEWPORT_WIDTH + 160);
      state.drops.push({ x: spawnX, y: -40 });
    }

    for (let i = state.drops.length - 1; i >= 0; i--) {
      const d = state.drops[i];
      d.x += RAIN_VX * dt * ts;
      d.y += RAIN_VY * dt * ts;
      if (d.y > GROUND_Y + 20) {
        state.drops.splice(i, 1);
      }
    }

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

    for (const p of stage.puddles) {
      const sx = p.x - state.cam;
      if (sx + p.width < 0 || sx > W) continue;
      ctx!.fillStyle = "#3a6fa8";
      ctx!.fillRect(sx, GROUND_Y - 3, p.width, 8);
      ctx!.fillStyle = "rgba(180,210,255,0.4)";
      ctx!.fillRect(sx, GROUND_Y - 3, p.width, 2);
    }

    const ts = getTimeScale();
    const playerVxRaw = input.right && !input.left ? PLAYER_SPEED : 0;
    const appVx = RAIN_VX - playerVxRaw;
    const appVy = RAIN_VY;
    const mag = Math.sqrt(appVx * appVx + appVy * appVy);
    const sdx = (appVx / mag) * RAIN_STREAK_LENGTH;
    const sdy = (appVy / mag) * RAIN_STREAK_LENGTH;
    ctx!.strokeStyle = "rgba(190,210,245,0.78)";
    ctx!.lineWidth = 1.4;
    ctx!.beginPath();
    for (const d of state.drops) {
      const sx = d.x - state.cam;
      if (sx < -30 || sx > W + 30) continue;
      ctx!.moveTo(sx, d.y);
      ctx!.lineTo(sx - sdx, d.y - sdy);
    }
    ctx!.stroke();

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
    ctx!.fillText(`stage: ${stage.name}  ts: ${ts.toFixed(2)}`, 24, 44);
    ctx!.fillText(
      `px:${state.px.toFixed(0)} py:${state.py.toFixed(0)} vy:${state.vy.toFixed(0)} jumps:${state.jumpsLeft}`,
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
