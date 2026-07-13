"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Sound keys map to files you drop in /public/sounds/.
// Use short royalty-free .mp3/.ogg clips — see the file list below.
export type SoundKey =
  | "click"
  | "hover"
  | "engineIdle"
  | "engineRev"
  | "gearShift"
  | "pitGun"
  | "pitLimiter"
  | "crowdCheer"
  | "radioBeep"
  | "drsBeep"
  | "rainAmbience"
  | "thunder"
  | "safetyCarSiren"
  | "podiumApplause"
  | "confettiPop"
  | "victoryMusic";

// Expected files — add these to /public/sounds/. Missing files fail silently.
const SOUND_FILES: Record<SoundKey, string> = {
  click: "/sounds/click.mp3",
  hover: "/sounds/hover.mp3",
  engineIdle: "/sounds/engine-idle.mp3",
  engineRev: "/sounds/engine-rev.mp3",
  gearShift: "/sounds/gear-shift.mp3",
  pitGun: "/sounds/pit-gun.mp3",
  pitLimiter: "/sounds/pit-limiter.mp3",
  crowdCheer: "/sounds/crowd-cheer.mp3",
  radioBeep: "/sounds/radio-beep.mp3",
  drsBeep: "/sounds/drs-beep.mp3",
  rainAmbience: "/sounds/rain-ambience.mp3",
  thunder: "/sounds/thunder.mp3",
  safetyCarSiren: "/sounds/safety-car-siren.mp3",
  podiumApplause: "/sounds/podium-applause.mp3",
  confettiPop: "/sounds/confetti-pop.mp3",
  victoryMusic: "/sounds/victory-music.mp3",
};

const MUTE_KEY = "paddock-manager-muted";
const VOLUME_KEY = "paddock-manager-volume";

/**
 * Global sound manager. Call useSound() from any component.
 * Mute + volume preference persists across sessions.
 */
export function useSound() {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const pool = useRef<Map<SoundKey, HTMLAudioElement>>(new Map());
  const loopingRef = useRef<Set<SoundKey>>(new Set());

  useEffect(() => {
    try {
      const storedMute = window.localStorage.getItem(MUTE_KEY);
      const storedVol = window.localStorage.getItem(VOLUME_KEY);
      if (storedMute) setMuted(storedMute === "1");
      if (storedVol) setVolume(Number(storedVol));
    } catch {
      /* ignore */
    }
  }, []);

  const persistMute = useCallback((v: boolean) => {
    setMuted(v);
    try {
      window.localStorage.setItem(MUTE_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const persistVolume = useCallback((v: number) => {
    setVolume(v);
    try {
      window.localStorage.setItem(VOLUME_KEY, String(v));
    } catch {
      /* ignore */
    }
  }, []);

  const getAudio = useCallback((key: SoundKey) => {
    let el = pool.current.get(key);
    if (!el) {
      el = new Audio(SOUND_FILES[key]);
      pool.current.set(key, el);
    }
    return el;
  }, []);

  const play = useCallback(
    (key: SoundKey, opts?: { loop?: boolean; volume?: number }) => {
      if (muted) return;
      try {
        const el = getAudio(key);
        el.loop = !!opts?.loop;
        el.volume = clamp01((opts?.volume ?? 1) * volume);
        el.currentTime = 0;
        // Missing/blocked audio files should never crash the UI.
        void el.play().catch(() => {});
        if (opts?.loop) loopingRef.current.add(key);
      } catch {
        /* ignore playback errors — sound is decorative, never required */
      }
    },
    [muted, volume, getAudio]
  );

  const stop = useCallback(
    (key: SoundKey) => {
      const el = pool.current.get(key);
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
      loopingRef.current.delete(key);
    },
    []
  );

  const stopAll = useCallback(() => {
    pool.current.forEach((el) => el.pause());
    loopingRef.current.clear();
  }, []);

  useEffect(() => {
    if (muted) stopAll();
  }, [muted, stopAll]);

  return { play, stop, stopAll, muted, setMuted: persistMute, volume, setVolume: persistVolume };
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}