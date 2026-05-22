"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { GameButton } from "@/components/GameButton";
import { RankingModal } from "@/features/ranking/components/RankingModal";
import { AudioPromptModal } from "@/features/settings/components/AudioPromptModal";
import { SettingsModal } from "@/features/settings/components/SettingsModal";
import { StageModal } from "@/features/stage/components/StageModal";
import { HowToPlayModal } from "@/features/tutorial/components/HowToPlayModal";
import { ensureAuth } from "@/features/user/authRepository";
import { NicknameModal } from "@/features/user/components/NicknameModal";
import { readCachedUser } from "@/features/user/userStore";
import { setMainView, useMainView } from "@/lib/mainView";
import {
  clearBgm,
  getAudioPref,
  playBgm,
  setAudioPref,
  subscribeAudioPref,
} from "@/lib/sound";

export default function Home() {
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [howtoOpen, setHowtoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const view = useMainView();

  const audioPref = useSyncExternalStore(
    subscribeAudioPref,
    getAudioPref,
    () => "off" as const,
  );
  const audioPromptOpen = audioPref === null;

  useEffect(() => {
    ensureAuth().catch((e) => console.error("anonymous auth failed", e));
  }, []);

  useEffect(() => {
    playBgm("/audio/waiting_bgm.mp3", 0.8);
    return () => clearBgm();
  }, []);

  function handleAudioChoose(enabled: boolean) {
    setAudioPref(enabled);
  }

  function handleStart() {
    if (readCachedUser()) {
      setMainView("stage");
    } else {
      setNicknameOpen(true);
    }
  }

  function handleNicknameConfirmed() {
    setNicknameOpen(false);
    setMainView("stage");
  }

  return (
    <>
      <main className="relative flex h-dvh items-center justify-center overflow-hidden font-mono text-white">
        <div className="animate-bg-slide pointer-events-none absolute inset-0 z-0 flex">
          <img
            src="/sprites/background/street-bg.png"
            alt=""
            className="h-full w-auto max-w-none select-none"
          />
          <img
            src="/sprites/background/street-bg.png"
            alt=""
            className="h-full w-auto max-w-none select-none"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-0 bg-black/15" />

        {view === null && (
          <div className="relative z-10 flex flex-col items-center gap-[clamp(1rem,4vh,2rem)] px-8">
            <div className="flex flex-col items-center text-center">
              <img
                src="/sprites/ui/title.png"
                alt="RAIN DASH"
                className="w-[min(68vw,360px)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
              />
              <p className="mt-1 text-xs tracking-wider opacity-80 [text-shadow:_0_1px_4px_rgb(0_0_0_/_85%)]">
                time moves fast when you move fast
              </p>
            </div>

            <div className="flex w-56 flex-col gap-[clamp(0.5rem,1.5vh,0.75rem)] sm:w-64">
              <GameButton variant="primary" size="lg" onClick={handleStart}>
                게임 시작
              </GameButton>
              <GameButton size="md" onClick={() => setHowtoOpen(true)}>
                게임 방법
              </GameButton>
              <GameButton size="md" onClick={() => setMainView("ranking")}>
                랭킹 보기
              </GameButton>
              <GameButton size="md" onClick={() => setSettingsOpen(true)}>
                설정
              </GameButton>
            </div>
          </div>
        )}
      </main>

      {view === "stage" && <StageModal onClose={() => setMainView(null)} />}
      {view === "ranking" && <RankingModal onClose={() => setMainView(null)} />}

      {(nicknameOpen || howtoOpen) && (
        <div className="fixed left-4 top-4 z-[60]">
          <GameButton
            size="sm"
            onClick={() => {
              setNicknameOpen(false);
              setHowtoOpen(false);
            }}
          >
            ✕ 닫기
          </GameButton>
        </div>
      )}

      <NicknameModal
        isOpen={nicknameOpen}
        onClose={() => setNicknameOpen(false)}
        onConfirm={handleNicknameConfirmed}
      />
      <HowToPlayModal isOpen={howtoOpen} onClose={() => setHowtoOpen(false)} />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <AudioPromptModal isOpen={audioPromptOpen} onChoose={handleAudioChoose} />
    </>
  );
}
