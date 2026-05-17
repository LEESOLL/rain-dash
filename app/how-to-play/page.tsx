import Link from "next/link";

export default function HowToPlayPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-black text-white font-mono">
      <div className="flex w-full max-w-xl flex-col items-center gap-10 px-8">
        <h1 className="text-4xl font-bold tracking-widest">게임 방법</h1>

        <div className="w-full space-y-3 text-sm leading-relaxed opacity-80">
          <p>
            <span className="opacity-50">←/A, →/D</span> — 좌우 이동
          </p>
          <p>
            <span className="opacity-50">SPACE, ↑, W</span> — 점프 (2단 점프
            가능)
          </p>
          <p>
            <span className="opacity-50">R</span> — 사망/승리 후 재시작
          </p>
          <p>
            <span className="opacity-50">ESC</span> — 메인으로
          </p>

          <p className="!mt-6">
            가만히 있으면 시간이 느려집니다. 움직이면 빨라집니다.
          </p>
          <p>비를 피하거나 쉘터 아래로 들어가 안전 위치를 잡으세요.</p>
          <p>물 웅덩이는 점프로 넘으세요.</p>
          <p>번개는 쉘터로 막을 수 없습니다.</p>
          <p>아이템을 먹어 일정 시간 보호 효과를 받으세요.</p>
          <p>골인 지점의 깃발까지 도착하면 클리어입니다.</p>
        </div>

        <Link
          href="/"
          className="rounded border border-white/30 px-6 py-2 text-sm transition hover:bg-white/10"
        >
          ← 메인으로
        </Link>
      </div>
    </main>
  );
}
