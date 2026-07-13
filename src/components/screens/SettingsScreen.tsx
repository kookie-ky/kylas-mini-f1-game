"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, AlertTriangle } from "lucide-react";
import { BackRow } from "@/components/ui/BackRow";
import { GlassCard, GlassButton } from "@/components/ui/Glass";
import { PALETTE } from "@/lib/theme";
import { useSound } from "@/lib/useSound";

export function SettingsScreen({ onBack, onResetSave }: { onBack: () => void; onResetSave: () => void }) {
  const { volume, setVolume, muted, setMuted } = useSound();
  const [difficulty, setDifficulty] = useState<"rookie" | "pro" | "legend">("pro");
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="w-full max-w-xl px-2">
      <BackRow onBack={onBack} label="Settings" accent={PALETTE.cyan} />

      <GlassCard hoverLift={false} className="mb-6">
        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/60">
              <Volume2 size={14} /> Master volume — {Math.round(volume * 100)}%
            </label>
            <button
              onClick={() => setMuted(!muted)}
              className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10"
              style={{ color: muted ? PALETTE.red : PALETTE.cyan }}
            >
              {muted ? "Muted" : "On"}
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-current"
            style={{ accentColor: PALETTE.cyan }}
          />
        </div>
      </GlassCard>

      <GlassCard hoverLift={false} className="mb-6">
        <div className="px-5 py-5">
          <label className="block text-xs uppercase tracking-widest mb-3 text-white/60">
            Difficulty (grid strength of rival constructors)
          </label>
          <div className="flex gap-2">
            {(["rookie", "pro", "legend"] as const).map((d) => (
              <motion.button
                key={d}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDifficulty(d)}
                className="flex-1 capitalize rounded-xl px-3 py-3 text-sm border transition-colors"
                style={{
                  borderColor: difficulty === d ? PALETTE.cyan : "rgba(255,255,255,0.1)",
                  background: difficulty === d ? `${PALETTE.cyan}1A` : "transparent",
                  color: difficulty === d ? PALETTE.cyan : "rgba(255,255,255,0.7)",
                }}
              >
                {d}
              </motion.button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard hoverLift={false} accent={PALETTE.red}>
        <div className="px-5 py-5">
          <label className="flex items-center gap-2 text-xs uppercase tracking-widest mb-3 text-white/60">
            <AlertTriangle size={14} style={{ color: PALETTE.red }} /> Save data
          </label>
          {!confirming ? (
            <GlassButton onClick={() => setConfirming(true)} variant="outline" accent={PALETTE.red}>
              Erase saved season
            </GlassButton>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-white/70">Erase your saved season permanently?</span>
              <GlassButton
                onClick={() => {
                  onResetSave();
                  setConfirming(false);
                }}
                accent={PALETTE.red}
              >
                Confirm
              </GlassButton>
              <GlassButton onClick={() => setConfirming(false)} variant="ghost">
                Cancel
              </GlassButton>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}