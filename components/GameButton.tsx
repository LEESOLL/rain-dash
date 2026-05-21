"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { playClick } from "@/lib/sound";

type Variant = "primary" | "secondary" | "light" | "danger";
type Size = "lg" | "md" | "sm";

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  onClick?: () => void;
  onMouseLeave?: () => void;
  href?: string;
  className?: string;
  type?: "button" | "submit";
};

const base =
  "inline-block rounded-2xl border-2 text-center tracking-wide backdrop-blur transition hover:scale-[1.03] active:scale-95";

const variants: Record<Variant, string> = {
  primary:
    "border-white/70 bg-sky-400/90 font-extrabold text-white shadow-lg shadow-sky-900/30 hover:bg-sky-300",
  secondary:
    "border-white/50 bg-white/20 font-bold text-white shadow-md shadow-black/20 hover:bg-white/35",
  light:
    "border-sky-300 bg-sky-50 font-bold text-sky-600 shadow-sm hover:bg-sky-100",
  danger:
    "border-red-400/70 bg-red-500/80 font-bold text-white shadow-md shadow-red-900/30 hover:bg-red-500",
};

const sizes: Record<Size, string> = {
  lg: "px-8 py-[clamp(0.55rem,1.6vh,0.8rem)] text-lg sm:text-xl",
  md: "px-8 py-[clamp(0.5rem,1.5vh,0.7rem)] text-base sm:text-lg",
  sm: "px-5 py-2 text-sm",
};

export function GameButton({
  children,
  variant = "secondary",
  size = "md",
  onClick,
  onMouseLeave,
  href,
  className = "",
  type = "button",
}: Props) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
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
