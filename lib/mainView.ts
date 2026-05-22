import { useSyncExternalStore } from "react";

export type MainView = "stage" | "ranking" | null;

// 메인 페이지 위에 띄우는 뷰(스테이지/랭킹 모달) 상태.
// 게임·잠긴 스테이지에서 메인으로 돌아올 때 다른 라우트에서 설정할 수 있도록
// 모듈 스토어로 둔다 (useSyncExternalStore로 구독 → effect setState 불필요).
let current: MainView = null;
const listeners = new Set<() => void>();

export function setMainView(v: MainView): void {
  current = v;
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): MainView {
  return current;
}

function getServerSnapshot(): MainView {
  return null;
}

export function useMainView(): MainView {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
