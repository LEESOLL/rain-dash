import type { Engine, EngineConfig, GameState, Input } from "./types";

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
    state.realT += dt;
  }

  function draw() {
    const W = canvas.width;
    const H = canvas.height;

    ctx!.fillStyle = "#0d0d18";
    ctx!.fillRect(0, 0, W, H);

    ctx!.fillStyle = "#888";
    ctx!.font = "22px monospace";
    ctx!.fillText(`stage: ${stage.name}`, 24, 44);
    ctx!.fillText(`t: ${state.realT.toFixed(2)}s`, 24, 72);
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
