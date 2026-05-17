"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createUser } from "@/features/user/userRepository";
import {
  getServerUserSnapshot,
  readCachedUser,
  refreshUserCache,
  subscribeUser,
} from "@/features/user/userStore";

export default function StartPage() {
  const user = useSyncExternalStore(
    subscribeUser,
    readCachedUser,
    getServerUserSnapshot,
  );
  const router = useRouter();
  const [nicknameInput, setNicknameInput] = useState<string>("");

  useEffect(() => {
    if (user) {
      router.replace("/play/rainy-day-01");
    }
  }, [user, router]);

  if (user) return null;

  function handleSave() {
    createUser(nicknameInput);
    refreshUserCache();
    router.push("/play/rainy-day-01");
  }

  function handleSkip() {
    createUser();
    refreshUserCache();
    router.push("/play/rainy-day-01");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-black text-white font-mono">
      <div className="flex flex-col items-center gap-10 px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-widest">닉네임 입력</h1>
          <p className="mt-3 text-xs opacity-50">
            건너뛰면 기본 닉네임이 생성됩니다
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="Dasher_XXXX"
            maxLength={20}
            autoFocus
            className="w-64 rounded border border-white/30 bg-white/10 px-4 py-2 text-white outline-none focus:border-white"
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
      </div>
    </main>
  );
}
