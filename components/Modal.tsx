"use client";

import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  panelClassName?: string;
  /** 세로 정렬 — 모바일 키보드가 가리지 않도록 입력 모달은 "top" 사용 */
  align?: "center" | "top";
};

export function Modal({
  isOpen,
  onClose,
  children,
  panelClassName,
  align = "center",
}: Props) {
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const alignClass =
    align === "top"
      ? "items-start justify-center pt-[5vh]"
      : "items-center justify-center";

  return (
    <div
      className={`fixed inset-0 z-50 flex overflow-y-auto bg-black/70 px-4 backdrop-blur-sm ${alignClass}`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md p-6 font-mono text-white ${panelClassName ?? "rounded-lg border border-white/20 bg-zinc-900"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
