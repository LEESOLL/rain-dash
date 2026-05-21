"use client";

import { useIsPortrait } from "@/lib/orientation";

export function OrientationGate() {
  const portrait = useIsPortrait();
  if (!portrait) return null;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-sky-100 px-8 text-center font-mono text-sky-900">
      <div className="animate-rotate-hint">
        <div className="h-24 w-14 rounded-xl border-4 border-sky-400" />
      </div>
      <h2 className="text-xl font-bold tracking-widest text-sky-500">
        가로로 돌려주세요
      </h2>
      <p className="text-sm leading-relaxed text-sky-900/70">
        Rain Dash는 가로 화면에 최적화되어 있어요.
        <br />
        기기를 가로로 돌리면 계속할 수 있습니다.
      </p>
    </div>
  );
}
