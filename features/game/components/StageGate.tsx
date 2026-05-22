"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProgress } from "@/features/stage/stageProgressRepository";
import { isStageUnlocked } from "@/features/stage/stageRepository";
import { setMainView } from "@/lib/mainView";
import { LoadingOverlay } from "./LoadingOverlay";
import type { Stage } from "@/features/stage/types";
import { GameCanvas } from "./GameCanvas";

type Props = {
  stage: Stage;
};

// 서버(Firestore) 진행도를 확인해 잠긴 스테이지는 직접 URL 접근을 막는다
export function StageGate({ stage }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProgress()
      .then((progress) => {
        if (cancelled) return;
        if (isStageUnlocked(stage.id, progress.clearedStageIds)) {
          setAllowed(true);
        } else {
          setAllowed(false);
          setMainView("stage");
          router.replace("/");
        }
      })
      .catch((e) => {
        // 네트워크 오류 시 정상 사용자를 막지 않도록 허용
        console.error("progress fetch failed", e);
        if (!cancelled) setAllowed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [stage.id, router]);

  if (allowed !== true) {
    return (
      <div className="relative h-full w-full">
        <LoadingOverlay progress={0} />
      </div>
    );
  }

  return <GameCanvas stage={stage} />;
}
