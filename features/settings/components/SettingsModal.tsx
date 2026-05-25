"use client";

import { useState } from "react";
import { refreshRanking } from "@/features/ranking/rankingStore";
import { resetAllData } from "@/features/settings/settingsRepository";
import { refreshUserCache } from "@/features/user/userStore";
import { GameButton } from "@/components/GameButton";
import { Modal } from "@/components/Modal";
import { ToggleButton } from "@/components/ToggleButton";
import { isAudioEnabled, setAudioPref } from "@/lib/sound";
import { useIsTouch } from "@/lib/touch";

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
  const isTouch = useIsTouch();

  function handleSoundToggle(next: boolean) {
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
    <Modal
      isOpen={true}
      onClose={onClose}
      title="설정"
      subtitle="SETTINGS"
      showClose
      footer={
        <>
          {isTouch && (
            <p className="text-center text-xs leading-relaxed text-[var(--color-danger-500)]">
              모바일에서는 닉네임 설정이 불가능합니다.
              <br />
              닉네임 설정은 PC로 접속해 주세요.
            </p>
          )}
          <GameButton block onClick={onClose}>
            닫기
          </GameButton>
        </>
      }
    >
      <div className="setting-row">
        <div>
          <div className="setting-row__label">사운드</div>
          <div className="setting-row__hint">효과음 · 배경음</div>
        </div>
        <div className="w-28">
          <ToggleButton on={sound} onChange={handleSoundToggle} block />
        </div>
      </div>

      <div className="setting-row">
        <div>
          <div className="setting-row__label">진행도 초기화</div>
          <div className="setting-row__hint">
            닉네임 · 점수 · 베스트 기록 모두 삭제
          </div>
        </div>
        <div className="w-28">
          <GameButton
            size="sm"
            block
            variant={confirmReset ? "danger" : "secondary"}
            onClick={handleReset}
            onMouseLeave={() => setConfirmReset(false)}
          >
            {confirmReset ? "정말 삭제?" : "초기화"}
          </GameButton>
        </div>
      </div>
    </Modal>
  );
}
