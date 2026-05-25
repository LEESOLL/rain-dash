"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/Modal";
import { useIsTouch } from "@/lib/touch";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest text-sky-400">
      {children}
    </h3>
  );
}

function Key({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md border border-sky-300 bg-white px-1.5 text-sm font-bold text-sky-600 shadow-sm">
      {children}
    </span>
  );
}

function Cell({
  src,
  name,
  desc,
}: {
  src: string;
  name: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/60 px-3 py-2">
      <img
        src={src}
        alt={name}
        className="h-10 w-10 shrink-0 object-contain [image-rendering:pixelated]"
      />
      <div className="leading-tight">
        <div className="text-sm font-bold text-sky-500">{name}</div>
        <div className="text-xs text-sky-900/70">{desc}</div>
      </div>
    </div>
  );
}

export function HowToPlayModal({ isOpen, onClose }: Props) {
  const isTouch = useIsTouch();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="게임 방법"
      subtitle="HOW TO PLAY"
      showClose
      maxWidth={560}
    >
      <div className="flex flex-col gap-5 pb-6 text-sky-900">
        <div className="flex flex-col gap-2">
          <SectionLabel>조작</SectionLabel>
          {isTouch ? (
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-2xl bg-white/60 px-3 py-2">
                <span className="font-bold text-sky-500">화면 왼쪽</span>
                <span className="text-sm font-medium text-sky-900/80">
                  뒤로
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/60 px-3 py-2">
                <span className="font-bold text-sky-500">화면 오른쪽</span>
                <span className="text-sm font-medium text-sky-900/80">
                  앞으로
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/60 px-3 py-2">
                <span className="font-bold text-sky-500">화면 가운데</span>
                <span className="text-sm font-medium text-sky-900/80">
                  점프{" "}
                  <span className="font-bold text-sky-500">
                    (두 번 탭 2단 점프)
                  </span>
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-2xl bg-white/60 px-3 py-2">
                <Key>←</Key>
                <Key>→</Key>
                <span className="text-sm font-medium text-sky-900/80">
                  좌우 이동
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/60 px-3 py-2">
                <Key>↑</Key>
                <span className="text-sm font-medium text-sky-900/80">
                  점프{" "}
                  <span className="font-bold text-sky-500">(2단 점프)</span>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-3">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-sky-400 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white">
              핵심
            </span>
            <span className="text-sm font-bold text-sky-500">속도 = 시간</span>
          </div>
          <p className="text-xs leading-relaxed text-sky-900/80">
            가만히 있으면 비와 번개가 <b>천천히</b>, 빠르게 달릴수록 비와 번개가{" "}
            <b>더 거세게</b> 쏟아집니다.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>아이템</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <Cell
              src="/sprites/items/umbrella.webp"
              name="우산"
              desc="비를 막아줘요"
            />
            <Cell
              src="/sprites/items/boots.webp"
              name="장화"
              desc="웅덩이를 막아줘요"
            />
            <Cell
              src="/sprites/items/raincoat.webp"
              name="우비"
              desc="비·웅덩이 모두 막아요"
            />
            <Cell
              src="/sprites/items/heart.webp"
              name="하트"
              desc="목숨을 1 회복해요"
            />
          </div>
          <p className="text-xs text-sky-900/60">
            ＊아이템을 먹으면 점수도 올라가요.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>주의</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <Cell
              src="/sprites/effects/rain.webp"
              name="비"
              desc="맞으면 목숨이 줄어요"
            />
            <Cell
              src="/sprites/effects/thunder.webp"
              name="번개"
              desc="무조건 목숨↓ · 직접 피하기"
            />
            <Cell
              src="/sprites/effects/puddle_short.webp"
              name="웅덩이"
              desc="점프로 넘으세요"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>쉘터 — 비 피하는 곳</SectionLabel>
          <div className="flex items-center gap-3 rounded-2xl bg-white/60 px-3 py-2">
            <div className="flex shrink-0 items-end gap-2">
              <img
                src="/sprites/objects/awning.webp"
                alt="가게"
                className="h-10 w-10 object-contain [image-rendering:pixelated]"
              />
              <img
                src="/sprites/objects/bus_stop.webp"
                alt="버스정류장"
                className="h-10 w-10 object-contain [image-rendering:pixelated]"
              />
              <img
                src="/sprites/objects/phone_booth.webp"
                alt="공중전화"
                className="h-10 w-10 object-contain [image-rendering:pixelated]"
              />
            </div>
            <div className="text-xs leading-relaxed text-sky-900/70">
              가게 · 버스정류장 · 공중전화 아래로 들어가면 비를 피해요.{" "}
              <b className="text-sky-500">단, 번개는 못 막아요.</b>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-2">
          <img
            src="/sprites/objects/house.webp"
            alt="집"
            className="h-10 w-10 shrink-0 object-contain [image-rendering:pixelated]"
          />
          <span className="text-sm font-bold text-sky-500">
            집까지 도착하면 클리어!
          </span>
        </div>
      </div>
    </Modal>
  );
}
