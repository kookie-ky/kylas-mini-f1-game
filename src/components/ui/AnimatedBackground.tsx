"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { PALETTE } from "@/lib/theme";

const PARTICLE_COUNT = 22;

function CarSilhouette({ color, top, duration, delay, scale = 1 }: { color: string; top: string; duration: number; delay: number; scale?: number }) {
  return (
    <motion.svg
      viewBox="0 0 64 20"
      width={64 * scale}
      height={20 * scale}
      className="absolute opacity-[0.14]"
      style={{ top }}
      initial={{ x: "-10vw" }}
      animate={{ x: "110vw" }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <rect x="4" y="8" width="48" height="8" rx="4" fill={color} />
      <path d="M14 8 L22 2 H42 L50 8 Z" fill={color} />
      <circle cx="16" cy="16" r="4" fill="#000" />
      <circle cx="48" cy="16" r="4" fill="#000" />
    </motion.svg>
  );
}

export function AnimatedBackground({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const particles = useMemo(
  () => [
    { id: 1, left: "10%", top: "20%", size: 2, duration: 8, delay: 1 },
    { id: 2, left: "30%", top: "70%", size: 3, duration: 12, delay: 3 },
    { id: 3, left: "55%", top: "40%", size: 2, duration: 10, delay: 5 },
    { id: 4, left: "75%", top: "15%", size: 3, duration: 14, delay: 2 },
    { id: 5, left: "90%", top: "80%", size: 2, duration: 9, delay: 6 },
    { id: 6, left: "45%", top: "90%", size: 3, duration: 11, delay: 4 },
    { id: 7, left: "20%", top: "55%", size: 2, duration: 13, delay: 7 },
    { id: 8, left: "65%", top: "65%", size: 3, duration: 15, delay: 1 },
  ],
  []
);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: PALETTE.bg }} aria-hidden="true">
      {/* Radial glows */}
      <div
        className="absolute -top-1/3 -left-1/4 w-[70vw] h-[70vw] rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: PALETTE.red }}
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 w-[60vw] h-[60vw] rounded-full opacity-[0.12] blur-[120px]"
        style={{ background: PALETTE.cyan }}
      />

      {/* Faint grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      {!reducedMotion && (
        <>
          {/* Moving car silhouettes */}
          <CarSilhouette color={PALETTE.red} top="18%" duration={14} delay={0} />
          <CarSilhouette color={PALETTE.cyan} top="62%" duration={19} delay={4} scale={0.8} />
          <CarSilhouette color={PALETTE.gold} top="40%" duration={24} delay={9} scale={1.2} />

          {/* Floating particles */}
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full bg-white/40"
              style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
              animate={{ y: [0, -18, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}