const PREF_KEY = "rd:audio";

let clickAudio: HTMLAudioElement | null = null;
let bgmAudio: HTMLAudioElement | null = null;
let bgmSrc: string | null = null;
let bgmVolume = 0.5;

export type AudioPref = "on" | "off";

const prefListeners = new Set<() => void>();

export function subscribeAudioPref(cb: () => void): () => void {
  prefListeners.add(cb);
  return () => {
    prefListeners.delete(cb);
  };
}

export function getAudioPref(): AudioPref | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(PREF_KEY);
  return v === "on" || v === "off" ? v : null;
}

export function isAudioEnabled(): boolean {
  return getAudioPref() === "on";
}

export function setAudioPref(on: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREF_KEY, on ? "on" : "off");
  if (on) {
    if (bgmSrc) playBgm(bgmSrc, bgmVolume);
  } else {
    stopBgm();
  }
  prefListeners.forEach((cb) => cb());
}

let resumeHandler: (() => void) | null = null;

function armResume(): void {
  if (resumeHandler) return;
  resumeHandler = () => {
    if (!isAudioEnabled() || !bgmAudio) {
      clearResume();
      return;
    }
    bgmAudio.play().then(clearResume, () => {});
  };

  window.addEventListener("click", resumeHandler);
  window.addEventListener("touchend", resumeHandler);
  window.addEventListener("keydown", resumeHandler);
}

function clearResume(): void {
  if (!resumeHandler) return;
  window.removeEventListener("click", resumeHandler);
  window.removeEventListener("touchend", resumeHandler);
  window.removeEventListener("keydown", resumeHandler);
  resumeHandler = null;
}

let visibilityBound = false;

// 탭 전환·브라우저 최소화 시 BGM 일시정지, 복귀 시 재개 (엘리먼트는 유지)
function ensureVisibilityHandler(): void {
  if (visibilityBound || typeof document === "undefined") return;
  visibilityBound = true;
  document.addEventListener("visibilitychange", () => {
    if (!bgmAudio) return;
    if (document.hidden) {
      bgmAudio.pause();
    } else if (isAudioEnabled()) {
      // 복귀 시 재개 — 막히면 다음 사용자 제스처에 재시도
      bgmAudio.play().then(clearResume, () => armResume());
    }
  });
}

export function playBgm(src: string, volume = 0.5): void {
  bgmSrc = src;
  bgmVolume = volume;
  if (!isAudioEnabled() || typeof Audio === "undefined") return;
  const reused = bgmAudio !== null && bgmAudio.src.endsWith(src);
  if (!reused) {
    stopBgm();
    bgmAudio = new Audio(src);
    bgmAudio.loop = true;
    bgmAudio.volume = volume;
  }
  if (!bgmAudio) return;
  ensureVisibilityHandler();
  armResume();
  bgmAudio.play().then(clearResume, (err: DOMException) => {
    if (err && err.name === "AbortError") clearResume();
  });
}

export function stopBgm(): void {
  clearResume();
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio = null;
  }
}

export function clearBgm(): void {
  stopBgm();
  bgmSrc = null;
}

export function playClick(): void {
  if (!isAudioEnabled() || typeof Audio === "undefined") return;
  if (!clickAudio) {
    clickAudio = new Audio("/audio/click.wav");
    clickAudio.volume = 0.5;
  }
  clickAudio.currentTime = 0;
  clickAudio.play().catch(() => {});
}

export function playSoundEffect(audio: HTMLAudioElement | null): void {
  if (!isAudioEnabled() || !audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export function playOnce(src: string, volume = 0.6): void {
  if (!isAudioEnabled() || typeof Audio === "undefined") return;
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {});
}
