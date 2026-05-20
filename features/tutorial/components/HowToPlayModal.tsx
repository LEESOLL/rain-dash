"use client";

import { Modal } from "@/components/Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function HowToPlayModal({ isOpen, onClose }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="rounded-3xl border-2 border-white/70 bg-white/70 backdrop-blur-md shadow-xl"
    >
      <div className="flex flex-col gap-6 text-sky-900">
        <h2 className="text-center text-xl font-bold tracking-widest text-sky-400">
          게임 방법
        </h2>

        <div className="space-y-3 text-sm leading-relaxed text-sky-900/85">
          <p>
            <span className="font-bold text-sky-400">←/A, →/D</span> — 좌우 이동
          </p>
          <p>
            <span className="font-bold text-sky-400">SPACE, ↑, W</span> — 점프
            (2단 점프 가능)
          </p>
          <p>
            <span className="font-bold text-sky-400">R</span> — 사망/승리 후
            재시작
          </p>
          <p>
            <span className="font-bold text-sky-400">ESC</span> — 메인으로
          </p>

          <p className="!mt-5">
            가만히 있으면 시간이 느려집니다. 움직이면 빨라집니다.
          </p>
          <p>비를 피하거나 쉘터 아래로 들어가 안전 위치를 잡으세요.</p>
          <p>물 웅덩이는 점프로 넘으세요.</p>
          <p>번개는 쉘터로 막을 수 없습니다.</p>
          <p>아이템을 먹어 일정 시간 보호 효과를 받으세요.</p>
          <p>골인 지점의 집까지 도착하면 클리어입니다.</p>
        </div>
      </div>
    </Modal>
  );
}
