"use client";

import { playClick } from "@/lib/sound";

type Item = { value: string; label: string };

type Props = {
  items: Item[];
  value: string;
  onChange: (value: string) => void;
};

export function PillTabs({ items, value, onChange }: Props) {
  return (
    <div className="pill-tabs">
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          className={`pill-tab ${it.value === value ? "is-active" : ""}`}
          onClick={() => {
            playClick();
            onChange(it.value);
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
