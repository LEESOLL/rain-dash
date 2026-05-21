import { useSyncExternalStore } from "react";

function getSnapshot(): boolean {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0
  );
}

function subscribe(cb: () => void): () => void {
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getServerSnapshot(): boolean {
  return false;
}

/** 터치(coarse pointer) 기기인지 — 모바일 터치 컨트롤·안내 분기에 사용 */
export function useIsTouch(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
