"use client";

import { useState } from "react";
import { refreshRanking } from "@/features/ranking/rankingStore";
import { resetAllData } from "@/features/settings/settingsRepository";
import { refreshUserCache } from "@/features/user/userStore";
import { GameButton } from "@/components/GameButton";
import { Modal } from "@/components/Modal";
import { isAudioEnabled, setAudioPref } from "@/lib/sound";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function SettingsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return <SettingsModalContent onClose={onClose} />;
}

function SettingsModalContent({ onClose }: { onClose: () => void }) {
  const [sound, setSound] = useState<boolean>(() => isAudioEnabled());
  const [confirmReset, setConfirmReset] = useState(false);

  function handleSoundToggle() {
    const next = !sound;
    setSound(next);
    setAudioPref(next);
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
          <GameButton
            size="sm"
            variant={sound ? "primary" : "secondary"}
            className="w-20"
            onClick={handleSoundToggle}
          >
            {sound ? "ON" : "OFF"}
          </GameButton>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm">진행도 초기화</span>
            <span className="text-xs opacity-50">
              닉네임 · 점수 · 베스트 기록 모두 삭제
            </span>
          </div>
          <GameButton
            size="sm"
            variant={confirmReset ? "danger" : "secondary"}
            onClick={handleReset}
            onMouseLeave={() => setConfirmReset(false)}
          >
            {confirmReset ? "정말 삭제?" : "초기화"}
          </GameButton>
        </div>

        <div className="flex justify-center pt-2">
          <GameButton size="md" onClick={onClose}>
            닫기
          </GameButton>
        </div>
      </div>
    </Modal>
  );
}
