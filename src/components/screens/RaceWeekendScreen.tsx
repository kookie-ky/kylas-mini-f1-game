"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, AlertTriangle, Flag } from "lucide-react";
import { BackRow } from "@/components/ui/BackRow";
import { TrackShape } from "@/components/ui/TrackShape";
import { GlassCard, GlassButton } from "@/components/ui/Glass";
import { TelemetryPanel } from "@/components/ui/TelemetryPanel";
import { PALETTE } from "@/lib/theme";
import { WEATHER_META, POINTS_TABLE, COMPOUND_PACE, COMPOUND_DEGRADATION } from "@/lib/data";
import { compoundsForWeather, rand, clamp } from "@/lib/gameLogic";
import { useSound } from "@/lib/useSound";
import type { GameState, Compound, RaceResultRow } from "@/lib/types";

type RaceStage = "briefing" | "qualifying" | "strategy" | "racing" | "safetyCar" | "results";

export function RaceWeekendScreen({
  game,
  setGame,
  onDone,
}: {
  game: GameState;
  setGame: (g: GameState) => void;
  onDone: () => void;
}) {
  const round = game.calendar[game.roundIndex];
  const track = round.track;
  const weather = round.weather;
  const availableCompounds = compoundsForWeather(weather);
  const { play } = useSound();

  const [stage, setStage] = useState<RaceStage>("briefing");
  const [grid, setGrid] = useState<{ id: string; name: string; team: string; isPlayer: boolean; score: number }[]>([]);
  const [tyres, setTyres] = useState<[Compound, Compound]>([availableCompounds[0], availableCompounds[0]]);
  const [safetyCar, setSafetyCar] = useState(false);
  const [pitCalls, setPitCalls] = useState<[boolean, boolean]>([true, true]);
  const [results, setResults] = useState<RaceResultRow[]>([]);
  const [headline, setHeadline] = useState("");

  function runQualifying() {
    play("engineRev", { volume: 0.5 });
    const entries: { id: string; name: string; team: string; isPlayer: boolean; score: number }[] = [];
    const playerCarRating = (game.carStats.aero + game.carStats.powerUnit) / 2;
    game.drivers.forEach((d) => {
      const moraleFactor = 0.94 + (d.morale / 100) * 0.12;
      entries.push({
        id: d.id,
        name: d.name,
        team: game.teamName,
        isPlayer: true,
        score: (playerCarRating * 0.5 + d.stats.pace * 0.5) * moraleFactor + rand(-8, 8),
      });
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
    play("radioBeep", { volume: 0.4 });
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
      const score = dnf
        ? -999 + Math.random()
        : (rating * 0.4 + driver.stats.pace * 0.3 + gridBonus + COMPOUND_PACE[compound] + degradation + consistencyVariance + pitBonus) * moraleFactor;
      return { driverId: g.id, driverName: g.name, team: g.team, position: 0, points: 0, dnf, isPlayer, score };
    });
    rows.sort((a, b) => b.score - a.score);
    rows.forEach((r, i) => {
      r.position = i + 1;
      r.points = POINTS_TABLE[i] ?? 0;
    });

    const winner = rows[0];
    setHeadline(
      safetyCar
        ? `Safety Car flew mid-race in ${WEATHER_META[weather].label.toLowerCase()} conditions — ${winner.team}'s ${winner.driverName} held on to win at ${track.name}.`
        : `${WEATHER_META[weather].label} race, lights-to-flag pace from ${winner.driverName} — victory for ${winner.team} at ${track.name}.`
    );
    setResults(rows);
    play(winner.isPlayer ? "victoryMusic" : "crowdCheer", { volume: 0.5 });

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
    }) as [typeof game.drivers[0], typeof game.drivers[0]];

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
      roundIndex: Math.min(
  game.roundIndex + 1,
  game.calendar.length - 1
),
      drivers: updatedDrivers,
      lastNews: contractNews[0] ?? "",
    });
    setStage("results");
  }

  return (
    <div className="w-full max-w-2xl px-2">
      <BackRow onBack={onDone} label={`${track.name} — Round ${game.roundIndex + 1}`} accent={PALETTE.red} />

      <AnimatePresence mode="wait">
        {stage === "briefing" && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center gap-5 py-4"
          >
            <TrackShape trackId={track.id} accent={PALETTE.red} className="w-32 h-32" />
            <div
              className="text-xs uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-md"
              style={{ background: `${WEATHER_META[weather].accent}1A`, color: WEATHER_META[weather].accent, border: `1px solid ${WEATHER_META[weather].accent}55` }}
            >
              Forecast: {WEATHER_META[weather].label} — {WEATHER_META[weather].blurb}
            </div>
            <p className="text-base text-white/70">
              {track.country} · {track.laps} laps. Send the cars out for Qualifying.
            </p>
            <GlassButton onClick={runQualifying} accent={PALETTE.green} className="px-8 py-4 text-base">
              Start Qualifying →
            </GlassButton>
          </motion.div>
        )}

        {stage === "qualifying" && (
          <motion.div key="qualifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 className="text-2xl font-bold uppercase mb-4">Qualifying Result</h3>
            <GlassCard hoverLift={false} className="mb-6">
              <ol className="flex flex-col divide-y divide-white/5 max-h-80 overflow-y-auto">
                {grid.map((g, i) => (
                  <motion.li
                    key={g.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`text-sm flex justify-between px-4 py-2 ${g.isPlayer ? "font-semibold" : ""}`}
                    style={{ background: g.isPlayer ? `${PALETTE.gold}14` : "transparent" }}
                  >
                    <span>
                      P{i + 1} — {g.name} <span className="text-white/40">({g.team})</span>
                    </span>
                    {i === 0 && <Trophy size={14} style={{ color: PALETTE.gold }} />}
                  </motion.li>
                ))}
              </ol>
            </GlassCard>
            <GlassButton onClick={() => setStage("strategy")} accent={PALETTE.gold} className="w-full py-4 text-base">
              Choose Race Strategy →
            </GlassButton>
          </motion.div>
        )}

        {stage === "strategy" && (
          <motion.div key="strategy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 className="text-2xl font-bold uppercase mb-2">Tyre Strategy</h3>
            <p className="text-xs uppercase tracking-widest mb-5" style={{ color: WEATHER_META[weather].accent }}>
              {WEATHER_META[weather].label} track — {WEATHER_META[weather].blurb}
            </p>
            {game.drivers.map((d, i) => (
              <GlassCard key={d.id} hoverLift={false} className="mb-4">
                <div className="px-4 py-4">
                  <span className="text-lg font-semibold uppercase block mb-3">{d.name}</span>
                  <div className="flex gap-2 flex-wrap">
                    {availableCompounds.map((c) => (
                      <motion.button
                        key={c}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          play("click", { volume: 0.4 });
                          setTyres((prev) => {
                            const next = [...prev] as [Compound, Compound];
                            next[i] = c;
                            return next;
                          });
                        }}
                        className="flex-1 min-w-[5rem] rounded-xl px-3 py-3 text-sm border transition-colors"
                        style={{
                          borderColor: tyres[i] === c ? PALETTE.ink : "rgba(255,255,255,0.12)",
                          background: tyres[i] === c ? "rgba(255,255,255,0.12)" : "transparent",
                          color: tyres[i] === c ? PALETTE.ink : "rgba(255,255,255,0.55)",
                        }}
                      >
                        {c}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </GlassCard>
            ))}
            <p className="text-xs text-white/40 mb-6">
              Softer/wetter compounds are quicker over one lap but degrade faster; harder/drier compounds last longer
              but qualify slower.
            </p>
            <GlassButton
              onClick={() => {
                play("pitLimiter", { volume: 0.4 });
                setStage(safetyCar ? "safetyCar" : "racing");
              }}
              accent={PALETTE.red}
              className="w-full py-4 text-base"
            >
              Lights Out →
            </GlassButton>
          </motion.div>
        )}

        {stage === "safetyCar" && (
          <motion.div
            key="safetyCar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center gap-5 py-4"
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="flex items-center gap-2 text-xs uppercase tracking-widest px-4 py-2 rounded-full"
              style={{ background: `${PALETTE.amber}22`, color: PALETTE.amber }}
            >
              <AlertTriangle size={14} /> Safety Car deployed
            </motion.div>
            <p className="text-base text-white/70">
              Debris on track mid-race. Box now for a cheap tyre change under yellow flags, or stay out and hold
              track position?
            </p>
            <div className="w-full flex flex-col gap-3">
              {game.drivers.map((d, i) => (
                <GlassCard key={d.id} hoverLift={false}>
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="font-semibold uppercase">{d.name}</span>
                    <div className="flex gap-2">
                      <GlassButton
                        onClick={() => setPitCalls((p) => { const n = [...p] as [boolean, boolean]; n[i] = true; return n; })}
                        variant={pitCalls[i] ? "solid" : "outline"}
                        accent={PALETTE.green}
                        className="!px-3 !py-2 !text-xs"
                      >
                        Box
                      </GlassButton>
                      <GlassButton
                        onClick={() => setPitCalls((p) => { const n = [...p] as [boolean, boolean]; n[i] = false; return n; })}
                        variant={!pitCalls[i] ? "solid" : "outline"}
                        accent={PALETTE.red}
                        className="!px-3 !py-2 !text-xs"
                      >
                        Stay Out
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
            <GlassButton onClick={finalizeRace} accent={PALETTE.ink} className="w-full py-4 text-base mt-2">
              Resume Race →
            </GlassButton>
          </motion.div>
        )}

        {stage === "racing" && (
          <motion.div
            key="racing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center gap-5 py-4"
          >
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <Flag size={32} style={{ color: PALETTE.green }} />
            </motion.div>
            <p className="text-base text-white/70">Green flag out at {track.name}...</p>
            <TelemetryPanel drivers={game.drivers} tyres={tyres} weather={weather} />
            <GlassButton onClick={finalizeRace} accent={PALETTE.red} className="px-8 py-4 text-base">
              Take the Chequered Flag →
            </GlassButton>
          </motion.div>
        )}

        {stage === "results" && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm italic text-white/60 mb-4">{headline}</p>
            <GlassCard hoverLift={false} className="mb-6">
              <ol className="flex flex-col divide-y divide-white/5 max-h-80 overflow-y-auto">
                {results.map((r, i) => (
                  <motion.li
                    key={r.driverId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`text-sm flex justify-between px-4 py-2 ${r.isPlayer ? "font-semibold" : ""}`}
                    style={{ background: r.isPlayer ? `${PALETTE.gold}14` : "transparent" }}
                  >
                    <span>
                      {r.dnf ? "DNF" : `P${r.position}`} — {r.driverName} <span className="text-white/40">({r.team})</span>
                    </span>
                    <span>{r.points} pts</span>
                  </motion.li>
                ))}
              </ol>
            </GlassCard>
            <GlassButton onClick={onDone} accent={PALETTE.green} className="w-full py-4 text-base">
              Back to Paddock →
            </GlassButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}