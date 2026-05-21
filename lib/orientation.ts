import { useSyncExternalStore } from "react";

let portrait = false;
let started = false;
const listeners = new Set<() => void>();

function compute(): boolean {
  return window.innerWidth < window.innerHeight;
}

function update() {
  const next = compute();
  if (next !== portrait) {
    portrait = next;
    for (const l of listeners) l();
  }
}

function ensureListening() {
  if (started || typeof window === "undefined") return;
  started = true;
  portrait = compute();
  window.addEventListener("resize", update);
  window.addEventListener("orientationchange", update);
}

function subscribe(cb: () => void): () => void {
  ensureListening();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): boolean {
  return portrait;
}

function getServerSnapshot(): boolean {
  return false;
}

/** 현재 화면이 세로(가로폭 < 세로높이)인지 — 모바일·데스크탑 공통 */
export function useIsPortrait(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
