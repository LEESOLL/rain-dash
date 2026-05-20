"use client";

import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  panelClassName?: string;
};

export function Modal({ isOpen, onClose, children, panelClassName }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
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
