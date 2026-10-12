// Standard Dual-Tone Multi-Frequency (DTMF) acoustic frequency pairs (Hz)
const DTMF_FREQUENCIES: Record<string, [number, number]> = {
  "1": [697, 1209],
  "2": [697, 1336],
  "3": [697, 1477],
  "4": [770, 1209],
  "5": [770, 1336],
  "6": [770, 1477],
  "7": [852, 1209],
  "8": [852, 1336],
  "9": [852, 1477],
  "*": [941, 1209],
  "0": [941, 1336],
  "#": [941, 1477],
};

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtxClass) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new AudioCtxClass();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Plays the official ITU dual-frequency DTMF tone for a given keypad character.
 * Duration is 140ms with exponential ramp-down to avoid audio clicks.
 */
export function playDtmfTone(char: string, durationMs = 140): void {
  const freqs = DTMF_FREQUENCIES[char];
  if (!freqs) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const [f1, f2] = freqs;
    const now = ctx.currentTime;
    const durationSec = durationMs / 1000;

    // Master gain node for smooth envelope
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
    masterGain.connect(ctx.destination);

    // Oscillator 1 (Low group)
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(f1, now);
    osc1.connect(masterGain);

    // Oscillator 2 (High group)
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(f2, now);
    osc2.connect(masterGain);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + durationSec);
    osc2.stop(now + durationSec);

    // Auto-cleanup after stop
    setTimeout(() => {
      try {
        osc1.disconnect();
        osc2.disconnect();
        masterGain.disconnect();
      } catch {
        // Safe ignore
      }
    }, durationMs + 50);
  } catch (err) {
    console.warn("DTMF tone playback encountered an error:", err);
  }
}
