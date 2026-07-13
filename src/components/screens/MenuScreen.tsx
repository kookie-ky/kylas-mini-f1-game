"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flag, PlayCircle, Settings as SettingsIcon, ChevronRight } from "lucide-react";
import { PALETTE } from "@/lib/theme";
import { GlassCard, GlassButton } from "@/components/ui/Glass";
import { SoundToggle } from "@/components/ui/SoundToggle";
import type { Screen } from "@/lib/types";
import { useSound } from "@/lib/useSound";

export function MenuScreen({ onSelect, hasSave }: { onSelect: (s: Screen) => void; hasSave: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { play } = useSound();

  const items = [
    { id: "new", label: "New Career", caption: "Start a team from the ground up", accent: PALETTE.red, screen: "newCareer" as Screen, icon: Flag },
    { id: "continue", label: "Continue Season", caption: hasSave ? "Resume your championship" : "Pick up where you left off", accent: PALETTE.gold, screen: "continue" as Screen, icon: PlayCircle },
    { id: "settings", label: "Settings", caption: "Audio, difficulty, accessibility", accent: PALETTE.cyan, screen: "settings" as Screen, icon: SettingsIcon },
  ];

  return (
    <div className="w-full max-w-xl px-2">
      <SoundToggle className="absolute top-6 right-6 sm:top-8 sm:right-8" />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-xs sm:text-sm tracking-[0.35em] uppercase mb-4 text-white/50"
      >
        Season 2026 · Team Principal Mode
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="leading-[0.9] tracking-tight uppercase text-[clamp(3rem,12vw,6.5rem)] font-black mb-2"
        style={{ color: PALETTE.ink }}
      >
        Paddock
        <br />
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(90deg, ${PALETTE.red}, ${PALETTE.gold})` }}
        >
          Manager
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="text-base sm:text-lg text-white/55 mb-10 max-w-md"
      >
        Sign your drivers. Set the strategy. Chase the double title.
      </motion.p>

      <nav aria-label="Main menu" className="flex flex-col gap-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <GlassCard
              key={item.id}
              delay={0.3 + i * 0.08}
              accent={hovered === item.id ? item.accent : undefined}
              className="cursor-pointer"
              onClick={() => {
                play("click", { volume: 0.5 });
                onSelect(item.screen);
              }}
            >
              <button
                onMouseEnter={() => {
                  setHovered(item.id);
                  play("hover", { volume: 0.25 });
                }}
                onMouseLeave={() => setHovered((h) => (h === item.id ? null : h))}
                className="w-full flex items-center gap-4 px-5 py-4 text-left"
              >
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
                  style={{ background: `${item.accent}22`, color: item.accent }}
                >
                  <Icon size={20} />
                </span>
                <span className="flex-1">
                  <span className="block text-xl font-semibold tracking-wide uppercase" style={{ color: PALETTE.ink }}>
                    {item.label}
                  </span>
                  <span className="block text-sm text-white/50">{item.caption}</span>
                </span>
                <motion.span
                  animate={{ x: hovered === item.id ? 4 : 0 }}
                  className="text-white/40"
                  style={{ color: hovered === item.id ? item.accent : undefined }}
                >
                  <ChevronRight size={20} />
                </motion.span>
              </button>
            </GlassCard>
          );
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center justify-between text-xs tracking-widest uppercase pt-8 mt-8 border-t border-white/10 text-white/35"
      >
        <span>Paddock Manager © 2026</span>
        <span>v2.0</span>
      </motion.div>
    </div>
  );
}