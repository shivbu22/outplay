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

/**
 * Synthesizes a realistic audio preview playback for call recordings / voicemail drops
 * using speech-band harmonic frequencies (300Hz-3kHz) with low-pass filtering.
 * Returns a cancel function.
 */
export function playCallRecordingSimulation(
  durationSec = 4,
  onEnd?: () => void
): () => void {
  const ctx = getAudioContext();
  if (!ctx) {
    onEnd?.();
    return () => {};
  }

  try {
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.1);
    gainNode.gain.setValueAtTime(0.08, now + durationSec - 0.2);
    gainNode.gain.linearRampToValueAtTime(0.001, now + durationSec);
    gainNode.connect(ctx.destination);

    // Filter to telephonic band (300Hz - 3400Hz standard G.711 voice band)
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(1.2, now);
    filter.connect(gainNode);

    // Harmonic oscillators simulating vocal formants
    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(220, now);
    osc1.connect(filter);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(440, now);
    osc2.connect(filter);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationSec);
    osc2.stop(now + durationSec);

    let isCleanedUp = false;
    const timer = setTimeout(() => {
      if (!isCleanedUp) {
        cleanup();
        onEnd?.();
      }
    }, durationSec * 1000);

    const cleanup = () => {
      isCleanedUp = true;
      clearTimeout(timer);
      try {
        osc1.disconnect();
        osc2.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      } catch {
        // Safe ignore
      }
    };

    return () => {
      try {
        osc1.stop();
        osc2.stop();
      } catch {
        // Ignore if already stopped
      }
      cleanup();
      onEnd?.();
    };
  } catch (err) {
    console.warn("Failed to play audio simulation:", err);
    onEnd?.();
    return () => {};
  }
}
