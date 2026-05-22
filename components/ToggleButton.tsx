"use client";

import { playClick } from "@/lib/sound";

type Props = {
  on: boolean;
  onChange: (on: boolean) => void;
  block?: boolean;
  className?: string;
};

export function ToggleButton({ on, onChange, block, className = "" }: Props) {
  const cls = [
    "btn-toggle",
    on ? "is-on" : "is-off",
    block && "w-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type="button"
      className={cls}
      onClick={() => {
        playClick();
        onChange(!on);
      }}
    >
      {on ? "ON" : "OFF"}
    </button>
  );
}
