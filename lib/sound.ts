let clickAudio: HTMLAudioElement | null = null;

/** 버튼 클릭 효과음 재생 */
export function playClick(): void {
  if (typeof Audio === "undefined") return;
  if (!clickAudio) {
    clickAudio = new Audio("/audio/click.wav");
    clickAudio.volume = 0.5;
  }
  clickAudio.currentTime = 0;
  clickAudio.play().catch(() => {});
}
