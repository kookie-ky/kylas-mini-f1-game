"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard, ProgressBar } from "@/components/ui/Glass";
import { PALETTE } from "@/lib/theme";
import { WEATHER_META, COMPOUND_DEGRADATION } from "@/lib/data";
import { clamp, rand } from "@/lib/gameLogic";
import type { DriverInfo, Compound, Weather } from "@/lib/types";

export function TelemetryPanel({
  drivers,
  tyres,
  weather,
}: {
  drivers: [DriverInfo, DriverInfo];
  tyres: [Compound, Compound];
  weather: Weather;
}) {
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    });
  }, [tick]);

  return (
    <GlassCard hoverLift={false} accent={PALETTE.cyan} className="w-full text-left">
      <div className="px-5 py-5">
        <div className="text-xs uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: PALETTE.cyan }}>
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: PALETTE.cyan }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          Live Telemetry — Lap {Math.min(tick, 14)} · {WEATHER_META[weather].label}
        </div>
        {drivers.map((d, i) => {
          const wear = traces[i][traces[i].length - 1];
          const pts = traces[i]
            .map((v, idx) => `${(idx / Math.max(1, traces[i].length - 1)) * 100},${24 - (v / 100) * 24}`)
            .join(" ");
          return (
            <div key={d.id} className="mb-4 last:mb-0">
              <div className="flex justify-between text-xs mb-1.5 text-white/70">
                <span>
                  <strong className="text-white">{d.name}</strong> — {tyres[i]}
                </span>
                <span>Tyre wear {Math.round(wear)}%</span>
              </div>
              <ProgressBar value={wear} accent={PALETTE.red} showValue={false} height={5} />
              <svg viewBox="0 0 100 24" className="w-full h-6 mt-1">
                <polyline points={pts} fill="none" stroke={PALETTE.green} strokeWidth="1.5" />
              </svg>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}