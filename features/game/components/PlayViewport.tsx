"use client";

import type { Stage } from "@/features/stage/types";
import { useIsPortrait } from "@/lib/orientation";
import { useIsTouch } from "@/lib/touch";
import { StageGate } from "./StageGate";

type Props = {
  stage: Stage;
};

export function PlayViewport({ stage }: Props) {
  const isTouch = useIsTouch();
  const portrait = useIsPortrait();

  // 세로 기기에서는 OS 방향을 바꾸지 않고 게임 영역만 회전해 세로 화면을 가로 게임으로 채운다.
  // 사용자는 기기를 반시계방향으로 돌려 잡고 플레이한다.
  if (isTouch && portrait) {
    return (
      <main className="fixed inset-0 overflow-hidden bg-gradient-to-b from-[#bde3fb] via-[#ddeffc] to-[#f2f9fe]">
        <div className="rotate-portrait-play flex items-center justify-center">
          <div
            className="aspect-video"
            style={{ width: "min(100dvh, calc(100dvw * 16 / 9))" }}
          >
            <StageGate stage={stage} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-[#bde3fb] via-[#ddeffc] to-[#f2f9fe]">
      <div
        className="aspect-video"
        style={{ width: "min(100vw, calc(100vh * 16 / 9))" }}
      >
        <StageGate stage={stage} />
      </div>
    </main>
  );
}
