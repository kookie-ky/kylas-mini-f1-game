import type { DriverInfo, Livery, Emblem, Track, Compound, Weather } from "./types";

export const LIVERIES: Livery[] = [
  { id: "carbon-red", name: "Carbon Red", colors: ["#E10600", "#0A0A0F", "#FFFFFF"] },
  { id: "ice-blue", name: "Ice Blue", colors: ["#0057B8", "#00D9FF", "#0A0A0F"] },
  { id: "midnight-gold", name: "Midnight Gold", colors: ["#0A0A0F", "#D4AF37", "#FFFFFF"] },
];

export const EMBLEMS: Emblem[] = [
  { id: "scarlet", label: "Scarlet Shield", colors: ["#D40000", "#FFF200"] },
  { id: "apex-navy", label: "Apex Navy", colors: ["#1E3A8A", "#FFD500"] },
  { id: "azure", label: "Azure Wing", colors: ["#0057B8", "#FFFFFF"] },
  { id: "papaya", label: "Papaya Blaze", colors: ["#FF8000", "#000000"] },
  { id: "silver-teal", label: "Silver Teal", colors: ["#00A19C", "#C6C6C6"] },
  { id: "rose-blue", label: "Rosé Blue", colors: ["#0090D0", "#FF6FA8"] },
];

export const DRIVER_POOL: DriverInfo[] = [
  { id: "d1", name: "Max Verstappen", nationality: "Netherlands", stats: { pace: 98, consistency: 97, tyreManagement: 96 }, wage: 25, morale: 88, contractRounds: 18 },
  { id: "d2", name: "Lando Norris", nationality: "United Kingdom", stats: { pace: 96, consistency: 93, tyreManagement: 91 }, wage: 22, morale: 90, contractRounds: 18 },
  { id: "d3", name: "Charles Leclerc", nationality: "Monaco", stats: { pace: 95, consistency: 92, tyreManagement: 91 }, wage: 22, morale: 86, contractRounds: 18 },
  { id: "d4", name: "Oscar Piastri", nationality: "Australia", stats: { pace: 95, consistency: 91, tyreManagement: 90 }, wage: 21, morale: 89, contractRounds: 20 },
  { id: "d5", name: "George Russell", nationality: "United Kingdom", stats: { pace: 93, consistency: 91, tyreManagement: 89 }, wage: 18, morale: 84, contractRounds: 18 },
  { id: "d6", name: "Lewis Hamilton", nationality: "United Kingdom", stats: { pace: 95, consistency: 96, tyreManagement: 98 }, wage: 25, morale: 86, contractRounds: 14 },
  { id: "d7", name: "Carlos Sainz", nationality: "Spain", stats: { pace: 91, consistency: 90, tyreManagement: 92 }, wage: 18, morale: 83, contractRounds: 16 },
  { id: "d8", name: "Fernando Alonso", nationality: "Spain", stats: { pace: 90, consistency: 94, tyreManagement: 97 }, wage: 17, morale: 80, contractRounds: 12 },
  { id: "d9", name: "Andrea Kimi Antonelli", nationality: "Italy", stats: { pace: 89, consistency: 85, tyreManagement: 84 }, wage: 11, morale: 81, contractRounds: 24 },
  { id: "d10", name: "Alexander Albon", nationality: "Thailand", stats: { pace: 88, consistency: 87, tyreManagement: 86 }, wage: 12, morale: 81, contractRounds: 18 },
  { id: "d11", name: "Pierre Gasly", nationality: "France", stats: { pace: 87, consistency: 85, tyreManagement: 85 }, wage: 11, morale: 78, contractRounds: 18 },
  { id: "d12", name: "Esteban Ocon", nationality: "France", stats: { pace: 86, consistency: 84, tyreManagement: 84 }, wage: 10, morale: 77, contractRounds: 16 },
  { id: "d13", name: "Yuki Tsunoda", nationality: "Japan", stats: { pace: 86, consistency: 82, tyreManagement: 82 }, wage: 10, morale: 79, contractRounds: 17 },
  { id: "d14", name: "Lance Stroll", nationality: "Canada", stats: { pace: 84, consistency: 81, tyreManagement: 82 }, wage: 9, morale: 74, contractRounds: 18 },
  { id: "d15", name: "Nico Hülkenberg", nationality: "Germany", stats: { pace: 85, consistency: 89, tyreManagement: 90 }, wage: 10, morale: 77, contractRounds: 15 },
  { id: "d16", name: "Oliver Bearman", nationality: "United Kingdom", stats: { pace: 84, consistency: 81, tyreManagement: 80 }, wage: 8, morale: 79, contractRounds: 24 },
  { id: "d17", name: "Gabriel Bortoleto", nationality: "Brazil", stats: { pace: 84, consistency: 81, tyreManagement: 80 }, wage: 8, morale: 79, contractRounds: 24 },
  { id: "d18", name: "Isack Hadjar", nationality: "France", stats: { pace: 83, consistency: 80, tyreManagement: 79 }, wage: 7, morale: 80, contractRounds: 24 },
  { id: "d19", name: "Liam Lawson", nationality: "New Zealand", stats: { pace: 84, consistency: 81, tyreManagement: 81 }, wage: 8, morale: 81, contractRounds: 22 },
  { id: "d20", name: "Arvid Lindblad", nationality: "United Kingdom", stats: { pace: 83, consistency: 79, tyreManagement: 78 }, wage: 7, morale: 84, contractRounds: 26 },
];
export const STARTER_DRIVER_IDS = ["d6", "d7"];

