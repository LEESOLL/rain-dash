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
      title="사운드 켜기"
      subtitle="SOUND"
      footer={
        <div className="flex gap-3">
          <GameButton
            size="md"
            variant="primary"
            block
            onClick={() => onChoose(true)}
          >
            소리 켜기
          </GameButton>
          <GameButton
            size="md"
            variant="ghost"
            block
            onClick={() => onChoose(false)}
          >
            소리 끄기
          </GameButton>
        </div>
      }
    >
      <p className="text-center text-sm text-[var(--text-body)]">
        배경 음악과 효과음을 재생할까요?
        <br />
        <span className="text-xs text-[var(--text-muted)]">
          설정에서 언제든 다시 바꿀 수 있어요.
        </span>
      </p>
    </Modal>
  );
}
