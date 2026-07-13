"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BackRow } from "@/components/ui/BackRow";
import { GlassCard, GlassButton } from "@/components/ui/Glass";
import { EmblemBadge } from "@/components/ui/EmblemBadge";
import { LIVERIES, EMBLEMS } from "@/lib/data";
import { PALETTE } from "@/lib/theme";
import type { Livery } from "@/lib/types";

export function NewCareerScreen({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: (teamName: string, livery: Livery, emblemId: string) => void;
}) {
  const [name, setName] = useState("");
  const [liveryId, setLiveryId] = useState(LIVERIES[0].id);
  const [emblemId, setEmblemId] = useState(EMBLEMS[0].id);
  const activeLivery = LIVERIES.find((l) => l.id === liveryId)!;

  return (
    <div className="w-full max-w-xl px-2">
      <BackRow onBack={onBack} label="New Career" accent={PALETTE.red} />

      <label className="block text-xs uppercase tracking-widest mb-2 text-white/50">
        Team name (Constructor entry)
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Kookie's Racing"
        maxLength={24}
        className="w-full text-3xl font-bold uppercase tracking-wide bg-transparent border-b-2 px-1 py-3 mb-8 outline-none text-white placeholder:text-white/25 transition-colors focus:border-white/60"
        style={{ borderColor: "rgba(255,255,255,0.2)" }}
      />

      <label className="block text-xs uppercase tracking-widest mb-3 text-white/50">Livery</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {LIVERIES.map((l, i) => (
          <GlassCard
            key={l.id}
            delay={i * 0.05}
            hoverLift={false}
            accent={liveryId === l.id ? l.colors[0] : undefined}
            className="cursor-pointer"
            onClick={() => setLiveryId(l.id)}
          >
            <div
              className="p-3 border-2 rounded-2xl transition-colors"
              style={{ borderColor: liveryId === l.id ? l.colors[0] : "transparent" }}
            >
              <div className="flex gap-1 mb-2">
                {l.colors.map((c, ci) => (
                  <span key={ci} className="block h-3 flex-1 rounded-sm" style={{ background: c }} />
                ))}
              </div>
              <span className="text-xs text-white/80">{l.name}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <label className="block text-xs uppercase tracking-widest mb-3 text-white/50">Emblem</label>
      <div className="flex flex-wrap gap-3 mb-8">
        {EMBLEMS.map((e) => (
          <motion.button
            key={e.id}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setEmblemId(e.id)}
            title={e.label}
            className="w-14 h-14 rounded-xl backdrop-blur-md bg-white/[0.06] border flex items-center justify-center p-1.5 transition-colors"
            style={{ borderColor: emblemId === e.id ? PALETTE.gold : "rgba(255,255,255,0.1)", borderWidth: emblemId === e.id ? 2 : 1 }}
          >
            <EmblemBadge emblemId={e.id} size={34} />
          </motion.button>
        ))}
      </div>

      <GlassCard delay={0.1} hoverLift={false} className="mb-6">
        <p className="text-sm px-4 py-3 text-white/60">
          You&apos;ll start with a cost cap of <strong className="text-white">40 budget units</strong>, a baseline
          car (40 Aero / 40 Power Unit / 40 Reliability), and two rookie drivers already under contract. Build from
          there across an 8-round calendar with its own weather forecast.
        </p>
      </GlassCard>

      <GlassButton
        onClick={() => name.trim() && onConfirm(name.trim(), activeLivery, emblemId)}
        disabled={!name.trim()}
        accent={PALETTE.red}
        className="w-full py-4 text-base"
      >
        Enter the paddock →
      </GlassButton>
    </div>
  );
}