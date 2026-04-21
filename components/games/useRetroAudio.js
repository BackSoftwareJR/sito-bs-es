import { useCallback, useRef, useEffect } from 'react';

// Web Audio API context should be a singleton, but initialized on first user interaction
let audioCtx = null;

export function useRetroAudio() {
  const isEnabled = useRef(true);

  const initCtx = useCallback(() => {
    if (!audioCtx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      } catch (e) {
        console.warn('Web Audio API not supported');
        isEnabled.current = false;
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }, []);

  // Utility to play tone
  const playTone = useCallback((frequency, type, duration, vol = 0.1, slideToFreq = null) => {
    if (!isEnabled.current) return;
    initCtx();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type; // 'square', 'sawtooth', 'triangle', 'sine'
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      
      if (slideToFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideToFreq, audioCtx.currentTime + duration);
      }

      // Envelope: instant attack, quick decay
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }, [initCtx]);

  // Noise generator for explosions
  const playNoise = useCallback((duration, vol = 0.3) => {
    if (!isEnabled.current) return;
    initCtx();
    if (!audioCtx) return;

    try {
      const bufferSize = audioCtx.sampleRate * duration;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = buffer;

      // Filter the noise to sound more like a low explosion
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + duration);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noiseSource.start();
    } catch (e) {
      console.warn("Audio noise error", e);
    }
  }, [initCtx]);

  // Expose specific sound effect functions
  return {
    playShoot: useCallback(() => playTone(880, 'square', 0.1, 0.05, 110), [playTone]),
    playLaser: useCallback(() => playTone(600, 'sawtooth', 0.15, 0.05, 100), [playTone]),
    playExplosion: useCallback(() => playNoise(0.4, 0.4), [playNoise]),
    playEat: useCallback(() => playTone(600, 'square', 0.1, 0.05, 1200), [playTone]),
    playPowerup: useCallback(() => {
      playTone(400, 'square', 0.1, 0.05, 800);
      setTimeout(() => playTone(600, 'square', 0.1, 0.05, 1200), 100);
      setTimeout(() => playTone(800, 'square', 0.2, 0.05, 1600), 200);
    }, [playTone]),
    playJump: useCallback(() => playTone(250, 'sine', 0.2, 0.1, 600), [playTone]),
    playHit: useCallback(() => playTone(150, 'sawtooth', 0.2, 0.2, 50), [playTone]),
    playGameOver: useCallback(() => {
      playTone(300, 'sawtooth', 0.3, 0.2, 100);
      setTimeout(() => playTone(200, 'sawtooth', 0.4, 0.2, 80), 300);
      setTimeout(() => playTone(100, 'sawtooth', 0.8, 0.2, 40), 700);
    }, [playTone]),
  };
}
