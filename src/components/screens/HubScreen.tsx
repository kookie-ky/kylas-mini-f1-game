"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu as MenuIcon, TrendingUp } from "lucide-react";
import { GlassCard, GlassButton, AnimatedNumber, ProgressBar } from "@/components/ui/Glass";
import { EmblemBadge } from "@/components/ui/EmblemBadge";
import { TrackShape } from "@/components/ui/TrackShape";
import { PALETTE } from "@/lib/theme";
import { WEATHER_META, DRIVER_POOL } from "@/lib/data";
import { clamp, moraleColor } from "@/lib/gameLogic";
import { upgradeCost } from "@/lib/gameLogic";
import type {
  GameState,
  HubTab,
  DriverInfo,
  RivalTeam,
  CarStats,
} from "@/lib/types";

export function HubScreen({
  game,
  setGame,
  onExit,
  onEnterRace,
}: {
  game: GameState;
  setGame: (g: GameState) => void;
  onExit: () => void;
  onEnterRace: () => void;
}) {
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

  // Find which rival team currently owns this driver
  const rivals: RivalTeam[] = game.rivals.map((team) => ({
  ...team,
  drivers: [...team.drivers] as [DriverInfo, DriverInfo],
}));

  for (const team of rivals) {
    const index = team.drivers.findIndex((d) => d.name === candidate.name);

    if (index !== -1) {
      // Replace the hired driver with a reserve driver
      team.drivers[index] = {
        id: `reserve-${Date.now()}-${Math.random()}`,
        name: `Reserve Driver`,
        nationality: "—",
        stats: {
          pace: Math.max(60, team.carRating - 10),
          consistency: Math.max(60, team.carRating - 12),
          tyreManagement: Math.max(60, team.carRating - 12),
        },
        wage: 0,
        morale: 70,
        contractRounds: 99,
      };

      break;
    }
  }

  drivers[slot] = {
    ...candidate,
    contractRounds: 6,
    morale: 70,
  };

  setGame({
    ...game,
    drivers,
    rivals,
    budget: game.budget - candidate.wage,
  });
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
    <div className="w-full max-w-2xl px-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl backdrop-blur-md bg-white/[0.06] border border-white/10 flex items-center justify-center p-1.5">
            <EmblemBadge emblemId={game.logo} size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold uppercase leading-none" style={{ color: game.livery.colors[0] }}>
              {game.teamName}
            </h2>
            <span className="text-xs uppercase tracking-widest text-white/40">
              Round {game.roundIndex + 1} of {game.calendar.length}
            </span>
          </div>
        </div>
        <GlassButton onClick={onExit} variant="ghost" className="!px-3 !py-2">
          <MenuIcon size={16} />
        </GlassButton>
      </div>

      {/* News banner */}
      <AnimatePresence>
        {game.lastNews && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div
              className="text-sm rounded-xl border-l-4 px-4 py-3 backdrop-blur-md bg-white/[0.05]"
              style={{ borderColor: PALETTE.amber, color: "rgba(255,255,255,0.75)" }}
            >
              {game.lastNews}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget / R&D chips */}
      <div className="flex gap-4 mb-6">
        <GlassCard hoverLift={false} className="flex-1">
          <div className="px-4 py-3">
            <span className="block text-[10px] uppercase tracking-widest text-white/40">Budget</span>
            <span className="text-2xl font-semibold" style={{ color: PALETTE.green }}>
              <AnimatedNumber value={game.budget} />
            </span>
          </div>
        </GlassCard>
        <GlassCard hoverLift={false} className="flex-1">
          <div className="px-4 py-3">
            <span className="block text-[10px] uppercase tracking-widest text-white/40">R&amp;D Points</span>
            <span className="text-2xl font-semibold" style={{ color: PALETTE.gold }}>
              <AnimatedNumber value={game.rdPoints} />
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative text-xs uppercase tracking-widest px-3 py-2 rounded-lg transition-colors"
            style={{
              background: tab === t.id ? "rgba(255,255,255,0.1)" : "transparent",
              color: tab === t.id ? PALETTE.ink : "rgba(255,255,255,0.45)",
              border: `1px solid ${tab === t.id ? "rgba(255,255,255,0.15)" : "transparent"}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
        >
          {tab === "overview" && (
            <div>
              <p className="text-sm text-white/60 mb-6">
                {nextRound ? (
                  <>
                    Next up: <strong className="text-white">{nextRound.track.name}</strong>, {nextRound.track.country}{" "}
                    — {nextRound.track.laps} laps. Forecast:{" "}
                    <strong style={{ color: WEATHER_META[nextRound.weather].accent }}>
                      {WEATHER_META[nextRound.weather].label}
                    </strong>
                    .
                  </>
                ) : (
                  "Season complete — check the Championship tab for the final result."
                )}
              </p>

              {nextRound && (
                <GlassCard hoverLift={false} accent={game.livery.colors[0]} className="mb-8">
                  <div className="flex items-center gap-4 px-4 py-4">
                    <TrackShape trackId={nextRound.track.id} accent={game.livery.colors[0]} className="w-20 h-20 shrink-0" />
                    <p className="text-xs text-white/45">
                      Circuit layout is procedurally sketched from the track name — an abstract read on the corner
                      sequence, not a scale map.
                    </p>
                  </div>
                </GlassCard>
              )}

              <div className="space-y-5 mb-8">
                <ProgressBar label="Aero" value={game.carStats.aero} accent={PALETTE.red} max={99} />
                <ProgressBar label="Power Unit" value={game.carStats.powerUnit} accent={PALETTE.gold} max={99} />
                <ProgressBar label="Reliability" value={game.carStats.reliability} accent={PALETTE.cyan} max={99} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {game.drivers.map((d, i) => (
                  <GlassCard key={i} hoverLift={false} delay={i * 0.05}>
                    <div className="px-4 py-4">
                      <span className="block text-lg font-semibold uppercase">{d.name}</span>
                      <span className="text-xs text-white/45 block mb-3">
                        Pace {d.stats.pace} · Consistency {d.stats.consistency} · Tyres {d.stats.tyreManagement}
                      </span>
                      <ProgressBar label="Morale" value={d.morale} accent={moraleColor(d.morale)} max={100} height={7} />
                      <span
                        className="text-[10px] uppercase tracking-widest mt-3 block"
                        style={{ color: d.contractRounds <= 1 ? PALETTE.red : "rgba(255,255,255,0.4)" }}
                      >
                        {d.contractRounds > 0
                          ? `Contract: ${d.contractRounds} round${d.contractRounds === 1 ? "" : "s"} left`
                          : "Out of contract"}
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>

              {nextRound && (
                <GlassButton onClick={onEnterRace} accent={PALETTE.red} className="w-full mt-8 py-4 text-base">
                  Enter Race Weekend →
                </GlassButton>
              )}
            </div>
          )}

          {tab === "garage" && (
            <div>
              <p className="text-sm text-white/55 mb-6">
                Spend R&amp;D points earned from race weekends on car development. Each upgrade costs more as the
                stat climbs.
              </p>
              <div className="space-y-6">
                {(["aero", "powerUnit", "reliability"] as const).map((stat) => {
                  const label = stat === "aero" ? "Aero" : stat === "powerUnit" ? "Power Unit" : "Reliability";
                  const accent = stat === "aero" ? PALETTE.red : stat === "powerUnit" ? PALETTE.gold : PALETTE.cyan;
                  const cost = upgradeCost(game.carStats[stat]);
                  return (
                    <GlassCard key={stat} hoverLift={false}>
                      <div className="px-5 py-5">
                        <ProgressBar label={label} value={game.carStats[stat]} accent={accent} max={99} />
                        <GlassButton
                          onClick={() => upgrade(stat)}
                          disabled={game.rdPoints < cost || game.carStats[stat] >= 99}
                          variant="outline"
                          accent={accent}
                          className="mt-4"
                        >
                          Upgrade (+3) — {cost} R&amp;D
                        </GlassButton>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "drivers" && (
            <div>
              <p className="text-sm text-white/55 mb-4">Current lineup</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {game.drivers.map((d, i) => (
                  <GlassCard key={i} hoverLift={false} accent={PALETTE.gold}>
                    <div className="px-4 py-4">
                      <span className="block text-lg font-semibold uppercase">{d.name}</span>
                      <span className="text-xs text-white/45 block mb-3">
                        {d.nationality} · Pace {d.stats.pace}
                      </span>
                      <ProgressBar label="Morale" value={d.morale} accent={moraleColor(d.morale)} max={100} height={7} />
                      <div className="flex items-center justify-between mt-3">
                        <span
                          className="text-[10px] uppercase tracking-widest"
                          style={{ color: d.contractRounds <= 1 ? PALETTE.red : "rgba(255,255,255,0.4)" }}
                        >
                          {d.contractRounds > 0 ? `${d.contractRounds} round${d.contractRounds === 1 ? "" : "s"} left` : "Out of contract"}
                        </span>
                        <GlassButton
                          onClick={() => renewContract(i as 0 | 1)}
                          disabled={game.budget < 8 + d.wage || d.morale < 35}
                          variant="outline"
                          accent={PALETTE.green}
                          className="!px-2.5 !py-1.5 !text-[10px]"
                        >
                          Renew — {8 + d.wage}
                        </GlassButton>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>

              <p className="text-sm text-white/55 mb-3">Free agents</p>
              <div className="flex flex-col gap-2">
                {DRIVER_POOL.filter((c) => !game.drivers.some((d) => d.id === c.id)).map((c, i) => (
                  <GlassCard key={c.id} hoverLift={false} delay={i * 0.02}>
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div>
                        <span className="block text-base font-semibold uppercase">{c.name}</span>
                        <span className="text-xs text-white/45">
                          {c.nationality} · Pace {c.stats.pace} · Consistency {c.stats.consistency} · Tyres{" "}
                          {c.stats.tyreManagement} · Wage {c.wage}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <GlassButton
                          onClick={() => signDriver(c, 0)}
                          disabled={game.budget < c.wage}
                          variant="outline"
                          accent={PALETTE.green}
                          className="!px-2.5 !py-1.5 !text-[10px]"
                        >
                          Sign → Seat 1
                        </GlassButton>
                        <GlassButton
                          onClick={() => signDriver(c, 1)}
                          disabled={game.budget < c.wage}
                          variant="outline"
                          accent={PALETTE.red}
                          className="!px-2.5 !py-1.5 !text-[10px]"
                        >
                          Sign → Seat 2
                        </GlassButton>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {tab === "calendar" && (
            <div className="flex flex-col gap-2">
              {game.calendar.map((r, i) => (
                <GlassCard
                  key={r.track.id}
                  hoverLift={false}
                  delay={i * 0.03}
                  accent={i === game.roundIndex ? PALETTE.red : undefined}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <TrackShape
                      trackId={r.track.id}
                      accent={r.completed ? "rgba(255,255,255,0.25)" : game.livery.colors[0]}
                      className="w-12 h-12 shrink-0"
                    />
                    <div className="flex-1">
                      <span className="text-xs text-white/35 mr-2">R{i + 1}</span>
                      <span className="text-lg font-semibold uppercase">{r.track.name}</span>
                      <span className="block text-xs text-white/45">
                        {r.track.country} · {r.track.laps} laps ·{" "}
                        <span style={{ color: WEATHER_META[r.weather].accent }}>{WEATHER_META[r.weather].label}</span>
                      </span>
                    </div>
                    <span
                      className="text-xs uppercase tracking-widest"
                      style={{
                        color: r.completed ? PALETTE.green : i === game.roundIndex ? PALETTE.red : "rgba(255,255,255,0.35)",
                      }}
                    >
                      {r.completed ? "Complete" : i === game.roundIndex ? "Next" : "Upcoming"}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {tab === "standings" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <GlassCard hoverLift={false}>
                <div className="px-5 py-5">
                  <h3 className="text-lg font-bold uppercase mb-3 flex items-center gap-2" style={{ color: PALETTE.red }}>
                    <TrendingUp size={16} /> Drivers&apos; Championship
                  </h3>
                  <ol className="flex flex-col gap-1">
                    {Object.values(game.driverStandings)
                      .sort((a, b) => b.points - a.points)
                      .map((d, i) => (
                        <li key={d.name} className="text-sm flex justify-between border-b border-white/5 py-1.5">
                          <span>
                            {i + 1}. {d.name} <span className="text-white/40">({d.team})</span>
                          </span>
                          <span className="font-medium">{d.points}</span>
                        </li>
                      ))}
                  </ol>
                </div>
              </GlassCard>
              <GlassCard hoverLift={false}>
                <div className="px-5 py-5">
                  <h3 className="text-lg font-bold uppercase mb-3 flex items-center gap-2" style={{ color: PALETTE.gold }}>
                    <TrendingUp size={16} /> Constructors&apos; Championship
                  </h3>
                  <ol className="flex flex-col gap-1">
                    {Object.entries(game.constructorStandings)
                      .sort((a, b) => b[1] - a[1])
                      .map(([team, pts], i) => (
                        <li key={team} className="text-sm flex justify-between border-b border-white/5 py-1.5">
                          <span>
                            {i + 1}. {team}
                          </span>
                          <span className="font-medium">{pts}</span>
                        </li>
                      ))}
                  </ol>
                </div>
              </GlassCard>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}