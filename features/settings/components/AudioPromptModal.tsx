"use client";

import { GameButton } from "@/components/GameButton";
import { Modal } from "@/components/Modal";

type Props = {
  isOpen: boolean;
  onChoose: (enabled: boolean) => void;
};

export function AudioPromptModal({ isOpen, onChoose }: Props) {
  if (!isOpen) return null;
  return (
    <Modal
      isOpen={true}
      onClose={() => onChoose(false)}
      panelClassName="rounded-2xl border-2 border-white bg-white/90 backdrop-blur-md shadow-xl"
    >
      <div className="flex flex-col items-center gap-6 text-sky-900">
        <div className="text-center">
          <h2 className="mb-1 text-xl font-bold tracking-widest text-sky-400">
            사운드 켜기
          </h2>
          <p className="text-xs text-sky-700/60">
            배경 음악과 효과음을 재생할까요?
          </p>
        </div>

        <div className="flex gap-3">
          <GameButton size="md" variant="primary" onClick={() => onChoose(true)}>
            소리 켜기
          </GameButton>
          <GameButton size="md" variant="light" onClick={() => onChoose(false)}>
            소리 끄기
          </GameButton>
        </div>
      </div>
    </Modal>
  );
}
