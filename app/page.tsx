"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { readCachedUser } from "@/features/user/userStore";

export default function Home() {
  const router = useRouter();

  function handleStart() {
    const user = readCachedUser();
    if (user) {
      router.push("/play/rainy-day-01");
    } else {
      router.push("/start");
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-black text-white font-mono">
      <div className="flex flex-col items-center gap-12 px-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold tracking-widest">RAIN DASH</h1>
          <p className="mt-3 text-xs opacity-50 tracking-wider">
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
          <Link
            href="/how-to-play"
            className="rounded border border-white/30 px-8 py-3 text-center text-lg tracking-widest transition hover:bg-white/10"
          >
            게임 방법
          </Link>
          <Link
            href="/ranking"
            className="rounded border border-white/30 px-8 py-3 text-center text-lg tracking-widest transition hover:bg-white/10"
          >
            랭킹 보기
          </Link>
        </div>
      </div>
    </main>
  );
}
