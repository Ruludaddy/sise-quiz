// ============================================================
// 사운드 (WebAudio 비프음)
//  · On/Off, 백그라운드 진입 시 suspend, 복귀 시 resume (지침 5-3)
//  · 외부 오디오 파일 없이 합성음만 사용해요.
// ============================================================

let audioCtx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

/** 사용자 제스처(터치) 시점에 호출해 오디오 컨텍스트를 깨워요. */
export function ensureAudio(): void {
  if (audioCtx == null) {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new Ctor();
    } catch {
      audioCtx = null;
    }
  }
  if (audioCtx != null && audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
}

export function beep(freq: number, dur = 0.09, type: OscillatorType = 'sine', vol = 0.14): void {
  if (!enabled || audioCtx == null || audioCtx.state !== 'running') return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

/** 결과에 따른 피드백 사운드 */
export function beepForScore(score: number): void {
  if (score >= 80) beep(720, 0.12, 'triangle', 0.15);
  else if (score >= 60) beep(520, 0.1, 'sine', 0.13);
  else beep(200, 0.2, 'sawtooth', 0.14);
}

/** 앱 시작 시 1회 호출: 백그라운드 전환 시 오디오 정리/복구 */
export function initSoundLifecycle(): void {
  document.addEventListener('visibilitychange', () => {
    if (audioCtx == null) return;
    if (document.hidden) {
      void audioCtx.suspend();
    } else if (enabled) {
      void audioCtx.resume();
    }
  });
}
