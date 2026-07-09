"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bebas_Neue, Space_Mono, Work_Sans } from "next/font/google";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"] });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"] });
const workSans = Work_Sans({ weight: ["400", "500"], subsets: ["latin"] });

const PALETTE = {
  parchment: "#F1E8D6",
  paperLine: "#DECBA0",
  ink: "#201C14",
  green: "#163832",
  amber: "#E2A33B",
  brick: "#AD3B2A",
};

const SAVE_KEY = "paddock-manager-save-v1";

/* =====================================================================
   TYPES
   ===================================================================== */
type Screen = "menu" | "newCareer" | "continue" | "settings" | "hub" | "raceWeekend";
type HubTab = "overview" | "garage" | "drivers" | "calendar" | "standings";
type Compound = "Soft" | "Medium" | "Hard" | "Intermediate" | "Wet";
type Weather = "Dry" | "Damp" | "Wet";

interface DriverStats {
  pace: number;
  consistency: number;
  tyreManagement: number;
}
interface DriverInfo {
  id: string;
  name: string;
  nationality: string;
  stats: DriverStats;
  wage: number;
  morale: number;
  contractRounds: number;
}
interface CarStats {
  aero: number;
  powerUnit: number;
  reliability: number;
}
interface Livery {
  id: string;
  name: string;
  colors: string[];
}
interface Emblem {
  id: string;
  label: string;
  colors: [string, string];
}
interface RivalTeam {
  name: string;
  carRating: number;
  drivers: [DriverInfo, DriverInfo];
}
interface Track {
  id: string;
  name: string;
  country: string;
  laps: number;
}
interface RoundRecord {
  track: Track;
  completed: boolean;
  weather: Weather;
}
interface RaceResultRow {
  driverId: string;
  driverName: string;
  team: string;
  position: number;
  points: number;
  dnf: boolean;
  isPlayer: boolean;
}
interface GameState {
  teamName: string;
  livery: Livery;
  logo: string;
  budget: number;
  rdPoints: number;
  carStats: CarStats;
  drivers: [DriverInfo, DriverInfo];
  rivals: RivalTeam[];
  calendar: RoundRecord[];
  roundIndex: number;
  driverStandings: Record<string, { name: string; team: string; points: number }>;
  constructorStandings: Record<string, number>;
  lastNews: string;
}

/* =====================================================================
   STATIC DATA
   ===================================================================== */
const LIVERIES: Livery[] = [
  { id: "forest", name: "Forest & Gold", colors: [PALETTE.green, PALETTE.amber, PALETTE.ink] },
  { id: "brick", name: "Brick & Bone", colors: [PALETTE.brick, PALETTE.parchment, PALETTE.ink] },
  { id: "midnight", name: "Midnight Racer", colors: ["#1B2A4A", "#E2A33B", "#F1E8D6"] },
];

// F1-inspired emblem badges (shield split into two team-style colours) instead of animal icons.
const EMBLEMS: Emblem[] = [
  { id: "scarlet", label: "Scarlet Shield", colors: ["#D40000", "#FFF200"] }, // Ferrari-esque
  { id: "apex-navy", label: "Apex Navy", colors: ["#1E3A8A", "#FFD500"] }, // Red Bull-esque
  { id: "azure", label: "Azure Wing", colors: ["#0057B8", "#FFFFFF"] }, // Williams-esque
  { id: "papaya", label: "Papaya Blaze", colors: ["#FF8000", "#000000"] }, // McLaren-esque
  { id: "silver-teal", label: "Silver Teal", colors: ["#00A19C", "#C6C6C6"] }, // Mercedes-esque
  { id: "rose-blue", label: "Rosé Blue", colors: ["#0090D0", "#FF6FA8"] }, // Alpine-esque
];

const DRIVER_POOL: DriverInfo[] = [
  { id: "d1", name: "Mateo Ferraz", nationality: "Brazil", stats: { pace: 78, consistency: 70, tyreManagement: 74 }, wage: 8, morale: 70, contractRounds: 0 },
  { id: "d2", name: "Elin Kovac", nationality: "Slovenia", stats: { pace: 74, consistency: 80, tyreManagement: 68 }, wage: 7, morale: 70, contractRounds: 0 },
  { id: "d3", name: "Jonas Wetteland", nationality: "Norway", stats: { pace: 66, consistency: 72, tyreManagement: 70 }, wage: 4, morale: 70, contractRounds: 0 },
  { id: "d4", name: "Priya Anand", nationality: "India", stats: { pace: 70, consistency: 65, tyreManagement: 77 }, wage: 5, morale: 70, contractRounds: 0 },
  { id: "d5", name: "Lucas Ferreira", nationality: "Portugal", stats: { pace: 83, consistency: 68, tyreManagement: 65 }, wage: 12, morale: 70, contractRounds: 0 },
  { id: "d6", name: "Noa Steinberg", nationality: "Israel", stats: { pace: 60, consistency: 75, tyreManagement: 80 }, wage: 3, morale: 70, contractRounds: 6 },
  { id: "d7", name: "Kenji Osei", nationality: "Ghana", stats: { pace: 64, consistency: 60, tyreManagement: 62 }, wage: 2, morale: 70, contractRounds: 6 },
  { id: "d8", name: "Camille Duval", nationality: "France", stats: { pace: 76, consistency: 74, tyreManagement: 71 }, wage: 9, morale: 70, contractRounds: 0 },
];
const STARTER_DRIVER_IDS = ["d6", "d7"];

const TRACKS: Track[] = [
  { id: "bhr", name: "Bahrain International Circuit", country: "Bahrain", laps: 57 },
  { id: "aus", name: "Albert Park Circuit", country: "Australia", laps: 58 },
  { id: "jpn", name: "Suzuka Circuit", country: "Japan", laps: 53 },
  { id: "mon", name: "Circuit de Monaco", country: "Monaco", laps: 78 },
  { id: "gbr", name: "Silverstone Circuit", country: "United Kingdom", laps: 52 },
  { id: "bel", name: "Circuit de Spa-Francorchamps", country: "Belgium", laps: 44 },
  { id: "ita", name: "Autodromo Nazionale Monza", country: "Italy", laps: 53 },
  { id: "bra", name: "Interlagos Circuit", country: "Brazil", laps: 71 },
];

const RIVAL_TEAM_NAMES: { name: string; rating: number }[] = [
  { name: "Vantage Motorsport", rating: 90 },
  { name: "Ferrous Grand Prix", rating: 86 },
  { name: "Meridian Racing", rating: 76 },
  { name: "Vulcan GP", rating: 73 },
  { name: "Northstar Racing", rating: 68 },
  { name: "Aurora Motorsport", rating: 65 },
  { name: "Talon Racing", rating: 58 },
  { name: "Obsidian GP", rating: 52 },
  { name: "Crimson Arrow Racing", rating: 47 },
];
const RIVAL_DRIVER_NAMES = [
  "Aksel Berg", "Rian Cole", "Théo Marchal", "Diego Salas", "Finn Whittaker", "Yusuke Amano",
  "Marco Bellandi", "Owen Prescott", "Ines Farias", "Tomas Vidal", "Sami Rahal", "Lucas Byrne",
  "Aleksander Voss", "Kian Okafor", "Nico Verstraete", "Ravi Chandran", "Milo Andersson", "Petra Halász",
];

