'use client';

import { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';

interface SoundManagerContextType {
  playHover: () => void;
  playClick: () => void;
  playSwoosh: () => void;
  playSuccess: () => void;
  playError: () => void;
  playSnap: () => void;
  playType: () => void;
  setEnabled: (enabled: boolean) => void;
  isEnabled: boolean;
}

const SoundManagerContext = createContext<SoundManagerContextType | null>(null);

/**
 * Sound Design System for "God Tier" UI
 *
 * Subtle, professional UI sounds that trigger psychological quality response
 * All sounds are synthesized on-the-fly using Web Audio API
 */
export function SoundManagerProvider({ children }: { children: React.ReactNode }) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  // Initialize AudioContext on first user interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    return audioContextRef.current;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Subtle hover sound - soft high-frequency tick
  const playHover = useCallback(() => {
    if (!isEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 2400;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  }, [isEnabled, getAudioContext]);

  // Click sound - satisfying pop
  const playClick = useCallback(() => {
    if (!isEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }, [isEnabled, getAudioContext]);

  // Swoosh sound - for page transitions
  const playSwoosh = useCallback(() => {
    if (!isEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Create noise
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.15);
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.2);
  }, [isEnabled, getAudioContext]);

  // Success sound - pleasant ascending chime
  const playSuccess = useCallback(() => {
    if (!isEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      osc.type = 'sine';

      const startTime = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.06, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }, [isEnabled, getAudioContext]);

  // Error sound - subtle low buzz
  const playError = useCallback(() => {
    if (!isEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 180;
    osc.type = 'sawtooth';

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }, [isEnabled, getAudioContext]);

  // Snap sound - for grid snapping/connections
  const playSnap = useCallback(() => {
    if (!isEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 200;
    osc.type = 'square';

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }, [isEnabled, getAudioContext]);

  // Type sound - for keyboard/terminal typing
  const playType = useCallback(() => {
    if (!isEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Randomize slightly for natural feel
    osc.frequency.value = 1800 + Math.random() * 400;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.02);
  }, [isEnabled, getAudioContext]);

  const value: SoundManagerContextType = {
    playHover,
    playClick,
    playSwoosh,
    playSuccess,
    playError,
    playSnap,
    playType,
    setEnabled: setIsEnabled,
    isEnabled,
  };

  return <SoundManagerContext.Provider value={value}>{children}</SoundManagerContext.Provider>;
}

export function useSounds() {
  const context = useContext(SoundManagerContext);
  if (!context) {
    // Return no-op functions if not in provider
    return {
      playHover: () => {},
      playClick: () => {},
      playSwoosh: () => {},
      playSuccess: () => {},
      playError: () => {},
      playSnap: () => {},
      playType: () => {},
      setEnabled: () => {
        /* no-op */
      },
      isEnabled: false,
    };
  }
  return context;
}
