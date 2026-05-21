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

export function playBgm(src: string, volume = 0.5): void {
  bgmSrc = src;
  bgmVolume = volume;
  if (!isAudioEnabled() || typeof Audio === "undefined") return;
  if (!bgmAudio || !bgmAudio.src.endsWith(src)) {
    stopBgm();
    bgmAudio = new Audio(src);
    bgmAudio.loop = true;
    bgmAudio.volume = volume;
  }
  bgmAudio.play().catch(() => {
    const resume = () => {
      window.removeEventListener("pointerdown", resume);
      if (isAudioEnabled() && bgmAudio) bgmAudio.play().catch(() => {});
    };
    window.addEventListener("pointerdown", resume, { once: true });
  });
}

export function stopBgm(): void {
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
