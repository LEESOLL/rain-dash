"use client";

import { useEffect } from "react";

/**
 * 브라우저 기본 인터랙션 차단:
 * - 우클릭/롱프레스 컨텍스트 메뉴(이미지 저장 등)
 * - iOS Safari 핀치 줌 제스처
 * (텍스트 선택·이미지 드래그는 globals.css에서 차단)
 */
export function InteractionGuard() {
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("gesturestart", prevent);
    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("gesturestart", prevent);
    };
  }, []);
  return null;
}
