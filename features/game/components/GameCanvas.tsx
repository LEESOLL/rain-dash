"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getNextStageId } from "@/features/stage/stageRepository";
import type { Stage } from "@/features/stage/types";
import { createEngine } from "../engine/createEngine";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "../engine/tuning";
import type { Engine, GameStatus } from "../engine/types";

type Props = {
  stage: Stage;
};

export function GameCanvas({ stage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const router = useRouter();
  const [status, setStatus] = useState<GameStatus>("playing");

  const nextStageId = getNextStageId(stage);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;

    const engine = createEngine({
      canvas,
      stage,
      onStateChange: (state) => {
        setStatus(state.status);
      },
    });
    engineRef.current = engine;
    setStatus("playing");
    engine.start();

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        engine.setInput({ left: true });
        e.preventDefault();
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        engine.setInput({ right: true });
        e.preventDefault();
      } else if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        engine.setInput({ jump: true });
        e.preventDefault();
      } else if (e.code === "KeyR") {
        const s = engine.getState();
        if (s.status === "dead" || s.status === "won") {
          engine.restart();
        }
        e.preventDefault();
      } else if (e.code === "Escape") {
        router.replace("/play");
        e.preventDefault();
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        engine.setInput({ left: false });
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        engine.setInput({ right: false });
      } else if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        engine.setInput({ jump: false });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      engine.stop();
      engineRef.current = null;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [stage, router]);

  function handleExit() {
    router.replace("/play");
  }
  function handleRetry() {
    engineRef.current?.restart();
  }
  function handleNext() {
    if (nextStageId) router.replace(`/play/${nextStageId}`);
  }

  const showNext = status === "won" && nextStageId !== null;
  const retryIsPrimary = !showNext;

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="block h-full w-full" />
      {status !== "playing" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[10%] z-10 flex justify-center">
          <div className="pointer-events-auto flex gap-3">
            <button
              onClick={handleExit}
              className="rounded border border-white/40 bg-black/50 px-5 py-2 text-sm tracking-wider text-white transition hover:bg-white/10"
            >
              나가기
            </button>
            <button
              onClick={handleRetry}
              className={`rounded px-5 py-2 text-sm tracking-wider transition ${
                retryIsPrimary
                  ? "bg-white font-bold text-black hover:bg-white/80"
                  : "border border-white/40 bg-black/50 text-white hover:bg-white/10"
              }`}
            >
              다시하기
            </button>
            {showNext && (
              <button
                onClick={handleNext}
                className="rounded bg-emerald-500 px-5 py-2 text-sm font-bold tracking-wider text-black transition hover:bg-emerald-400"
              >
                다음 스테이지 ▶
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
