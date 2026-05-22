"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { playClick } from "@/lib/sound";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  onClick?: () => void;
  onMouseLeave?: () => void;
  href?: string;
  className?: string;
  type?: "button" | "submit";
};

export function GameButton({
  children,
  variant = "secondary",
  size = "md",
  block = false,
  onClick,
  onMouseLeave,
  href,
  className = "",
  type = "button",
}: Props) {
  const cls = [
    "btn",
    `btn--${variant}`,
    size === "sm" && "btn--sm",
    size === "lg" && "btn--lg",
    block && "btn--block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function handleClick() {
    playClick();
    onClick?.();
  }

  if (href) {
    return (
      <Link href={href} className={cls} onClick={handleClick}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={handleClick}
      onMouseLeave={onMouseLeave}
      className={cls}
    >
      {children}
    </button>
  );
}
