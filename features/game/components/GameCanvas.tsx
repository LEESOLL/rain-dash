"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GameButton } from "@/components/GameButton";
import { submitMyScore } from "@/features/ranking/rankingRepository";
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
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const [status, setStatus] = useState<GameStatus>("playing");

  const nextStageId = getNextStageId(stage);

  useEffect(() => {
    const bgm = new Audio("/audio/gaming_bgm.mp3");
    bgm.loop = true;
    bgm.volume = 0.4;
    bgm.play().catch(() => {});
    bgmRef.current = bgm;
    return () => {
      bgm.pause();
    };
  }, []);

  useEffect(() => {
    if (status === "dead") {
      bgmRef.current?.pause();
      const audio = new Audio("/audio/game_over.mp3");
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } else if (status === "won") {
      bgmRef.current?.pause();
      submitMyScore(stage.bundleId).catch((e) =>
        console.error("score submit failed", e),
      );
      const win = new Audio("/audio/win.wav");
      win.volume = 0.6;
      win.play().catch(() => {});
      const scoreAudio = new Audio("/audio/score_rolling_up.mp3");
      scoreAudio.volume = 0.5;
      const timer = setTimeout(() => {
        scoreAudio.play().catch(() => {});
      }, 400);
      return () => {
        win.pause();
        scoreAudio.pause();
        clearTimeout(timer);
      };
    }
  }, [status]);

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
      } else if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "KeyW"
      ) {
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
      } else if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "KeyW"
      ) {
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
            <GameButton size="md" onClick={handleExit}>
              나가기
            </GameButton>
            <GameButton
              size="md"
              variant={retryIsPrimary ? "primary" : "secondary"}
              onClick={handleRetry}
            >
              다시하기
            </GameButton>
            {showNext && (
              <GameButton size="md" variant="primary" onClick={handleNext}>
                다음 스테이지 ▶
              </GameButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
