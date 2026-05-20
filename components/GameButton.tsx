"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "lg" | "md" | "sm";

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  onClick?: () => void;
  href?: string;
  className?: string;
};

const base =
  "inline-block rounded-2xl border-2 text-center tracking-wide text-white backdrop-blur transition hover:scale-[1.03] active:scale-95";

const variants: Record<Variant, string> = {
  primary:
    "border-white/70 bg-sky-400/90 font-extrabold shadow-lg shadow-sky-900/30 hover:bg-sky-300",
  secondary:
    "border-white/50 bg-white/20 font-bold shadow-md shadow-black/20 hover:bg-white/35",
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
  href,
  className = "",
}: Props) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
