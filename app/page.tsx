"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SettingsModal } from "@/features/settings/components/SettingsModal";
import { HowToPlayModal } from "@/features/tutorial/components/HowToPlayModal";
import { NicknameModal } from "@/features/user/components/NicknameModal";
import { readCachedUser } from "@/features/user/userStore";

export default function Home() {
  const router = useRouter();
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [howtoOpen, setHowtoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  function handleStart() {
    const user = readCachedUser();
    if (user) {
      router.push("/play/rainy-day-01");
    } else {
      setNicknameOpen(true);
    }
  }

  function handleNicknameConfirmed() {
    setNicknameOpen(false);
    router.push("/play/rainy-day-01");
  }

  return (
    <>
      <main className="flex min-h-dvh items-center justify-center bg-black font-mono text-white">
        <div className="flex flex-col items-center gap-12 px-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold tracking-widest">RAIN DASH</h1>
            <p className="mt-3 text-xs tracking-wider opacity-50">
              time moves fast when you move fast
            </p>
          </div>

          <div className="flex w-64 flex-col gap-3">
            <button
              onClick={handleStart}
              className="rounded bg-white px-8 py-3 text-lg font-bold tracking-widest text-black transition hover:bg-white/80"
            >
              게임 시작
            </button>
            <button
              onClick={() => setHowtoOpen(true)}
              className="rounded border border-white/30 px-8 py-3 text-lg tracking-widest transition hover:bg-white/10"
            >
              게임 방법
            </button>
            <Link
              href="/ranking"
              className="rounded border border-white/30 px-8 py-3 text-center text-lg tracking-widest transition hover:bg-white/10"
            >
              랭킹 보기
            </Link>
            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded border border-white/30 px-8 py-3 text-lg tracking-widest transition hover:bg-white/10"
            >
              설정
            </button>
          </div>
        </div>
      </main>

      <NicknameModal
        isOpen={nicknameOpen}
        onClose={() => setNicknameOpen(false)}
        onConfirm={handleNicknameConfirmed}
      />
      <HowToPlayModal
        isOpen={howtoOpen}
        onClose={() => setHowtoOpen(false)}
      />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
