"use client";

import { useState } from "react";

const LOADING_TIPS = [
  "멈추면 시간이 느려져요. 번개는 멈춰서 읽고 피하세요.",
  "빨리 달릴수록 점수가 더 쌓이지만, 비도 거세져요.",
  "우비를 입으면 비도 웅덩이도 안전해요. 단, 번개는 직접 피해야 해요.",
  "우산은 비만, 장화는 웅덩이만 막아줘요.",
  "처마·버스정류장·공중전화 아래에선 비를 피할 수 있어요.",
  "번개는 어떤 것도 막아주지 않아요. 직접 피하는 수밖에!",
  "물웅덩이는 점프(2단 점프까지!)로 넘으세요.",
  "안 다치고 빨리 도착할수록 클리어 보너스가 커져요.",
];

const RAIN = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 7.3 + 4) % 100,
  delay: (i % 7) * 0.22,
}));

type Props = {
  /** 0~1 표시용 진행률 */
  progress: number;
};

export function LoadingOverlay({ progress }: Props) {
  const [tip] = useState(
    () => LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)],
  );
  const pct = Math.round(progress * 100);

  return (
    <div className="game-loading">
      <div className="loading__rain" aria-hidden>
        {RAIN.map((d, i) => (
          <span
            key={i}
            style={{ left: `${d.left}%`, animationDelay: `${d.delay}s` }}
          />
        ))}
      </div>
      <img
        src="/sprites/ui/title.png"
        alt="RAIN DASH"
        className="game-loading__logo"
      />
      <div className="progress">
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="loading__meta">
        <span>LOADING</span>
        <span className="loading__pct">{pct}%</span>
      </div>
      <div className="loading__tip">
        <span className="loading__tip__tag">TIP</span>
        <span suppressHydrationWarning>{tip}</span>
      </div>
    </div>
  );
}
