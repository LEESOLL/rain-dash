"use client";

import { useState } from "react";
import { GameButton } from "@/components/GameButton";
import { Modal } from "@/components/Modal";
import {
  createUser,
  MAX_NICKNAME_LENGTH,
} from "@/features/user/userRepository";
import { refreshUserCache } from "@/features/user/userStore";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** 닉네임 저장 후 다음 단계로 진행할 때 호출 (예: 게임 페이지로 이동) */
  onConfirm: () => void;
};

export function NicknameModal({ isOpen, onClose, onConfirm }: Props) {
  if (!isOpen) return null;
  return <NicknameModalContent onClose={onClose} onConfirm={onConfirm} />;
}

function NicknameModalContent({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [nicknameInput, setNicknameInput] = useState("");

  function handleSave() {
    createUser(nicknameInput);
    refreshUserCache();
    onConfirm();
  }

  function handleSkip() {
    createUser();
    refreshUserCache();
    onConfirm();
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      showClose
      title="닉네임 입력"
      subtitle="NICKNAME"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="flex flex-col gap-4"
      >
        <p className="text-center text-xs text-[var(--text-muted)]">
          건너뛰면 기본 닉네임이 생성됩니다
        </p>
        <input
          type="text"
          value={nicknameInput}
          onChange={(e) =>
            setNicknameInput(e.target.value.slice(0, MAX_NICKNAME_LENGTH))
          }
          placeholder="Dasher_XXXX"
          maxLength={MAX_NICKNAME_LENGTH}
          autoFocus
          enterKeyHint="done"
          className="text-input text-center"
        />

        <div className="flex gap-3">
          <GameButton size="md" variant="primary" block type="submit">
            확인
          </GameButton>
          <GameButton size="md" variant="ghost" block onClick={handleSkip}>
            건너뛰기
          </GameButton>
        </div>
      </form>
    </Modal>
  );
}
