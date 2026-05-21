"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GameButton } from "@/components/GameButton";
import { submitMyScore } from "@/features/ranking/rankingRepository";
import { fetchProgress } from "@/features/stage/stageProgressRepository";
import { getNextStageId } from "@/features/stage/stageRepository";
import { useIsPortrait } from "@/lib/orientation";
import { useIsTouch } from "@/lib/touch";
import { clearBgm, isAudioEnabled, playBgm, stopBgm } from "@/lib/sound";
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
  const [manualPaused, setManualPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const portrait = useIsPortrait();
  const isTouch = useIsTouch();

  const [touchGuideDone, setTouchGuideDone] = useState(
    () =>
      typeof window !== "undefined" &&
      sessionStorage.getItem("rd:touchGuide") === "1",
  );

  const showTouchGuide = ready && isTouch && !touchGuideDone && !portrait;

  const paused = portrait || manualPaused || showTouchGuide;
  const pausedRef = useRef(paused);

  const nextStageId = getNextStageId(stage);

  function dismissTouchGuide() {
    sessionStorage.setItem("rd:touchGuide", "1");
    setTouchGuideDone(true);
  }

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // 모바일 터치 입력 — 화면 3등분: 좌=뒤로, 우=앞으로, 가운데=점프 (멀티터치)
  useEffect(() => {
    if (!isTouch) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    function sync(e: TouchEvent) {
      e.preventDefault();
      const engine = engineRef.current;
      if (!engine || !canvas) return;
      if (pausedRef.current || engine.getState().status !== "playing") {
        engine.setInput({ left: false, right: false, jump: false });
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const third = rect.width / 3;
      let left = false;
      let right = false;
      let jump = false;
      for (const t of Array.from(e.touches)) {
        const x = t.clientX - rect.left;
        if (x < third) left = true;
        else if (x > third * 2) right = true;
        else jump = true;
      }
      engine.setInput({ left, right, jump });
    }
    canvas.addEventListener("touchstart", sync, { passive: false });
    canvas.addEventListener("touchmove", sync, { passive: false });
    canvas.addEventListener("touchend", sync, { passive: false });
    canvas.addEventListener("touchcancel", sync, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", sync);
      canvas.removeEventListener("touchmove", sync);
      canvas.removeEventListener("touchend", sync);
      canvas.removeEventListener("touchcancel", sync);
    };
  }, [isTouch]);

  useEffect(() => {
    fetchProgress().catch((e) => console.error("progress fetch failed", e));
    return () => clearBgm();
  }, []);

  useEffect(() => {
    engineRef.current?.setPaused(paused);
  }, [paused]);

  useEffect(() => {
    if (status === "playing") {
      playBgm("/audio/gaming_bgm.mp3", 0.4);
    } else {
      stopBgm();
    }
  }, [status]);

  useEffect(() => {
    if (status === "dead") {
      if (isAudioEnabled()) {
        const audio = new Audio("/audio/game_over.mp3");
        audio.volume = 0.6;
        audio.play().catch(() => {});
      }
    } else if (status === "won") {
      submitMyScore(stage.bundleId).catch((e) =>
        console.error("score submit failed", e),
      );
      if (!isAudioEnabled()) return;
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
      onReady: () => setReady(true),
    });
    engineRef.current = engine;
    setStatus("playing");
    engine.start();
    engine.setPaused(pausedRef.current);

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
        router.replace("/?view=stage");
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
    router.replace("/?view=stage");
  }
  function handleRetry() {
    engineRef.current?.restart();
  }
  function handleNext() {
    if (nextStageId) router.replace(`/play/${nextStageId}`);
  }

  const showNext = status === "won" && nextStageId !== null;
  const retryIsPrimary = !showNext;
  const showPauseButton =
    status === "playing" && !manualPaused && !portrait && !showTouchGuide;
  const showPauseOverlay = manualPaused && !portrait;

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />

      {showTouchGuide && (
        <div
          onClick={dismissTouchGuide}
          className="absolute inset-0 z-30 flex flex-col bg-black/70 font-mono text-white"
        >
          <div className="grid flex-1 grid-cols-3">
            <div className="flex flex-col items-center justify-center gap-2 border-r border-white/25">
              <span className="text-4xl">◀</span>
              <span className="text-sm tracking-wider">뒤로</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 border-r border-white/25">
              <span className="text-4xl">▲</span>
              <span className="text-sm tracking-wider">점프</span>
              <span className="text-xs text-white/60">두 번 탭 = 2단 점프</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">▶</span>
              <span className="text-sm tracking-wider">앞으로</span>
            </div>
          </div>
          <div className="animate-pulse pb-8 text-center text-sm tracking-widest text-white/80">
            화면을 탭하여 시작
          </div>
        </div>
      )}

      {showPauseButton && (
        <div className="absolute right-4 top-4 z-10">
          <GameButton size="sm" onClick={() => setManualPaused(true)}>
            일시정지
          </GameButton>
        </div>
      )}

      {showPauseOverlay && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-black/55 font-mono text-white">
          <h2 className="text-2xl font-bold tracking-widest">일시정지</h2>
          <div className="flex gap-3">
            <GameButton size="md" onClick={handleExit}>
              나가기
            </GameButton>
            <GameButton
              size="md"
              variant="primary"
              onClick={() => setManualPaused(false)}
            >
              재개
            </GameButton>
          </div>
        </div>
      )}

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
