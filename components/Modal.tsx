"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 헤더 제목 (있으면 .modal__header 렌더) */
  title?: string;
  subtitle?: string;
  /** 푸터 영역 (버튼 등) */
  footer?: ReactNode;
  footerRow?: boolean;
  /** 우상단 닫기(X) 버튼 표시 */
  showClose?: boolean;
  dark?: boolean;
  /** 세로 정렬 — 모바일 키보드가 가리지 않도록 입력 모달은 "top" */
  align?: "center" | "top";
  maxWidth?: number;
  bodyClassName?: string;
};

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  footer,
  footerRow = false,
  showClose = false,
  dark = false,
  align = "center",
  maxWidth = 440,
  bodyClassName = "",
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
      className={`fixed inset-0 z-50 flex overflow-y-auto px-4 ${alignClass}`}
      style={{ background: "var(--backdrop)" }}
      onClick={onClose}
    >
      <div
        className={`modal ${dark ? "modal--dark" : ""}`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="modal__header">
            {title && <h3 className="modal__title">{title}</h3>}
            {subtitle && <p className="modal__sub">{subtitle}</p>}
            {showClose && (
              <button
                type="button"
                className="modal__close"
                onClick={onClose}
                aria-label="닫기"
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div className={`modal__body ${bodyClassName}`}>{children}</div>
        {footer && (
          <div className={`modal__footer ${footerRow ? "modal__footer--row" : ""}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
