"use client";

import { useState } from "react";
import { refreshRanking } from "@/features/ranking/rankingStore";
import {
  getSettings,
  resetAllData,
  setSoundEnabled,
} from "@/features/settings/settingsRepository";
import { refreshUserCache } from "@/features/user/userStore";
import { Modal } from "@/components/Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function SettingsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return <SettingsModalContent onClose={onClose} />;
}

function SettingsModalContent({ onClose }: { onClose: () => void }) {
  const [sound, setSound] = useState<boolean>(
    () => getSettings().soundEnabled,
  );
  const [confirmReset, setConfirmReset] = useState(false);

  function handleSoundToggle() {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetAllData();
    refreshUserCache();
    refreshRanking();
    setConfirmReset(false);
    onClose();
  }

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <h2 className="text-center text-xl font-bold tracking-widest">설정</h2>

        <div className="flex items-center justify-between">
          <span className="text-sm">사운드</span>
          <button
            onClick={handleSoundToggle}
            className={`w-20 rounded px-4 py-1 text-sm font-bold transition ${
              sound
                ? "bg-white text-black hover:bg-white/80"
                : "border border-white/30 text-white/70 hover:bg-white/10"
            }`}
          >
            {sound ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm">진행도 초기화</span>
            <span className="text-xs opacity-50">
              닉네임 · 점수 · 베스트 기록 모두 삭제
            </span>
          </div>
          <button
            onClick={handleReset}
            onMouseLeave={() => setConfirmReset(false)}
            className={`rounded px-4 py-1 text-sm font-bold transition ${
              confirmReset
                ? "bg-red-500 text-white hover:bg-red-600"
                : "border border-red-500/50 text-red-300 hover:bg-red-500/10"
            }`}
          >
            {confirmReset ? "정말 삭제?" : "초기화"}
          </button>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={onClose}
            className="rounded border border-white/30 px-6 py-2 text-sm transition hover:bg-white/10"
          >
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
}
