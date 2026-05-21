"use client";

import { useState } from "react";
import { GameButton } from "@/components/GameButton";
import { Modal } from "@/components/Modal";
import { createUser } from "@/features/user/userRepository";
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
      panelClassName="rounded-2xl border-2 border-white bg-white/90 backdrop-blur-md shadow-xl"
    >
      <div className="flex flex-col items-center gap-6 text-sky-900">
        <div className="text-center">
          <h2 className="mb-1 text-xl font-bold tracking-widest text-sky-400">
            닉네임 입력
          </h2>
          <p className="text-xs text-sky-700/60">
            건너뛰면 기본 닉네임이 생성됩니다
          </p>
        </div>

        <input
          type="text"
          value={nicknameInput}
          onChange={(e) => setNicknameInput(e.target.value)}
          placeholder="Dasher_XXXX"
          maxLength={20}
          autoFocus
          className="w-full rounded-2xl border-2 border-sky-200 bg-white px-4 py-2.5 text-center text-sky-900 outline-none transition placeholder:text-sky-300 focus:border-sky-400"
        />

        <div className="flex gap-3">
          <GameButton size="md" variant="primary" onClick={handleSave}>
            확인
          </GameButton>
          <GameButton size="md" variant="light" onClick={handleSkip}>
            건너뛰기
          </GameButton>
        </div>
      </div>
    </Modal>
  );
}
