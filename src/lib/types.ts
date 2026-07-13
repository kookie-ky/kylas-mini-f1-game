export type Screen = "menu" | "newCareer" | "continue" | "settings" | "hub" | "raceWeekend";
export type HubTab = "overview" | "garage" | "drivers" | "calendar" | "standings";
export type Compound = "Soft" | "Medium" | "Hard" | "Intermediate" | "Wet";
export type Weather = "Dry" | "Damp" | "Wet";

export interface DriverStats {
  pace: number;
  consistency: number;
  tyreManagement: number;
}
export interface DriverInfo {
  id: string;
  name: string;
  nationality: string;
  stats: DriverStats;
  wage: number;
  morale: number;
  contractRounds: number;
}
export interface CarStats {
  aero: number;
  powerUnit: number;
  reliability: number;
}
export interface Livery {
  id: string;
  name: string;
  colors: string[];
}
export interface Emblem {
  id: string;
  label: string;
  colors: [string, string];
}
export interface RivalTeam {
  name: string;
  carRating: number;
  drivers: [DriverInfo, DriverInfo];
}
export interface Track {
  id: string;
  name: string;
  country: string;
  laps: number;
}
export interface RoundRecord {
  track: Track;
  completed: boolean;
  weather: Weather;
}
export interface RaceResultRow {
  driverId: string;
  driverName: string;
  team: string;
  position: number;
  points: number;
  dnf: boolean;
  isPlayer: boolean;
}
export interface GameState {
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