import type { Item, Shelter } from "@/features/stage/types";
import type { Engine, EngineConfig, GameState, Input } from "./types";
import {
  AUTO_SCROLL_SPEED,
  DISTANCE_SCORE_RATE,
  GROUND_Y,
  IFRAME_DURATION,
  ITEM_BLINK_THRESHOLD,
  ITEM_DURATION,
  ITEM_SCORE,
  ITEM_SIZE,
  LIGHTNING_LINGER_DURATION,
  LIGHTNING_PLAYER_BIAS_RADIUS,
  LIGHTNING_SPAWN_MARGIN,
  LIGHTNING_STRIKE_DURATION,
  LIGHTNING_WARN_DURATION,
  LIGHTNING_WIDTH,
  MAX_JUMPS,
  MAX_LIVES,
  PLAYER_GRAVITY,
  PLAYER_HEIGHT,
  PLAYER_JUMP_VEL,
  PLAYER_SCREEN_LIMIT_RATIO,
  PLAYER_SPEED,
  PLAYER_WIDTH,
  RAIN_STREAK_LENGTH,
  RAIN_VX,
  RAIN_VY,
  SCORE_POPUP_DURATION,
  SCORE_POPUP_RISE,
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
    const initNext = stage.lightning
      ? stage.lightning.gap.min +
        Math.random() * (stage.lightning.gap.max - stage.lightning.gap.min)
      : 0;
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
      lightnings: [],
      nextStrikeT: initNext,
      lives: MAX_LIVES,
      iframeT: 0,
      items: stage.items.map((it) => ({ ...it })),
      umbrellaT: 0,
      bootsT: 0,
      raincoatT: 0,
      score: 0,
      scorePopups: [],
      status: "playing",
    };
  }

  const state: GameState = initialState();

  let raf: number | null = null;
  let lastT = 0;
  let prevJump = false;
  let spawnAcc = 0;
  let prevPxScore = state.px;

  function getTimeScale(): number {
    return input.left || input.right ? 1 : STILL_TIME_SCALE;
  }

  function shelterRoof(s: Shelter): {
    left: number;
    right: number;
    top: number;
  } {
    switch (s.variant) {
      case "busStop":
        return { left: s.x - 55, right: s.x + 55, top: GROUND_Y - 88 };
      case "awning":
        return { left: s.x - 50, right: s.x + 50, top: GROUND_Y - 110 };
      case "phoneBooth":
        return { left: s.x - 22, right: s.x + 22, top: GROUND_Y - 110 };
    }
  }

  function applyDamage() {
    if (state.iframeT > 0) return;
    state.lives--;
    state.iframeT = IFRAME_DURATION;
    if (state.lives <= 0) {
      state.status = "dead";
    }
  }

  function pickupItem(it: Item) {
    const points = ITEM_SCORE[it.type];
    state.score += points;
    state.scorePopups.push({
      x: it.x,
      y: GROUND_Y - it.y - ITEM_SIZE,
      value: points,
      t: SCORE_POPUP_DURATION,
    });
    switch (it.type) {
      case "heart":
        state.lives = Math.min(MAX_LIVES, state.lives + 1);
        break;
      case "umbrella":
        state.umbrellaT = ITEM_DURATION;
        break;
      case "boots":
        state.bootsT = ITEM_DURATION;
        break;
      case "raincoat":
        state.raincoatT = ITEM_DURATION;
        break;
    }
  }

  function absorbRain(): boolean {
    return state.umbrellaT > 0 || state.raincoatT > 0;
  }

  function absorbPuddle(): boolean {
    return state.bootsT > 0 || state.raincoatT > 0;
  }

  function step(dt: number) {
    if (state.status !== "playing") return;

    if (state.iframeT > 0) {
      state.iframeT = Math.max(0, state.iframeT - dt);
    }
    if (state.umbrellaT > 0) {
      state.umbrellaT = Math.max(0, state.umbrellaT - dt);
    }
    if (state.bootsT > 0) {
      state.bootsT = Math.max(0, state.bootsT - dt);
    }
    if (state.raincoatT > 0) {
      state.raincoatT = Math.max(0, state.raincoatT - dt);
    }

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

    const dxScore = state.px - prevPxScore;
    if (dxScore > 0) state.score += dxScore * DISTANCE_SCORE_RATE;
    prevPxScore = state.px;

    if (state.px >= stage.goalDistance) {
      state.status = "won";
    }

    if (state.onGround) {
      for (const p of stage.puddles) {
        if (
          state.px + PLAYER_WIDTH / 2 > p.x &&
          state.px - PLAYER_WIDTH / 2 < p.x + p.width
        ) {
          if (!absorbPuddle()) applyDamage();
          break;
        }
      }
    }

    for (let i = state.items.length - 1; i >= 0; i--) {
      const it = state.items[i];
      const itLeft = it.x - ITEM_SIZE / 2;
      const itRight = it.x + ITEM_SIZE / 2;
      const itBottomY = GROUND_Y - it.y;
      const itTopY = itBottomY - ITEM_SIZE;
      if (
        state.px + PLAYER_WIDTH / 2 > itLeft &&
        state.px - PLAYER_WIDTH / 2 < itRight &&
        GROUND_Y - state.py > itTopY &&
        GROUND_Y - state.py - PLAYER_HEIGHT < itBottomY
      ) {
        pickupItem(it);
        state.items.splice(i, 1);
      }
    }

    const ts = getTimeScale();

    spawnAcc += dt * ts * stage.rainRate;
    while (spawnAcc >= 1) {
      spawnAcc -= 1;
      const spawnX = state.cam - 40 + Math.random() * (VIEWPORT_WIDTH + 160);
      state.drops.push({ x: spawnX, y: -40 });
    }

    const playerLeft = state.px - PLAYER_WIDTH / 2;
    const playerRight = state.px + PLAYER_WIDTH / 2;
    const playerTopY = GROUND_Y - state.py - PLAYER_HEIGHT;
    const playerBottomY = GROUND_Y - state.py;

    for (let i = state.drops.length - 1; i >= 0; i--) {
      const d = state.drops[i];
      d.x += RAIN_VX * dt * ts;
      d.y += RAIN_VY * dt * ts;

      if (d.y > GROUND_Y + 20) {
        state.drops.splice(i, 1);
        continue;
      }

      let consumed = false;
      for (const s of stage.shelters) {
        const r = shelterRoof(s);
        if (d.y >= r.top && d.x >= r.left && d.x <= r.right) {
          state.drops.splice(i, 1);
          consumed = true;
          break;
        }
      }
      if (consumed) continue;

      if (
        d.x >= playerLeft &&
        d.x <= playerRight &&
        d.y >= playerTopY &&
        d.y <= playerBottomY
      ) {
        if (!absorbRain()) applyDamage();
        state.drops.splice(i, 1);
      }
    }

    if (stage.lightning) {
      state.nextStrikeT -= dt;
      if (state.nextStrikeT <= 0) {
        const { min, max } = stage.lightning.gap;
        const warnSec = stage.lightning.warnSec ?? LIGHTNING_WARN_DURATION;
        const playerEffVx =
          input.right && !input.left
            ? PLAYER_SPEED
            : input.left && !input.right
              ? -PLAYER_SPEED
              : AUTO_SCROLL_SPEED;
        const predictedX = state.px + playerEffVx * warnSec;
        const desiredX =
          predictedX + (Math.random() - 0.5) * 2 * LIGHTNING_PLAYER_BIAS_RADIUS;
        const minX = state.cam + LIGHTNING_SPAWN_MARGIN;
        const maxX = state.cam + VIEWPORT_WIDTH - LIGHTNING_SPAWN_MARGIN;
        const spawnX = Math.max(minX, Math.min(maxX, desiredX));
        state.lightnings.push({ x: spawnX, phase: "warn", t: warnSec });
        state.nextStrikeT = min + Math.random() * (max - min);
      }
    }

    for (let i = state.lightnings.length - 1; i >= 0; i--) {
      const ev = state.lightnings[i];
      ev.t -= ev.phase === "warn" ? dt : dt * ts;
      if (ev.t <= 0) {
        if (ev.phase === "warn") {
          ev.phase = "strike";
          ev.t = LIGHTNING_STRIKE_DURATION;
        } else if (ev.phase === "strike") {
          ev.phase = "linger";
          ev.t = LIGHTNING_LINGER_DURATION;
        } else {
          state.lightnings.splice(i, 1);
          continue;
        }
      }
      if (ev.phase === "strike") {
        const half = LIGHTNING_WIDTH / 2;
        if (
          state.px + PLAYER_WIDTH / 2 > ev.x - half &&
          state.px - PLAYER_WIDTH / 2 < ev.x + half
        ) {
          applyDamage();
        }
      }
    }

    for (let i = state.scorePopups.length - 1; i >= 0; i--) {
      const p = state.scorePopups[i];
      p.t -= dt;
      if (p.t <= 0) state.scorePopups.splice(i, 1);
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

    {
      const sx = stage.goalDistance - state.cam;
      if (sx > -40 && sx < W + 40) {
        ctx!.fillStyle = "#5d4f3e";
        ctx!.fillRect(sx - 2, GROUND_Y - 90, 4, 90);
        ctx!.fillStyle = "#e53e3e";
        ctx!.beginPath();
        ctx!.moveTo(sx + 2, GROUND_Y - 90);
        ctx!.lineTo(sx + 32, GROUND_Y - 80);
        ctx!.lineTo(sx + 2, GROUND_Y - 65);
        ctx!.closePath();
        ctx!.fill();
        ctx!.fillStyle = "#fbb6ce";
        ctx!.fillRect(sx + 2, GROUND_Y - 90, 24, 2);
      }
    }

    for (const it of state.items) {
      const sx = it.x - state.cam;
      if (sx + ITEM_SIZE < 0 || sx - ITEM_SIZE > W) continue;
      const yBottom = GROUND_Y - it.y;
      const yTop = yBottom - ITEM_SIZE;
      const left = sx - ITEM_SIZE / 2;

      if (it.type === "heart") {
        ctx!.fillStyle = "#e53e3e";
        ctx!.fillRect(left, yTop + 4, ITEM_SIZE, ITEM_SIZE - 6);
        ctx!.fillRect(left + 2, yTop + 2, 6, 8);
        ctx!.fillRect(left + ITEM_SIZE - 8, yTop + 2, 6, 8);
        ctx!.fillStyle = "#fbb6ce";
        ctx!.fillRect(left + 4, yTop + 6, 4, 4);
      } else if (it.type === "umbrella") {
        ctx!.fillStyle = "#4a5568";
        ctx!.fillRect(left, yTop + 2, ITEM_SIZE, 10);
        ctx!.fillStyle = "#2d3748";
        ctx!.fillRect(left, yTop, ITEM_SIZE, 3);
        ctx!.fillStyle = "#718096";
        ctx!.fillRect(left + ITEM_SIZE / 2 - 1, yTop + 12, 2, 8);
        ctx!.fillRect(left + ITEM_SIZE / 2 - 3, yTop + 18, 4, 2);
      } else if (it.type === "boots") {
        ctx!.fillStyle = "#744210";
        ctx!.fillRect(left + 2, yTop + 6, ITEM_SIZE - 4, ITEM_SIZE - 8);
        ctx!.fillRect(left, yTop + ITEM_SIZE - 6, ITEM_SIZE, 4);
        ctx!.fillStyle = "#92400e";
        ctx!.fillRect(left + 4, yTop + 8, ITEM_SIZE - 8, 4);
      } else if (it.type === "raincoat") {
        ctx!.fillStyle = "#d69e2e";
        ctx!.fillRect(left + 2, yTop + 4, ITEM_SIZE - 4, ITEM_SIZE - 6);
        ctx!.fillStyle = "#b7791f";
        ctx!.fillRect(left + 4, yTop, ITEM_SIZE - 8, 6);
        ctx!.fillStyle = "#faf089";
        ctx!.fillRect(left + ITEM_SIZE / 2 - 1, yTop + 8, 2, 6);
      }
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

    for (const s of stage.shelters) {
      const sx = s.x - state.cam;
      if (sx + 60 < 0 || sx - 60 > W) continue;

      if (s.variant === "busStop") {
        ctx!.fillStyle = "#4a5568";
        ctx!.fillRect(sx - 50, GROUND_Y - 80, 4, 80);
        ctx!.fillRect(sx + 46, GROUND_Y - 80, 4, 80);
        ctx!.fillStyle = "rgba(120,150,180,0.25)";
        ctx!.fillRect(sx - 46, GROUND_Y - 76, 92, 58);
        ctx!.fillStyle = "#2d3748";
        ctx!.fillRect(sx - 55, GROUND_Y - 88, 110, 10);
        ctx!.fillStyle = "#5d4f3e";
        ctx!.fillRect(sx - 35, GROUND_Y - 20, 70, 6);
      } else if (s.variant === "awning") {
        ctx!.fillStyle = "#3a3a3a";
        ctx!.fillRect(sx - 50, GROUND_Y - 110, 4, 16);
        ctx!.fillRect(sx + 46, GROUND_Y - 110, 4, 16);
        ctx!.fillStyle = "#8b3a3a";
        ctx!.fillRect(sx - 50, GROUND_Y - 110, 100, 12);
        ctx!.fillStyle = "#c54a4a";
        ctx!.fillRect(sx - 50, GROUND_Y - 110, 100, 3);
      } else if (s.variant === "phoneBooth") {
        ctx!.fillStyle = "#9b2c2c";
        ctx!.fillRect(sx - 22, GROUND_Y - 110, 44, 110);
        ctx!.fillStyle = "#2d2d2d";
        ctx!.fillRect(sx - 22, GROUND_Y - 110, 44, 14);
        ctx!.fillStyle = "#f0e0a0";
        ctx!.fillRect(sx - 18, GROUND_Y - 107, 36, 8);
        ctx!.fillStyle = "rgba(160,190,210,0.4)";
        ctx!.fillRect(sx - 18, GROUND_Y - 92, 36, 70);
        ctx!.fillStyle = "#9b2c2c";
        ctx!.fillRect(sx - 2, GROUND_Y - 92, 4, 70);
      }
    }

    const warnSec = stage.lightning?.warnSec ?? LIGHTNING_WARN_DURATION;
    for (const ev of state.lightnings) {
      const sx = ev.x - state.cam;
      if (sx + LIGHTNING_WIDTH < 0 || sx - LIGHTNING_WIDTH > W) continue;

      if (ev.phase === "warn") {
        const progress = 1 - ev.t / warnSec;
        const blinkHz = 3 + progress * 18;
        const visible = Math.floor(state.realT * blinkHz) % 2 === 0;
        if (visible) {
          ctx!.fillStyle = "rgba(255,200,0,0.7)";
          ctx!.fillRect(
            sx - LIGHTNING_WIDTH / 2,
            GROUND_Y - 4,
            LIGHTNING_WIDTH,
            8,
          );
          ctx!.fillStyle = "rgba(255,80,0,0.9)";
          ctx!.fillRect(
            sx - LIGHTNING_WIDTH / 2,
            GROUND_Y - 6,
            LIGHTNING_WIDTH,
            2,
          );
        }
      } else if (ev.phase === "strike") {
        const strikeProgress = 1 - ev.t / LIGHTNING_STRIKE_DURATION;
        const tipY = GROUND_Y * strikeProgress;
        ctx!.fillStyle = "rgba(255,240,100,0.4)";
        ctx!.fillRect(sx - LIGHTNING_WIDTH / 2, 0, LIGHTNING_WIDTH, tipY);
        ctx!.fillStyle = "rgba(255,255,255,0.95)";
        ctx!.fillRect(sx - 4, 0, 8, tipY);
      } else {
        ctx!.fillStyle = "rgba(20,20,20,0.7)";
        ctx!.fillRect(
          sx - LIGHTNING_WIDTH / 2,
          GROUND_Y - 2,
          LIGHTNING_WIDTH,
          4,
        );
      }
    }

    const screenX = state.px - state.cam;
    const playerTop = GROUND_Y - state.py - PLAYER_HEIGHT;
    const blinking =
      state.iframeT > 0 && Math.floor(state.realT * 12) % 2 === 0;
    if (!blinking) {
      ctx!.fillStyle = "#fff";
      ctx!.fillRect(
        screenX - PLAYER_WIDTH / 2,
        playerTop,
        PLAYER_WIDTH,
        PLAYER_HEIGHT,
      );
    }

    for (const p of state.scorePopups) {
      const sx = p.x - state.cam;
      if (sx < -60 || sx > W + 60) continue;
      const progress = 1 - p.t / SCORE_POPUP_DURATION;
      const yOffset = -progress * SCORE_POPUP_RISE;
      const alpha = Math.max(0, 1 - progress);

      ctx!.save();
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = "#ffe066";
      ctx!.font = "bold 20px monospace";
      ctx!.textAlign = "center";
      ctx!.fillText(`+${p.value}`, sx, p.y + yOffset);
      ctx!.restore();
    }

    ctx!.save();
    ctx!.fillStyle = "#fff";
    ctx!.font = "32px monospace";
    ctx!.textAlign = "right";
    ctx!.fillText(
      `SCORE ${Math.floor(state.score).toLocaleString()}`,
      W - 24,
      48,
    );
    ctx!.restore();

    ctx!.fillStyle = "#888";
    ctx!.font = "22px monospace";
    ctx!.fillText(`stage: ${stage.name}  ts: ${ts.toFixed(2)}`, 24, 44);
    ctx!.fillText(
      `lives:${state.lives}  dist:${state.px.toFixed(0)}/${stage.goalDistance}  jumps:${state.jumpsLeft}`,
      24,
      72,
    );
    const blinkOff = Math.floor(state.realT * 12) % 2 === 0;
    const showItem = (t: number) =>
      t > 0 && !(t < ITEM_BLINK_THRESHOLD && blinkOff);
    const held: string[] = [];
    if (showItem(state.umbrellaT))
      held.push(`우산(${state.umbrellaT.toFixed(1)})`);
    if (showItem(state.bootsT)) held.push(`장화(${state.bootsT.toFixed(1)})`);
    if (showItem(state.raincoatT))
      held.push(`우비(${state.raincoatT.toFixed(1)})`);
    ctx!.fillText(`hold: ${held.length ? held.join(" ") : "-"}`, 24, 100);

    if (state.status === "dead" || state.status === "won") {
      ctx!.save();
      const isWin = state.status === "won";
      ctx!.fillStyle = isWin ? "rgba(20,80,30,0.7)" : "rgba(0,0,0,0.6)";
      ctx!.fillRect(0, 0, W, H);
      ctx!.fillStyle = "#fff";
      ctx!.font = "64px monospace";
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText(isWin ? "STAGE CLEAR" : "GAME OVER", W / 2, H / 2 - 20);
      ctx!.font = "22px monospace";
      ctx!.fillText("press R to restart", W / 2, H / 2 + 40);
      ctx!.restore();
    }
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
    restart() {
      Object.assign(state, initialState());
      spawnAcc = 0;
      prevJump = false;
      prevPxScore = state.px;
    },
  };
}
