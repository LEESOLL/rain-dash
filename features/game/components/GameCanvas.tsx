"use client";

import { useEffect, useRef } from "react";
import type { Stage } from "@/features/stage/types";
import { createEngine } from "../engine/createEngine";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "../engine/tuning";

type Props = {
  stage: Stage;
};

export function GameCanvas({ stage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;

    const engine = createEngine({ canvas, stage });
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
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [stage]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}