export const TRACKS: Track[] = [
  { id: "bhr", name: "Bahrain International Circuit", country: "Bahrain", laps: 57 },
  { id: "aus", name: "Albert Park Circuit", country: "Australia", laps: 58 },
  { id: "jpn", name: "Suzuka Circuit", country: "Japan", laps: 53 },
  { id: "mon", name: "Circuit de Monaco", country: "Monaco", laps: 78 },
  { id: "gbr", name: "Silverstone Circuit", country: "United Kingdom", laps: 52 },
  { id: "bel", name: "Circuit de Spa-Francorchamps", country: "Belgium", laps: 44 },
  { id: "ita", name: "Autodromo Nazionale Monza", country: "Italy", laps: 53 },
  { id: "bra", name: "Interlagos Circuit", country: "Brazil", laps: 71 },
];

export const RIVAL_TEAM_NAMES: { name: string; rating: number }[] = [
  { name: "Red Bull Racing", rating: 96 },
  { name: "McLaren", rating: 95 },
  { name: "Ferrari", rating: 94 },
  { name: "Mercedes", rating: 92 },
  { name: "Williams", rating: 84 },
  { name: "Aston Martin", rating: 83 },
  { name: "Racing Bulls", rating: 81 },
  { name: "Alpine", rating: 79 },
  { name: "Haas", rating: 76 },
  { name: "Kick Sauber", rating: 74 },
];
export const RIVAL_DRIVER_NAMES = [
  "Max Verstappen", "Yuki Tsunoda", "Lando Norris", "Oscar Piastri", "Charles Leclerc",
  "Lewis Hamilton", "George Russell", "Andrea Kimi Antonelli", "Alexander Albon", "Carlos Sainz",
  "Fernando Alonso", "Lance Stroll", "Pierre Gasly", "Franco Colapinto", "Esteban Ocon",
  "Oliver Bearman", "Liam Lawson", "Isack Hadjar", "Nico Hülkenberg", "Gabriel Bortoleto",
];

export const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const COMPOUND_PACE: Record<Compound, number> = { Soft: 6, Medium: 2, Hard: -2, Intermediate: -9, Wet: -16 };
export const COMPOUND_DEGRADATION: Record<Compound, number> = { Soft: -7, Medium: -3, Hard: 0, Intermediate: -4, Wet: -1 };
export const WEATHER_META: Record<Weather, { label: string; accent: string; blurb: string }> = {
  Dry: { label: "Dry", accent: "#D4AF37", blurb: "Clear skies — slicks only." },
  Damp: { label: "Damp", accent: "#6BA3D6", blurb: "Greasy track — mediums, hards, or intermediates." },
  Wet: { label: "Wet", accent: "#0057B8", blurb: "Standing water — wets or intermediates required." },
};