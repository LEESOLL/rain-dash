"use client";

import { useState } from "react";
import { createUser } from "@/features/user/userRepository";
import { refreshUserCache } from "@/features/user/userStore";
import { Modal } from "@/components/Modal";

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
    <Modal isOpen={true} onClose={onClose}>
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="mb-1 text-xl font-bold tracking-widest">닉네임 입력</h2>
          <p className="text-xs opacity-50">
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
          className="w-full rounded border border-white/30 bg-white/10 px-4 py-2 text-white outline-none focus:border-white"
        />

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="rounded bg-white px-6 py-2 text-sm font-bold text-black transition hover:bg-white/80"
          >
            확인
          </button>
          <button
            onClick={handleSkip}
            className="rounded border border-white/30 px-6 py-2 text-sm transition hover:bg-white/10"
          >
            건너뛰기
          </button>
        </div>
      </div>
    </Modal>
  );
}
