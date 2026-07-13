"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { ScreenTransition } from "@/components/ui/Glass";
import { MenuScreen } from "@/components/screens/MenuScreen";
import { NewCareerScreen } from "@/components/screens/NewCareerScreen";
import { ContinueSeasonScreen } from "@/components/screens/ContinueSeasonScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { HubScreen } from "@/components/screens/HubScreen";
import { RaceWeekendScreen } from "@/components/screens/RaceWeekendScreen";

import { DRIVER_POOL, STARTER_DRIVER_IDS, TRACKS } from "@/lib/data";
import { generateRivals, randomWeather, loadSave, persistSave } from "@/lib/gameLogic";
import type { Screen, GameState, DriverInfo, RoundRecord, Livery } from "@/lib/types";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [game, setGame] = useState<GameState | null>(null);
  const [saveLoaded, setSaveLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load any existing save once, on mount.
  useEffect(() => {
    const saved = loadSave();
    if (saved) setGame(saved);
    setSaveLoaded(true);
  }, []);

  // Persist to localStorage every time the game state changes.
  useEffect(() => {
    if (!saveLoaded) return;
    persistSave(game);
  }, [game, saveLoaded]);

  // Respect the OS "reduce motion" preference for the animated background.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  // Guard: never leave the user stranded on a screen that requires a
  // GameState if there isn't one (e.g. deep state after a reset).
  useEffect(() => {
    if (!saveLoaded) return;
    if ((screen === "hub" || screen === "raceWeekend") && !game) {
      setScreen("menu");
    }
  }, [screen, game, saveLoaded]);

  function go(next: Screen) {
    setScreen(next);
  }

  function startCareer(teamName: string, livery: Livery, emblemId: string) {
    const starters = DRIVER_POOL.filter((d) => STARTER_DRIVER_IDS.includes(d.id)).map((d) => ({
      ...d,
      contractRounds: 6,
      morale: 70,
    })) as [DriverInfo, DriverInfo];

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

  function renderScreen() {
    switch (screen) {
      case "menu":
        return <MenuScreen onSelect={go} hasSave={!!game} />;

      case "newCareer":
        return <NewCareerScreen onBack={() => go("menu")} onConfirm={startCareer} />;

      case "continue":
        return (
          <ContinueSeasonScreen
            onBack={() => go("menu")}
            onNewCareer={() => go("newCareer")}
            onResume={() => go("hub")}
            hasSave={!!game}
            teamName={game?.teamName}
          />
        );

      case "settings":
        return <SettingsScreen onBack={() => go("menu")} onResetSave={resetSave} />;

      case "hub":
        if (!game) return null;
        return (
          <HubScreen
            game={game}
            setGame={setGame}
            onExit={() => go("menu")}
            onEnterRace={() => go("raceWeekend")}
          />
        );

      case "raceWeekend":
        if (!game) return null;
        return <RaceWeekendScreen game={game} setGame={setGame} onDone={() => go("hub")} />;

      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 sm:p-10 relative overflow-hidden text-white">
      <AnimatedBackground reducedMotion={reducedMotion} />

      <AnimatePresence mode="wait">
        <ScreenTransition id={screen} key={screen}>
          {renderScreen()}
        </ScreenTransition>
      </AnimatePresence>
    </main>
  );
}