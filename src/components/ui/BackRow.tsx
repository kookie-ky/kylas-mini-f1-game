"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { PALETTE } from "@/lib/theme";
import { useSound } from "@/lib/useSound";

export function BackRow({
  onBack,
  label,
  accent = PALETTE.red,
  centered = false,
}: {
  onBack: () => void;
  label: string;
  accent?: string;
  centered?: boolean;
}) {
  const { play } = useSound();
  return (
    <div className={`flex items-center gap-3 mb-8 ${centered ? "justify-center" : ""}`}>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          play("click", { volume: 0.4 });
          onBack();
        }}
        aria-label="Back"
        className="w-9 h-9 rounded-full backdrop-blur-md bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/80"
      >
        <ChevronLeft size={18} />
      </motion.button>
      <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide" style={{ color: accent }}>
        {label}
      </h2>
    </div>
  );
}