const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const COMPOUND_PACE: Record<Compound, number> = { Soft: 6, Medium: 2, Hard: -2, Intermediate: -9, Wet: -16 };
const COMPOUND_DEGRADATION: Record<Compound, number> = { Soft: -7, Medium: -3, Hard: 0, Intermediate: -4, Wet: -1 };
const WEATHER_META: Record<Weather, { label: string; accent: string; blurb: string }> = {
  Dry: { label: "Dry", accent: PALETTE.amber, blurb: "Clear skies — slicks only." },
  Damp: { label: "Damp", accent: "#6B8CAE", blurb: "Greasy track — mediums, hards, or intermediates." },
  Wet: { label: "Wet", accent: "#1B2A4A", blurb: "Standing water — wets or intermediates required." },
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
function randomWeather(): Weather {
  const r = Math.random();
  if (r < 0.6) return "Dry";
  if (r < 0.85) return "Damp";
  return "Wet";
}
function compoundsForWeather(w: Weather): Compound[] {
  if (w === "Dry") return ["Soft", "Medium", "Hard"];
  if (w === "Damp") return ["Medium", "Hard", "Intermediate"];
  return ["Intermediate", "Wet"];
}

function generateRivals(): RivalTeam[] {
  let nameIdx = 0;
  return RIVAL_TEAM_NAMES.map((t) => {
    const makeDriver = (): DriverInfo => {
      const name = RIVAL_DRIVER_NAMES[nameIdx % RIVAL_DRIVER_NAMES.length];
      nameIdx += 1;
      const base = t.rating - 15;
      return {
        id: `rival-${nameIdx}`,
        name,
        nationality: "—",
        stats: {
          pace: Math.round(clamp(base + rand(-6, 10), 35, 96)),
          consistency: Math.round(clamp(base + rand(-8, 8), 40, 95)),
          tyreManagement: Math.round(clamp(base + rand(-8, 8), 40, 95)),
        },
        wage: 0,
        morale: 75,
        contractRounds: 99,
      };
    };
    return { name: t.name, carRating: t.rating, drivers: [makeDriver(), makeDriver()] };
  });
}

function upgradeCost(currentLevel: number) {
  return 10 + Math.ceil(currentLevel / 8) * 5;
}

/* =====================================================================
   PERSISTENCE
   ===================================================================== */
function loadSave(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}
function persistSave(game: GameState | null) {
  if (typeof window === "undefined") return;
  try {
    if (game) window.localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    else window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* storage unavailable — silently skip */
  }
}

/* =====================================================================
   PROCEDURAL TRACK SHAPES
   ===================================================================== */
function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
function mulberry32(seed: number) {
  let t = seed;
  return function () {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function trackPoints(seed: number, n = 11): [number, number][] {
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
function TrackShape({ trackId, accent, className = "" }: { trackId: string; accent: string; className?: string }) {
  const pts = useMemo(() => trackPoints(hashStr(trackId)), [trackId]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <path d={d} fill="none" stroke={accent} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[0][0]} cy={pts[0][1]} r="3.4" fill={PALETTE.brick} />
      <rect x={pts[0][0] - 1} y={pts[0][1] - 7} width="2" height="14" fill={PALETTE.ink} transform={`rotate(20 ${pts[0][0]} ${pts[0][1]})`} />
    </svg>
  );
}

/* =====================================================================
   SHARED UI PIECES
   ===================================================================== */
function CheckeredFlag({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-4 grid-rows-4 w-10 h-10 overflow-hidden rounded-[2px] ${className}`} aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const dark = (row + col) % 2 === 0;
        return <div key={i} style={{ background: dark ? PALETTE.ink : PALETTE.parchment }} />;
      })}
    </div>
  );
}

function LocalClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className={`${mono.className} tabular-nums`}>{time ?? "--:--:--"}</span>;
}

function EmblemBadge({ emblemId, size = 32 }: { emblemId: string; size?: number }) {
  const emblem = EMBLEMS.find((e) => e.id === emblemId) ?? EMBLEMS[0];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 2 L36 8 V20 C36 30 29 36 20 38 C11 36 4 30 4 20 V8 Z" fill={emblem.colors[0]} />
      <path d="M20 2 L36 8 V20 C36 28 31 34 22 37.5 L20 38 L20 2 Z" fill={emblem.colors[1]} opacity="0.88" />
      <path d="M20 2 L36 8 V20 C36 30 29 36 20 38 C11 36 4 30 4 20 V8 Z" fill="none" stroke={PALETTE.ink} strokeWidth="1.5" />
    </svg>
  );
}

function Mascot({ excited = false, accent = PALETTE.green, size = "normal" }: { excited?: boolean; accent?: string; size?: "normal" | "small" }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const loop = () => {
      const delay = 2200 + Math.random() * 2600;
      window.setTimeout(() => {
        if (cancelled) return;
        setBlink(true);
        window.setTimeout(() => !cancelled && setBlink(false), 140);
        loop();
      }, delay);
    };
    loop();
    return () => {
      cancelled = true;
    };
  }, []);
  const dim = size === "small" ? "w-14 h-16" : "w-20 h-24 sm:w-24 sm:h-28";
  return (
    <svg viewBox="0 0 120 140" className={`${dim} ${excited ? "mascot-jump" : "mascot-idle"}`} style={{ overflow: "visible" }} aria-hidden="true">
      <ellipse cx="60" cy="132" rx="26" ry="5" fill={PALETTE.ink} opacity="0.15" />
      <rect x="42" y="95" width="12" height="28" rx="4" fill={PALETTE.ink} />
      <rect x="66" y="95" width="12" height="28" rx="4" fill={PALETTE.ink} />
      <rect x="34" y="55" width="52" height="46" rx="10" fill={accent} />
      <circle cx="60" cy="60" r="6" fill={PALETTE.amber} />
      <rect x="82" y="58" width="10" height="30" rx="5" fill={accent} className={excited ? "mascot-wave" : ""} style={{ transformOrigin: "82px 60px" }} />
      <rect x="20" y="62" width="10" height="26" rx="5" fill={accent} />
      <circle cx="60" cy="34" r="24" fill="#E8C79B" />
      <path d="M36 30 a24 24 0 0 1 48 0" stroke={PALETTE.ink} strokeWidth="4" fill="none" />
      <circle cx="36" cy="34" r="5" fill={PALETTE.ink} />
      {blink ? (
        <>
          <line x1="50" y1="34" x2="56" y2="34" stroke={PALETTE.ink} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="64" y1="34" x2="70" y2="34" stroke={PALETTE.ink} strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="53" cy="34" r="2.6" fill={PALETTE.ink} />
          <circle cx="67" cy="34" r="2.6" fill={PALETTE.ink} />
        </>
      )}
      <path d="M50 43 Q60 49 70 43" stroke={PALETTE.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="86" y="80" width="22" height="6" rx="3" fill={PALETTE.ink} transform="rotate(35 86 80)" />
    </svg>
  );
}

function DrivingCar({ fast, color }: { fast: boolean; color: string }) {
  return (
    <div className={`car-track ${fast ? "car-fast" : "car-slow"}`} aria-hidden="true">
      <svg viewBox="0 0 64 28" className="w-14 h-6">
        <rect x="4" y="10" width="48" height="10" rx="4" fill={color} />
        <path d="M14 10 L22 2 H42 L50 10 Z" fill={color} />
        <rect x="24" y="4" width="14" height="6" rx="2" fill={PALETTE.parchment} opacity="0.85" />
        <circle cx="16" cy="21" r="5" fill={PALETTE.ink} />
        <circle cx="48" cy="21" r="5" fill={PALETTE.ink} />
      </svg>
    </div>
  );
}

function StatBar({ label, value, accent, max = 99 }: { label: string; value: number; accent: string; max?: number }) {
  return (
    <div className="mb-4">
      <div className={`${mono.className} flex justify-between text-xs uppercase tracking-widest mb-1`} style={{ color: accent }}>
        <span>{label}</span>
        <span>{Math.round(value)}/{max}</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: PALETTE.paperLine }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${clamp((value / max) * 100, 0, 100)}%`, background: accent }} />
      </div>
    </div>
  );
}

function moraleColor(morale: number) {
  if (morale >= 65) return PALETTE.green;
  if (morale >= 40) return PALETTE.amber;
  return PALETTE.brick;
}

function BackRow({ onBack, label, accent, centered = false }: { onBack: () => void; label: string; accent: string; centered?: boolean }) {
  return (
    <div className={`flex items-center gap-3 mb-8 ${centered ? "justify-center" : ""}`}>
      <button onClick={onBack} className={`${mono.className} text-xs uppercase tracking-widest border rounded-md px-3 py-2`} style={{ borderColor: PALETTE.ink }} aria-label="Back">
        ◂
      </button>
      <h2 className={`${bebas.className} text-3xl uppercase tracking-wide`} style={{ color: accent }}>
        {label}
      </h2>
    </div>
  );
}

/* =====================================================================
   MENU SCREEN
   ===================================================================== */
function MenuScreen({ onSelect, hasSave }: { onSelect: (s: Screen) => void; hasSave: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const menuItems = [
    { grid: "P1", label: "New Career", caption: "Start a team from the ground up", accent: PALETTE.green, screen: "newCareer" as Screen },
    { grid: "P2", label: "Continue Season", caption: hasSave ? "Resume your championship" : "Pick up where you left off", accent: PALETTE.amber, screen: "continue" as Screen },
    { grid: "P3", label: "Settings", caption: "Tune audio, difficulty, and more", accent: PALETTE.brick, screen: "settings" as Screen },
  ];
  const hoveredAccent = menuItems.find((m) => m.grid === hovered)?.accent ?? PALETTE.green;

  return (
    <div className="w-full max-w-xl">
      <p className={`${mono.className} text-xs sm:text-sm tracking-[0.25em] uppercase mb-6`} style={{ color: PALETTE.green }}>
        Season 2026 · Team Principal Mode
      </p>
      <div className="relative mb-4">
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 -z-10 flex flex-col gap-1 opacity-90">
          <span className="block h-2 w-24 sm:w-32 -skew-x-12" style={{ background: PALETTE.green }} />
          <span className="block h-2 w-24 sm:w-32 -skew-x-12" style={{ background: PALETTE.amber }} />
          <span className="block h-2 w-24 sm:w-32 -skew-x-12" style={{ background: PALETTE.brick }} />
        </div>
        <h1 className={`${bebas.className} leading-[0.85] tracking-wide uppercase text-[clamp(3.2rem,13vw,7rem)]`}>
          Paddock
          <br />
          <span style={{ color: PALETTE.brick }}>Manager</span>
        </h1>
      </div>
      <div className="flex items-end justify-between mb-8 gap-4">
        <p className={`${workSans.className} text-base sm:text-lg`} style={{ color: `${PALETTE.ink}CC` }}>
          Sign your drivers. Set the strategy. Chase the double title.
        </p>
        <Mascot excited={!!hovered} accent={hoveredAccent} />
      </div>
      <nav aria-label="Main menu">
        <ul className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <li key={item.grid}>
              <button
                onClick={() => onSelect(item.screen)}
                onMouseEnter={() => setHovered(item.grid)}
                onMouseLeave={() => setHovered((h) => (h === item.grid ? null : h))}
                className="group w-full flex items-center gap-4 rounded-md border px-5 py-4 text-left transition-colors duration-150"
                style={{
                  borderColor: PALETTE.ink,
                  borderLeftWidth: "6px",
                  borderLeftColor: item.accent,
                  background: hovered === item.grid ? PALETTE.ink : PALETTE.parchment,
                  color: hovered === item.grid ? PALETTE.parchment : PALETTE.ink,
                }}
              >
                <span className={`${mono.className} text-sm font-bold w-8 shrink-0`} style={{ color: item.accent }}>
                  {item.grid}
                </span>
                <span className="flex-1">
                  <span className={`${bebas.className} block text-2xl tracking-wide uppercase`}>{item.label}</span>
                  <span className={`${workSans.className} block text-sm opacity-70`}>{item.caption}</span>
                </span>
                <span className="transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true">▸</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="relative h-8 mt-6">
        <DrivingCar fast={!!hovered} color={hoveredAccent} />
      </div>
      <div className={`${mono.className} flex items-center justify-between text-xs tracking-widest uppercase pt-4 border-t`} style={{ borderColor: PALETTE.paperLine, color: `${PALETTE.ink}99` }}>
        <span>Paddock Manager © 2026</span>
        <span className="flex items-center gap-2">Local <LocalClock /></span>
      </div>
    </div>
  );
}

/* =====================================================================
   NEW CAREER SCREEN
   ===================================================================== */
function NewCareerScreen({ onBack, onConfirm }: { onBack: () => void; onConfirm: (teamName: string, livery: Livery, emblemId: string) => void }) {
  const [name, setName] = useState("");
  const [liveryId, setLiveryId] = useState(LIVERIES[0].id);
  const [emblemId, setEmblemId] = useState(EMBLEMS[0].id);
  const activeLivery = LIVERIES.find((l) => l.id === liveryId)!;

  return (
    <div className="w-full max-w-xl">
      <BackRow onBack={onBack} label="New Career" accent={PALETTE.green} />
      <label className={`${mono.className} block text-xs uppercase tracking-widest mb-2`} style={{ color: PALETTE.green }}>Team name (Constructor entry)</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Ironbark Racing"
        maxLength={24}
        className={`${bebas.className} w-full text-3xl uppercase tracking-wide bg-transparent border-b-2 px-1 py-2 mb-8 outline-none`}
        style={{ borderColor: PALETTE.ink, color: PALETTE.ink }}
      />
      <label className={`${mono.className} block text-xs uppercase tracking-widest mb-3`} style={{ color: PALETTE.green }}>Livery</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {LIVERIES.map((l) => (
          <button key={l.id} onClick={() => setLiveryId(l.id)} className="rounded-md border px-3 py-3 text-left" style={{ borderColor: PALETTE.ink, borderWidth: liveryId === l.id ? 3 : 1, background: PALETTE.parchment }}>
            <div className="flex gap-1 mb-2">
              {l.colors.map((c, i) => (<span key={i} className="block h-3 flex-1 rounded-sm" style={{ background: c }} />))}
            </div>
            <span className={`${workSans.className} text-xs`}>{l.name}</span>
          </button>
        ))}
      </div>
      <label className={`${mono.className} block text-xs uppercase tracking-widest mb-3`} style={{ color: PALETTE.green }}>Emblem</label>
      <div className="flex flex-wrap gap-3 mb-8">
        {EMBLEMS.map((e) => (
          <button key={e.id} onClick={() => setEmblemId(e.id)} title={e.label} className="w-14 h-14 rounded-md border flex items-center justify-center p-1.5" style={{ borderColor: PALETTE.ink, borderWidth: emblemId === e.id ? 3 : 1, background: emblemId === e.id ? PALETTE.ink + "0D" : PALETTE.parchment }}>
            <EmblemBadge emblemId={e.id} size={34} />
          </button>
        ))}
      </div>
      <div className={`${workSans.className} text-sm mb-6 rounded-md border px-4 py-3`} style={{ borderColor: PALETTE.paperLine, color: `${PALETTE.ink}AA` }}>
        You'll start with a cost cap of <strong>40 budget units</strong>, a baseline car (40 Aero / 40 Power Unit / 40 Reliability), and two rookie drivers already under contract. Build from there across an 8-round calendar with its own weather forecast.
      </div>
      <button
        onClick={() => name.trim() && onConfirm(name.trim(), activeLivery, emblemId)}
        disabled={!name.trim()}
        className={`${mono.className} w-full uppercase tracking-widest text-sm py-4 rounded-md transition-opacity disabled:opacity-40`}
        style={{ background: PALETTE.green, color: PALETTE.parchment }}
      >
        Enter the paddock ▸
      </button>
    </div>
  );
}

/* =====================================================================
   CONTINUE SCREEN
   ===================================================================== */
function ContinueScreen({ onBack, onNewCareer, onResume, hasSave, teamName }: { onBack: () => void; onNewCareer: () => void; onResume: () => void; hasSave: boolean; teamName?: string }) {
  return (
    <div className="w-full max-w-xl flex flex-col items-center text-center gap-5 py-6">
      <BackRow onBack={onBack} label="Continue Season" accent={PALETTE.amber} centered />
      <Mascot accent={PALETTE.amber} />
      {hasSave ? (
        <>
          <p className={`${workSans.className} text-base`} style={{ color: `${PALETTE.ink}CC` }}>
            {teamName} is fuelled up and waiting in the garage. Your save was loaded from this browser's storage.
          </p>
          <button onClick={onResume} className={`${mono.className} text-xs uppercase tracking-widest px-5 py-3 rounded-md`} style={{ background: PALETTE.amber, color: PALETTE.ink }}>
            Resume season ▸
          </button>
        </>
      ) : (
        <>
          <p className={`${workSans.className} text-base`} style={{ color: `${PALETTE.ink}CC` }}>
            No saved season on this device yet. Start a career and it will be saved automatically after every race.
          </p>
          <button onClick={onNewCareer} className={`${mono.className} text-xs uppercase tracking-widest border px-5 py-3 rounded-md`} style={{ borderColor: PALETTE.ink }}>
            Start New Career ▸
          </button>
        </>
      )}
    </div>
  );
}

/* =====================================================================
   SETTINGS SCREEN
   ===================================================================== */
function SettingsScreen({ onBack, onResetSave }: { onBack: () => void; onResetSave: () => void }) {
  const [volume, setVolume] = useState(70);
  const [difficulty, setDifficulty] = useState<"rookie" | "pro" | "legend">("pro");
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="w-full max-w-xl">
      <BackRow onBack={onBack} label="Settings" accent={PALETTE.brick} />
      <label className={`${mono.className} block text-xs uppercase tracking-widest mb-3`} style={{ color: PALETTE.brick }}>Engine & crowd volume — {volume}%</label>
      <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full mb-10" style={{ accentColor: PALETTE.brick }} />
      <label className={`${mono.className} block text-xs uppercase tracking-widest mb-3`} style={{ color: PALETTE.brick }}>Difficulty (grid strength of rival constructors)</label>
      <div className="flex gap-2 mb-10">
        {(["rookie", "pro", "legend"] as const).map((d) => (
          <button key={d} onClick={() => setDifficulty(d)} className={`${workSans.className} flex-1 capitalize rounded-md border px-3 py-3 text-sm`} style={{ borderColor: PALETTE.ink, borderWidth: difficulty === d ? 3 : 1, background: difficulty === d ? PALETTE.ink : PALETTE.parchment, color: difficulty === d ? PALETTE.parchment : PALETTE.ink }}>
            {d}
          </button>
        ))}
      </div>
      <label className={`${mono.className} block text-xs uppercase tracking-widest mb-3`} style={{ color: PALETTE.brick }}>Save data</label>
      {!confirming ? (
        <button onClick={() => setConfirming(true)} className={`${mono.className} text-xs uppercase tracking-widest border rounded-md px-4 py-3`} style={{ borderColor: PALETTE.brick, color: PALETTE.brick }}>
          Erase saved season
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <span className={`${workSans.className} text-sm`}>Erase your saved season permanently?</span>
          <button onClick={() => { onResetSave(); setConfirming(false); }} className={`${mono.className} text-xs uppercase tracking-widest rounded-md px-3 py-2`} style={{ background: PALETTE.brick, color: PALETTE.parchment }}>
            Confirm
          </button>
          <button onClick={() => setConfirming(false)} className={`${mono.className} text-xs uppercase tracking-widest border rounded-md px-3 py-2`} style={{ borderColor: PALETTE.ink }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   HUB — Overview / Garage / Drivers / Calendar / Standings
   ===================================================================== */
function HubScreen({ game, setGame, onExit, onEnterRace }: { game: GameState; setGame: (g: GameState) => void; onExit: () => void; onEnterRace: () => void }) {
  const [tab, setTab] = useState<HubTab>("overview");
  const nextRound = game.calendar[game.roundIndex];

  const tabs: { id: HubTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "garage", label: "Garage" },
    { id: "drivers", label: "Driver Market" },
    { id: "calendar", label: "Calendar" },
    { id: "standings", label: "Championship" },
  ];

  function upgrade(stat: keyof CarStats) {
    const level = game.carStats[stat];
    const cost = upgradeCost(level);
    if (game.rdPoints < cost || level >= 99) return;
    setGame({ ...game, rdPoints: game.rdPoints - cost, carStats: { ...game.carStats, [stat]: Math.min(99, level + 3) } });
  }

  function signDriver(candidate: DriverInfo, slot: 0 | 1) {
    if (game.budget < candidate.wage) return;
    const drivers = [...game.drivers] as [DriverInfo, DriverInfo];
    drivers[slot] = { ...candidate, contractRounds: 6, morale: 70 };
    setGame({ ...game, drivers, budget: game.budget - candidate.wage });
  }

  function renewContract(slot: 0 | 1) {
    const d = game.drivers[slot];
    const cost = 8 + d.wage;
    if (game.budget < cost || d.morale < 35) return;
    const drivers = [...game.drivers] as [DriverInfo, DriverInfo];
    drivers[slot] = { ...d, contractRounds: 6, morale: clamp(d.morale + 10, 0, 100) };
    setGame({ ...game, drivers, budget: game.budget - cost });
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <EmblemBadge emblemId={game.logo} size={40} />
          <div>
            <h2 className={`${bebas.className} text-3xl uppercase leading-none`} style={{ color: game.livery.colors[0] }}>{game.teamName}</h2>
            <span className={`${mono.className} text-xs uppercase tracking-widest`} style={{ color: `${PALETTE.ink}88` }}>Round {game.roundIndex + 1} of {game.calendar.length}</span>
          </div>
        </div>
        <button onClick={onExit} className={`${mono.className} text-xs uppercase tracking-widest border rounded-md px-3 py-2`} style={{ borderColor: PALETTE.ink }}>Menu</button>
      </div>

      {game.lastNews && (
        <div className={`${workSans.className} text-sm mb-6 rounded-md border-l-4 px-4 py-3`} style={{ borderColor: PALETTE.amber, background: `${PALETTE.amber}14`, color: `${PALETTE.ink}CC` }}>
          {game.lastNews}
        </div>
      )}

      <div className="flex gap-4 mb-6 text-sm">
        <div className={`${mono.className} rounded-md border px-3 py-2`} style={{ borderColor: PALETTE.paperLine }}>
          <span className="block text-[10px] uppercase tracking-widest opacity-60">Budget</span>
          <span className="text-lg" style={{ color: PALETTE.green }}>{game.budget}</span>
        </div>
        <div className={`${mono.className} rounded-md border px-3 py-2`} style={{ borderColor: PALETTE.paperLine }}>
          <span className="block text-[10px] uppercase tracking-widest opacity-60">R&D Points</span>
          <span className="text-lg" style={{ color: PALETTE.amber }}>{game.rdPoints}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4" style={{ borderColor: PALETTE.paperLine }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`${mono.className} text-xs uppercase tracking-widest px-3 py-2 rounded-md`} style={{ background: tab === t.id ? PALETTE.ink : "transparent", color: tab === t.id ? PALETTE.parchment : PALETTE.ink, border: `1px solid ${PALETTE.ink}` }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div className="flex items-center gap-6 mb-6">
            <Mascot accent={game.livery.colors[0]} size="small" />
            <p className={`${workSans.className} text-sm`} style={{ color: `${PALETTE.ink}CC` }}>
              {nextRound ? <>Next up: <strong>{nextRound.track.name}</strong>, {nextRound.track.country} — {nextRound.track.laps} laps. Forecast: <strong style={{ color: WEATHER_META[nextRound.weather].accent }}>{WEATHER_META[nextRound.weather].label}</strong>.</> : "Season complete — check the Championship tab for the final result."}
            </p>
          </div>
          {nextRound && (
            <div className="flex items-center gap-4 mb-8 rounded-md border px-4 py-3" style={{ borderColor: PALETTE.paperLine }}>
              <TrackShape trackId={nextRound.track.id} accent={game.livery.colors[0]} className="w-20 h-20 shrink-0" />
              <div className={`${workSans.className} text-xs`} style={{ color: `${PALETTE.ink}99` }}>
                Circuit layout is procedurally sketched from the track name — an abstract read on the corner sequence, not a scale map.
              </div>
            </div>
          )}
          <StatBar label="Aero" value={game.carStats.aero} accent={PALETTE.green} />
          <StatBar label="Power Unit" value={game.carStats.powerUnit} accent={PALETTE.amber} />
          <StatBar label="Reliability" value={game.carStats.reliability} accent={PALETTE.brick} />
          <div className="grid grid-cols-2 gap-4 mt-6">
            {game.drivers.map((d, i) => (
              <div key={i} className="rounded-md border px-4 py-3" style={{ borderColor: PALETTE.paperLine }}>
                <span className={`${bebas.className} block text-xl uppercase`}>{d.name}</span>
                <span className={`${mono.className} text-xs opacity-70 block mb-2`}>Pace {d.stats.pace} · Consistency {d.stats.consistency} · Tyres {d.stats.tyreManagement}</span>
                <StatBar label="Morale" value={d.morale} accent={moraleColor(d.morale)} max={100} />
                <span className={`${mono.className} text-[10px] uppercase tracking-widest`} style={{ color: d.contractRounds <= 1 ? PALETTE.brick : `${PALETTE.ink}77` }}>
                  {d.contractRounds > 0 ? `Contract: ${d.contractRounds} round${d.contractRounds === 1 ? "" : "s"} left` : "Out of contract"}
                </span>
              </div>
            ))}
          </div>
          {nextRound && (
            <button onClick={onEnterRace} className={`${mono.className} w-full mt-8 uppercase tracking-widest text-sm py-4 rounded-md`} style={{ background: PALETTE.brick, color: PALETTE.parchment }}>
              Enter Race Weekend ▸
            </button>
          )}
        </div>
      )}

      {tab === "garage" && (
        <div>
          <p className={`${workSans.className} text-sm mb-6`} style={{ color: `${PALETTE.ink}AA` }}>Spend R&D points earned from race weekends on car development. Each upgrade costs more as the stat climbs.</p>
          {(["aero", "powerUnit", "reliability"] as const).map((stat) => {
            const label = stat === "aero" ? "Aero" : stat === "powerUnit" ? "Power Unit" : "Reliability";
            const accent = stat === "aero" ? PALETTE.green : stat === "powerUnit" ? PALETTE.amber : PALETTE.brick;
            const cost = upgradeCost(game.carStats[stat]);
            return (
              <div key={stat} className="mb-6">
                <StatBar label={label} value={game.carStats[stat]} accent={accent} />
                <button onClick={() => upgrade(stat)} disabled={game.rdPoints < cost || game.carStats[stat] >= 99} className={`${mono.className} text-xs uppercase tracking-widest border rounded-md px-4 py-2 disabled:opacity-30`} style={{ borderColor: accent, color: accent }}>
                  Upgrade (+3) — {cost} R&D
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "drivers" && (
        <div>
          <p className={`${workSans.className} text-sm mb-4`} style={{ color: `${PALETTE.ink}AA` }}>Current lineup</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {game.drivers.map((d, i) => (
              <div key={i} className="rounded-md border px-4 py-3" style={{ borderColor: PALETTE.ink, borderWidth: 2 }}>
                <span className={`${bebas.className} block text-xl uppercase`}>{d.name}</span>
                <span className={`${mono.className} text-xs opacity-70 block mb-2`}>{d.nationality} · Pace {d.stats.pace}</span>
                <StatBar label="Morale" value={d.morale} accent={moraleColor(d.morale)} max={100} />
                <div className="flex items-center justify-between mt-2">
                  <span className={`${mono.className} text-[10px] uppercase tracking-widest`} style={{ color: d.contractRounds <= 1 ? PALETTE.brick : `${PALETTE.ink}77` }}>
                    {d.contractRounds > 0 ? `${d.contractRounds} round${d.contractRounds === 1 ? "" : "s"} left` : "Out of contract"}
                  </span>
                  <button
                    onClick={() => renewContract(i as 0 | 1)}
                    disabled={game.budget < 8 + d.wage || d.morale < 35}
                    className={`${mono.className} text-[10px] uppercase tracking-widest border rounded px-2 py-1.5 disabled:opacity-30`}
                    style={{ borderColor: PALETTE.green, color: PALETTE.green }}
                  >
                    Renew — {8 + d.wage}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className={`${workSans.className} text-sm mb-3`} style={{ color: `${PALETTE.ink}AA` }}>Free agents</p>
          <div className="flex flex-col gap-2">
            {DRIVER_POOL.filter((c) => !game.drivers.some((d) => d.id === c.id)).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border px-4 py-3" style={{ borderColor: PALETTE.paperLine }}>
                <div>
                  <span className={`${bebas.className} block text-lg uppercase`}>{c.name}</span>
                  <span className={`${mono.className} text-xs opacity-70`}>{c.nationality} · Pace {c.stats.pace} · Consistency {c.stats.consistency} · Tyres {c.stats.tyreManagement} · Wage {c.wage}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => signDriver(c, 0)} disabled={game.budget < c.wage} className={`${mono.className} text-[10px] uppercase tracking-widest border rounded px-2 py-2 disabled:opacity-30`} style={{ borderColor: PALETTE.green, color: PALETTE.green }}>
                    Sign → Seat 1
                  </button>
                  <button onClick={() => signDriver(c, 1)} disabled={game.budget < c.wage} className={`${mono.className} text-[10px] uppercase tracking-widest border rounded px-2 py-2 disabled:opacity-30`} style={{ borderColor: PALETTE.brick, color: PALETTE.brick }}>
                    Sign → Seat 2
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "calendar" && (
        <div className="flex flex-col gap-2">
          {game.calendar.map((r, i) => (
            <div key={r.track.id} className="flex items-center gap-3 rounded-md border px-4 py-3" style={{ borderColor: i === game.roundIndex ? PALETTE.brick : PALETTE.paperLine, borderWidth: i === game.roundIndex ? 2 : 1 }}>
              <TrackShape trackId={r.track.id} accent={r.completed ? `${PALETTE.ink}55` : game.livery.colors[0]} className="w-12 h-12 shrink-0" />
              <div className="flex-1">
                <span className={`${mono.className} text-xs opacity-60 mr-2`}>R{i + 1}</span>
                <span className={`${bebas.className} text-lg uppercase`}>{r.track.name}</span>
                <span className={`${workSans.className} text-xs block opacity-70`}>{r.track.country} · {r.track.laps} laps · <span style={{ color: WEATHER_META[r.weather].accent }}>{WEATHER_META[r.weather].label}</span></span>
              </div>
              <span className={`${mono.className} text-xs uppercase tracking-widest`} style={{ color: r.completed ? PALETTE.green : i === game.roundIndex ? PALETTE.brick : `${PALETTE.ink}66` }}>
                {r.completed ? "Complete" : i === game.roundIndex ? "Next" : "Upcoming"}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === "standings" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h3 className={`${bebas.className} text-xl uppercase mb-3`} style={{ color: PALETTE.green }}>Drivers' Championship</h3>
            <ol className="flex flex-col gap-1">
              {Object.values(game.driverStandings).sort((a, b) => b.points - a.points).map((d, i) => (
                <li key={d.name} className={`${mono.className} text-sm flex justify-between border-b py-1`} style={{ borderColor: PALETTE.paperLine }}>
                  <span>{i + 1}. {d.name} <span className="opacity-60">({d.team})</span></span>
                  <span>{d.points}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className={`${bebas.className} text-xl uppercase mb-3`} style={{ color: PALETTE.brick }}>Constructors' Championship</h3>
            <ol className="flex flex-col gap-1">
              {Object.entries(game.constructorStandings).sort((a, b) => b[1] - a[1]).map(([team, pts], i) => (
                <li key={team} className={`${mono.className} text-sm flex justify-between border-b py-1`} style={{ borderColor: PALETTE.paperLine }}>
                  <span>{i + 1}. {team}</span>
                  <span>{pts}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   TELEMETRY PANEL (shown live during the race stage)
   ===================================================================== */
function TelemetryPanel({ drivers, tyres, weather }: { drivers: [DriverInfo, DriverInfo]; tyres: [Compound, Compound]; weather: Weather }) {
  const [tick, setTick] = useState(0);
  const [traces, setTraces] = useState<[number[], number[]]>([[0], [0]]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => Math.min(t + 1, 14)), 420);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (tick === 0) return;
    setTraces((prev) => {
      const next: [number[], number[]] = [[...prev[0]], [...prev[1]]];
      [0, 1].forEach((i) => {
        const deg = Math.abs(COMPOUND_DEGRADATION[tyres[i]]);
        const wearFactor = 1 - drivers[i].stats.tyreManagement / 150;
        const last = next[i][next[i].length - 1] ?? 0;
        next[i].push(clamp(last + deg * wearFactor * 1.7 + rand(-1, 2.5), 0, 100));
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return (
    <div className="rounded-md border px-4 py-4 mb-6 text-left" style={{ borderColor: PALETTE.paperLine }}>
      <div className={`${mono.className} text-xs uppercase tracking-widest mb-3`} style={{ color: PALETTE.green }}>
        Live Telemetry — Lap {Math.min(tick, 14)} · {WEATHER_META[weather].label}
      </div>
      {drivers.map((d, i) => {
        const wear = traces[i][traces[i].length - 1];
        const pts = traces[i]
          .map((v, idx) => `${(idx / Math.max(1, traces[i].length - 1)) * 100},${24 - (v / 100) * 24}`)
          .join(" ");
        return (
          <div key={d.id} className="mb-3 last:mb-0">
            <div className={`${workSans.className} flex justify-between text-xs mb-1`}>
              <span><strong>{d.name}</strong> — {tyres[i]}</span>
              <span>Tyre wear {Math.round(wear)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: PALETTE.paperLine }}>
              <div className="h-full" style={{ width: `${wear}%`, background: PALETTE.brick }} />
            </div>
            <svg viewBox="0 0 100 24" className="w-full h-6">
              <polyline points={pts} fill="none" stroke={PALETTE.green} strokeWidth="1.5" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

/* =====================================================================
   RACE WEEKEND — Briefing → Qualifying → Strategy → Safety Car → Racing → Results
   ===================================================================== */
type RaceStage = "briefing" | "qualifying" | "strategy" | "racing" | "safetyCar" | "results";

function RaceWeekendScreen({ game, setGame, onDone }: { game: GameState; setGame: (g: GameState) => void; onDone: () => void }) {
  const round = game.calendar[game.roundIndex];
  const track = round.track;
  const weather = round.weather;
  const availableCompounds = compoundsForWeather(weather);

  const [stage, setStage] = useState<RaceStage>("briefing");
  const [grid, setGrid] = useState<{ id: string; name: string; team: string; isPlayer: boolean; score: number }[]>([]);
  const [tyres, setTyres] = useState<[Compound, Compound]>([availableCompounds[0], availableCompounds[0]]);
  const [safetyCar, setSafetyCar] = useState(false);
  const [pitCalls, setPitCalls] = useState<[boolean, boolean]>([true, true]);
  const [results, setResults] = useState<RaceResultRow[]>([]);
  const [headline, setHeadline] = useState("");

  function runQualifying() {
    const entries: { id: string; name: string; team: string; isPlayer: boolean; score: number }[] = [];
    const playerCarRating = (game.carStats.aero + game.carStats.powerUnit) / 2;
    game.drivers.forEach((d) => {
      const moraleFactor = 0.94 + (d.morale / 100) * 0.12;
      entries.push({ id: d.id, name: d.name, team: game.teamName, isPlayer: true, score: (playerCarRating * 0.5 + d.stats.pace * 0.5) * moraleFactor + rand(-8, 8) });
    });
    game.rivals.forEach((r) => {
      r.drivers.forEach((d) => {
        entries.push({ id: d.id, name: d.name, team: r.name, isPlayer: false, score: r.carRating * 0.5 + d.stats.pace * 0.5 + rand(-8, 8) });
      });
    });
    entries.sort((a, b) => b.score - a.score);
    setGrid(entries);
    setSafetyCar(Math.random() < 0.35);
    setStage("qualifying");
  }

  function finalizeRace() {
    const carPerf = (game.carStats.aero + game.carStats.powerUnit) / 2;
    const rows: (RaceResultRow & { score: number })[] = grid.map((g, gridPos) => {
      const isPlayer = g.isPlayer;
      const driverIdx = isPlayer ? game.drivers.findIndex((d) => d.id === g.id) : -1;
      const driver = isPlayer ? game.drivers[driverIdx] : game.rivals.flatMap((r) => r.drivers).find((d) => d.id === g.id)!;
      const rating = isPlayer ? carPerf : game.rivals.find((r) => r.name === g.team)!.carRating;
      const reliability = isPlayer ? game.carStats.reliability : rating;
      const compound: Compound = isPlayer ? tyres[driverIdx] : availableCompounds[Math.floor(Math.random() * availableCompounds.length)];
      const tyreMgmt = driver.stats.tyreManagement;
      const degradation = COMPOUND_DEGRADATION[compound] * (1 - tyreMgmt / 150);
      const consistencyVariance = ((100 - driver.stats.consistency) / 100) * rand(-10, 10);
      const pitBonus = safetyCar ? (isPlayer ? (pitCalls[driverIdx] ? 4 : -4) : Math.random() < 0.6 ? 3 : -3) : 0;
      const gridBonus = (20 - gridPos) * 0.4;
      const moraleFactor = isPlayer ? 0.92 + (driver.morale / 100) * 0.16 : 1;
      const dnfChance = (100 - reliability) * 0.12;
      const dnf = Math.random() * 100 < dnfChance;
      const score = dnf ? -999 + Math.random() : (rating * 0.4 + driver.stats.pace * 0.3 + gridBonus + COMPOUND_PACE[compound] + degradation + consistencyVariance + pitBonus) * moraleFactor;
      return { driverId: g.id, driverName: g.name, team: g.team, position: 0, points: 0, dnf, isPlayer, score };
    });
    rows.sort((a, b) => b.score - a.score);
    rows.forEach((r, i) => {
      r.position = i + 1;
      r.points = POINTS_TABLE[i] ?? 0;
    });

    const winner = rows[0];
    setHeadline(safetyCar ? `Safety Car flew mid-race in ${WEATHER_META[weather].label.toLowerCase()} conditions — ${winner.team}'s ${winner.driverName} held on to win at ${track.name}.` : `${WEATHER_META[weather].label} race, lights-to-flag pace from ${winner.driverName} — victory for ${winner.team} at ${track.name}.`);
    setResults(rows);

    const newDriverStandings = { ...game.driverStandings };
    const newConstructorStandings = { ...game.constructorStandings };
    rows.forEach((r) => {
      if (!newDriverStandings[r.driverId]) newDriverStandings[r.driverId] = { name: r.driverName, team: r.team, points: 0 };
      newDriverStandings[r.driverId].points += r.points;
      newConstructorStandings[r.team] = (newConstructorStandings[r.team] ?? 0) + r.points;
    });

    const playerRows = rows.filter((r) => r.isPlayer);
    const prize = playerRows.reduce((sum, r) => sum + (11 - Math.min(r.position, 11)), 0);
    const rd = playerRows.reduce((sum, r) => sum + (r.dnf ? 2 : 6 - Math.min(Math.floor(r.position / 4), 4)), 0);

    // Update morale & contracts for player drivers based on how the weekend went.
    const updatedDrivers = game.drivers.map((d, i) => {
      const row = playerRows[i];
      let moraleDelta = 0;
      if (row.dnf) moraleDelta = -10;
      else if (row.position <= 3) moraleDelta = 8;
      else if (row.position <= 6) moraleDelta = 3;
      else if (row.position > 10) moraleDelta = -4;
      const nextContract = d.contractRounds - 1;
      const contractPenalty = nextContract < 0 ? -3 : 0;
      return { ...d, morale: clamp(d.morale + moraleDelta + contractPenalty, 0, 100), contractRounds: nextContract };
    }) as [DriverInfo, DriverInfo];

    const contractNews = updatedDrivers
      .filter((d) => d.contractRounds === 0)
      .map((d) => `${d.name}'s contract has expired — renew it from the Driver Market before morale slides further.`);

    const calendar = game.calendar.map((c, i) => (i === game.roundIndex ? { ...c, completed: true } : c));

    setGame({
      ...game,
      budget: game.budget + prize + 6,
      rdPoints: game.rdPoints + rd,
      driverStandings: newDriverStandings,
      constructorStandings: newConstructorStandings,
      calendar,
      roundIndex: Math.min(game.roundIndex + 1, game.calendar.length),
      drivers: updatedDrivers,
      lastNews: contractNews[0] ?? "",
    });
    setStage("results");
  }

  return (
    <div className="w-full max-w-2xl">
      <BackRow onBack={onDone} label={`${track.name} — Round ${game.roundIndex + 1}`} accent={PALETTE.brick} />

      {stage === "briefing" && (
        <div className="flex flex-col items-center text-center gap-5 py-4">
          <TrackShape trackId={track.id} accent={PALETTE.brick} className="w-28 h-28" />
          <Mascot accent={game.livery.colors[0]} />
          <div className={`${mono.className} text-xs uppercase tracking-widest px-3 py-2 rounded`} style={{ background: `${WEATHER_META[weather].accent}22`, color: WEATHER_META[weather].accent, border: `1px solid ${WEATHER_META[weather].accent}` }}>
            Forecast: {WEATHER_META[weather].label} — {WEATHER_META[weather].blurb}
          </div>
          <p className={`${workSans.className} text-base`}>{track.country} · {track.laps} laps. Send the cars out for Qualifying.</p>
          <button onClick={runQualifying} className={`${mono.className} uppercase tracking-widest text-sm px-6 py-4 rounded-md`} style={{ background: PALETTE.green, color: PALETTE.parchment }}>
            Start Qualifying ▸
          </button>
        </div>
      )}

      {stage === "qualifying" && (
        <div>
          <h3 className={`${bebas.className} text-2xl uppercase mb-4`}>Qualifying Result</h3>
          <ol className="flex flex-col gap-1 mb-6 max-h-80 overflow-y-auto">
            {grid.map((g, i) => (
              <li key={g.id} className={`${mono.className} text-sm flex justify-between px-2 py-1 rounded ${g.isPlayer ? "font-bold" : ""}`} style={{ background: g.isPlayer ? `${PALETTE.amber}33` : "transparent" }}>
                <span>P{i + 1} — {g.name} <span className="opacity-60">({g.team})</span></span>
              </li>
            ))}
          </ol>
          <button onClick={() => setStage("strategy")} className={`${mono.className} w-full uppercase tracking-widest text-sm py-4 rounded-md`} style={{ background: PALETTE.amber, color: PALETTE.ink }}>
            Choose Race Strategy ▸
          </button>
        </div>
      )}

      {stage === "strategy" && (
        <div>
          <h3 className={`${bebas.className} text-2xl uppercase mb-2`}>Tyre Strategy</h3>
          <p className={`${mono.className} text-xs uppercase tracking-widest mb-4`} style={{ color: WEATHER_META[weather].accent }}>
            {WEATHER_META[weather].label} track — {WEATHER_META[weather].blurb}
          </p>
          {game.drivers.map((d, i) => (
            <div key={d.id} className="mb-6">
              <span className={`${bebas.className} text-lg uppercase block mb-2`}>{d.name}</span>
              <div className="flex gap-2 flex-wrap">
                {availableCompounds.map((c) => (
                  <button
                    key={c}
                    onClick={() => setTyres((prev) => { const next = [...prev] as [Compound, Compound]; next[i] = c; return next; })}
                    className={`${workSans.className} flex-1 min-w-[5rem] rounded-md border px-3 py-3 text-sm`}
                    style={{ borderColor: PALETTE.ink, borderWidth: tyres[i] === c ? 3 : 1, background: tyres[i] === c ? PALETTE.ink : PALETTE.parchment, color: tyres[i] === c ? PALETTE.parchment : PALETTE.ink }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className={`${workSans.className} text-xs mb-6`} style={{ color: `${PALETTE.ink}88` }}>
            Softer/wetter compounds are quicker over one lap but degrade faster; harder/drier compounds last longer but qualify slower.
          </p>
          <button onClick={() => setStage(safetyCar ? "safetyCar" : "racing")} className={`${mono.className} w-full uppercase tracking-widest text-sm py-4 rounded-md`} style={{ background: PALETTE.brick, color: PALETTE.parchment }}>
            Lights Out ▸
          </button>
        </div>
      )}

      {stage === "safetyCar" && (
        <div className="flex flex-col items-center text-center gap-5 py-4">
          <div className={`${mono.className} text-xs uppercase tracking-widest px-3 py-2 rounded`} style={{ background: PALETTE.amber, color: PALETTE.ink }}>
            Safety Car deployed
          </div>
          <p className={`${workSans.className} text-base`}>Debris on track mid-race. Box now for a cheap tyre change under yellow flags, or stay out and hold track position?</p>
          {game.drivers.map((d, i) => (
            <div key={d.id} className="w-full flex items-center justify-between gap-3">
              <span className={`${bebas.className} uppercase`}>{d.name}</span>
              <div className="flex gap-2">
                <button onClick={() => setPitCalls((p) => { const n = [...p] as [boolean, boolean]; n[i] = true; return n; })} className={`${mono.className} text-xs uppercase px-3 py-2 rounded border`} style={{ borderColor: PALETTE.green, background: pitCalls[i] ? PALETTE.green : "transparent", color: pitCalls[i] ? PALETTE.parchment : PALETTE.green }}>
                  Box
                </button>
                <button onClick={() => setPitCalls((p) => { const n = [...p] as [boolean, boolean]; n[i] = false; return n; })} className={`${mono.className} text-xs uppercase px-3 py-2 rounded border`} style={{ borderColor: PALETTE.brick, background: !pitCalls[i] ? PALETTE.brick : "transparent", color: !pitCalls[i] ? PALETTE.parchment : PALETTE.brick }}>
                  Stay Out
                </button>
              </div>
            </div>
          ))}
          <button onClick={finalizeRace} className={`${mono.className} w-full uppercase tracking-widest text-sm py-4 rounded-md mt-4`} style={{ background: PALETTE.ink, color: PALETTE.parchment }}>
            Resume Race ▸
          </button>
        </div>
      )}

      {stage === "racing" && (
        <div className="flex flex-col items-center text-center gap-5 py-4">
          <Mascot excited accent={game.livery.colors[0]} />
          <p className={`${workSans.className} text-base`}>Green flag out at {track.name}...</p>
          <TelemetryPanel drivers={game.drivers} tyres={tyres} weather={weather} />
          <button onClick={finalizeRace} className={`${mono.className} uppercase tracking-widest text-sm px-6 py-4 rounded-md`} style={{ background: PALETTE.brick, color: PALETTE.parchment }}>
            Take the Chequered Flag ▸
          </button>
        </div>
      )}

      {stage === "results" && (
        <div>
          <p className={`${workSans.className} text-sm italic mb-4`} style={{ color: `${PALETTE.ink}AA` }}>{headline}</p>
          <ol className="flex flex-col gap-1 mb-6 max-h-80 overflow-y-auto">
            {results.map((r) => (
              <li key={r.driverId} className={`${mono.className} text-sm flex justify-between px-2 py-1 rounded ${r.isPlayer ? "font-bold" : ""}`} style={{ background: r.isPlayer ? `${PALETTE.amber}33` : "transparent" }}>
                <span>{r.dnf ? "DNF" : `P${r.position}`} — {r.driverName} <span className="opacity-60">({r.team})</span></span>
                <span>{r.points} pts</span>
              </li>
            ))}
          </ol>
          <button onClick={onDone} className={`${mono.className} w-full uppercase tracking-widest text-sm py-4 rounded-md`} style={{ background: PALETTE.green, color: PALETTE.parchment }}>
            Back to Paddock ▸
          </button>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   HOME
   ===================================================================== */
export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [wiping, setWiping] = useState(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [saveLoaded, setSaveLoaded] = useState(false);
  const pendingScreen = useRef<Screen>("menu");

  // Load any existing save once, on mount.
  useEffect(() => {
    const saved = loadSave();
    if (saved) setGame(saved);
    setSaveLoaded(true);
  }, []);

  // Persist to localStorage every time the game state changes (real, cross-session persistence).
  useEffect(() => {
    if (!saveLoaded) return;
    persistSave(game);
  }, [game, saveLoaded]);

  const go = (next: Screen) => {
    pendingScreen.current = next;
    setWiping(true);
    window.setTimeout(() => {
      setScreen(pendingScreen.current);
      setWiping(false);
    }, 260);
  };

  function startCareer(teamName: string, livery: Livery, emblemId: string) {
    const starters = DRIVER_POOL.filter((d) => STARTER_DRIVER_IDS.includes(d.id)).map((d) => ({ ...d, contractRounds: 6, morale: 70 })) as [DriverInfo, DriverInfo];
    const rivals = generateRivals();
    const calendar: RoundRecord[] = TRACKS.map((t) => ({ track: t, completed: false, weather: randomWeather() }));
    setGame({
      teamName,
      livery,
      logo: emblemId,
      budget: 40,
      rdPoints: 0,
      carStats: { aero: 40, powerUnit: 40, reliability: 40 },
      drivers: starters,
      rivals,
      calendar,
      roundIndex: 0,
      driverStandings: {},
      constructorStandings: {},
      lastNews: "",
    });
    go("hub");
  }

  function resetSave() {
    persistSave(null);
    setGame(null);
    go("menu");
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6 sm:p-10 relative overflow-hidden"
      style={{
        background: PALETTE.parchment,
        backgroundImage: `linear-gradient(${PALETTE.paperLine} 1px, transparent 1px), linear-gradient(90deg, ${PALETTE.paperLine} 1px, transparent 1px)`,
        backgroundSize: "42px 42px",
        color: PALETTE.ink,
      }}
    >
      <CheckeredFlag className="absolute top-6 right-6 sm:top-8 sm:right-8 opacity-80 motion-reduce:opacity-60" />

      <div className={`w-full flex justify-center screen-fade ${wiping ? "screen-fade-out" : "screen-fade-in"}`}>
        {screen === "menu" && <MenuScreen onSelect={go} hasSave={!!game} />}
        {screen === "newCareer" && <NewCareerScreen onBack={() => go("menu")} onConfirm={startCareer} />}
        {screen === "continue" && (
          <ContinueScreen onBack={() => go("menu")} onNewCareer={() => go("newCareer")} onResume={() => go("hub")} hasSave={!!game} teamName={game?.teamName} />
        )}
        {screen === "settings" && <SettingsScreen onBack={() => go("menu")} onResetSave={resetSave} />}
        {screen === "hub" && game && <HubScreen game={game} setGame={setGame} onExit={() => go("menu")} onEnterRace={() => go("raceWeekend")} />}
        {screen === "raceWeekend" && game && <RaceWeekendScreen game={game} setGame={setGame} onDone={() => go("hub")} />}
      </div>

      {wiping && <div className="checker-wipe" aria-hidden="true" />}

      <style jsx global>{`
        @keyframes mascotIdle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .mascot-idle { animation: mascotIdle 2.4s ease-in-out infinite; }
        @keyframes mascotJump { 0%, 100% { transform: translateY(0) rotate(0deg); } 30% { transform: translateY(-14px) rotate(-4deg); } 55% { transform: translateY(0) rotate(3deg); } 75% { transform: translateY(-6px) rotate(-2deg); } }
        .mascot-jump { animation: mascotJump 0.9s ease-in-out infinite; }
        @keyframes mascotWave { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-45deg); } }
        .mascot-wave { animation: mascotWave 0.6s ease-in-out infinite; }
        .car-track { position: absolute; left: -56px; bottom: 0; }
        @keyframes driveAcross { from { transform: translateX(0); } to { transform: translateX(calc(100vw + 100px)); } }
        .car-slow svg { animation: driveAcross 9s linear infinite; }
        .car-fast svg { animation: driveAcross 2.4s linear infinite; }
        .screen-fade { transition: opacity 0.22s ease, transform 0.22s ease; }
        .screen-fade-in { opacity: 1; transform: translateY(0); }
        .screen-fade-out { opacity: 0; transform: translateY(6px); }
        .checker-wipe { position: fixed; inset: 0; pointer-events: none; background: repeating-conic-gradient(${PALETTE.ink} 0% 25%, transparent 0% 50%) 0 0 / 24px 24px; opacity: 0.08; animation: wipeFlash 0.26s ease-out; }
        @keyframes wipeFlash { from { opacity: 0.18; } to { opacity: 0.02; } }
        @media (prefers-reduced-motion: reduce) {
          .mascot-idle, .mascot-jump, .mascot-wave, .car-slow svg, .car-fast svg { animation: none !important; }
        }
      `}</style>
    </main>
  );
}