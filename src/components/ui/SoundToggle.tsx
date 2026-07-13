"use client";

import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { useSound } from "@/lib/useSound";

export function SoundToggle({ className = "" }: { className?: string }) {
  const { muted, setMuted, play } = useSound();
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => {
        const next = !muted;
        setMuted(next);
        if (!next) play("click", { volume: 0.4 });
      }}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      className={`w-10 h-10 rounded-full backdrop-blur-md bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/80 hover:text-white ${className}`}
    >
      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </motion.button>
  );
}