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

    return () => {
      engine.stop();
    };
  }, [stage]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}
