"use client";

import { useEffect, useRef, useState } from "react";
import { playClick } from "@/lib/sound";

type Option = { value: string; label: string };

type Props = {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export function Select({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={ref} className={`select ${open ? "select--open" : ""}`}>
      <div
        className="select__control"
        onClick={() => {
          playClick();
          setOpen((o) => !o);
        }}
      >
        <span>{current?.label}</span>
        <span className="select__caret" />
      </div>
      {open && (
        <div className="select__menu">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`select__option ${opt.value === value ? "select__option--selected" : ""}`}
              onClick={() => {
                playClick();
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
