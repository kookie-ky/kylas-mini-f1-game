import type { GameState, RivalTeam, DriverInfo, Weather, Compound } from "./types";
import {
  DRIVER_POOL,
  RIVAL_TEAM_NAMES,
} from "./data";

export const SAVE_KEY = "paddock-manager-save-v1";

export function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
export function randomWeather(): Weather {
  const r = Math.random();
  if (r < 0.6) return "Dry";
  if (r < 0.85) return "Damp";
  return "Wet";
}
export function compoundsForWeather(w: Weather): Compound[] {
  if (w === "Dry") return ["Soft", "Medium", "Hard"];
  if (w === "Damp") return ["Medium", "Hard", "Intermediate"];
  return ["Intermediate", "Wet"];
}

export function generateRivals(): RivalTeam[] {
  let nameIdx = 0;

  return RIVAL_TEAM_NAMES.map((team) => {
    const makeDriver = (): DriverInfo => {
      const src = { ...DRIVER_POOL[nameIdx % DRIVER_POOL.length] };
      nameIdx++;

      return {
        ...src,
        id: `rival-${nameIdx}`,
        wage: 0,
        morale: 75,
        contractRounds: 99,
      };
    };

    return {
  name: team.name,
  carRating: team.rating,
  drivers: [makeDriver(), makeDriver()] as [DriverInfo, DriverInfo],
};
  });
}

export function upgradeCost(currentLevel: number) {
  return 10 + Math.ceil(currentLevel / 8) * 5;
}

export function moraleColor(morale: number) {
  if (morale >= 65) return "#00C97A"; // PALETTE.green
  if (morale >= 40) return "#F5A623"; // PALETTE.amber
  return "#E10600"; // PALETTE.red
}

export function loadSave(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}
export function persistSave(game: GameState | null) {
  if (typeof window === "undefined") return;
  try {
    if (game) window.localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    else window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* storage unavailable — silently skip */
  }
}

/* Procedural track shape generator (seeded) — used by <TrackShape /> */
export function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
export function mulberry32(seed: number) {
  let t = seed;
  return function () {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
export function trackPoints(seed: number, n = 11): [number, number][] {
  const rnd = mulberry32(seed);
  const cx = 60;
  const cy = 60;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const r = 30 + rnd() * 24;
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  return pts;
}