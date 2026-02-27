import { useCallback, useRef } from "react";

// Simple audio synthesis using Web Audio API for wind chime sounds
export function useAudioSystem() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const playChime = useCallback((frequency?: number) => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    const freq = frequency || [523, 587, 659, 784, 880, 1047][Math.floor(Math.random() * 6)];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, ctx.currentTime + 2);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 3);
  }, [getCtx]);

  const playBloomMelody = useCallback(() => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    // A beautiful ascending melody
    const notes = [523, 659, 784, 1047, 1319, 1568];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.4);

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.4);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.4 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.4 + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.4);
      osc.stop(ctx.currentTime + i * 0.4 + 2.5);
    });
  }, [getCtx]);

  const startAmbient = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    // Random wind chime sounds
    const scheduleNext = () => {
      const delay = 2000 + Math.random() * 5000;
      intervalRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          playChime();
          scheduleNext();
        }
      }, delay) as unknown as ReturnType<typeof setInterval>;
    };

    playChime(659); // Initial chime
    scheduleNext();
  }, [playChime]);

  const stopAmbient = useCallback(() => {
    isPlayingRef.current = false;
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  }, []);

  return { startAmbient, stopAmbient, playChime, playBloomMelody };
}
