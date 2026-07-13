"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { PALETTE } from "@/lib/theme";
import { useSound } from "@/lib/useSound";

/* ---------------------------------------------------------------------
   GlassCard — the base frosted panel used everywhere (menu tiles, driver
   cards, stat panels). Fades/slides in on mount, lifts slightly on hover.
--------------------------------------------------------------------- */
export function GlassCard({
  children,
  className = "",
  accent,
  delay = 0,
  hoverLift = true,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
  delay?: number;
  hoverLift?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hoverLift ? { y: -3, transition: { duration: 0.18 } } : undefined}
      onClick={onClick}
      className={`relative rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.45)] overflow-hidden ${className}`}
      style={accent ? { boxShadow: `0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 ${accent}22` } : undefined}
    >
      {accent && (
        <span
          className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      )}
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------------
   GlassButton — primary interactive element. Scales on hover/tap, plays
   click/hover sfx via useSound(). variant "solid" for CTAs, "ghost" for
   secondary actions.
--------------------------------------------------------------------- */
export function GlassButton({
  children,
  onClick,
  variant = "solid",
  accent = PALETTE.red,
  disabled = false,
  className = "",
  playSound = true,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "solid" | "ghost" | "outline";
  accent?: string;
  disabled?: boolean;
  className?: string;
  playSound?: boolean;
}) {
  const { play } = useSound();

  const base = "relative rounded-xl px-5 py-3 font-medium tracking-wide uppercase text-sm transition-colors duration-150 disabled:opacity-35 disabled:cursor-not-allowed";
  const styles =
    variant === "solid"
      ? { background: accent, color: "#0A0A0F", border: "1px solid transparent" }
      : variant === "outline"
      ? { background: "transparent", color: accent, border: `1px solid ${accent}88` }
      : { background: "rgba(255,255,255,0.06)", color: PALETTE.ink, border: "1px solid rgba(255,255,255,0.12)" };

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12 }}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        if (playSound) play("click", { volume: 0.5 });
        onClick?.();
      }}
      onMouseEnter={() => !disabled && playSound && play("hover", { volume: 0.25 })}
      className={`${base} ${className}`}
      style={styles}
    >
      {children}
    </motion.button>
  );
}

/* ---------------------------------------------------------------------
   AnimatedNumber — counts up/down smoothly whenever `value` changes.
   Used for budget, R&D points, championship points, telemetry readouts.
--------------------------------------------------------------------- */
export function AnimatedNumber({
  value,
  decimals = 0,
  className = "",
  prefix = "",
  suffix = "",
}: {
  value: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const motionVal = useMotionValue(value);
  const spring = useSpring(motionVal, { stiffness: 90, damping: 20, mass: 0.6 });
  const [display, setDisplay] = useState(value.toFixed(decimals));

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(v.toFixed(decimals)));
    return unsub;
  }, [spring, decimals]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ---------------------------------------------------------------------
   ProgressBar — animated fill (car stats, morale, tyre wear, fuel).
--------------------------------------------------------------------- */
export function ProgressBar({
  value,
  max = 100,
  accent = PALETTE.red,
  label,
  showValue = true,
  height = 10,
}: {
  value: number;
  max?: number;
  accent?: string;
  label?: string;
  showValue?: boolean;
  height?: number;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between text-xs uppercase tracking-widest mb-1.5 text-white/60">
          <span>{label}</span>
          {showValue && (
            <span style={{ color: accent }}>
              <AnimatedNumber value={value} />/{max}
            </span>
          )}
        </div>
      )}
      <div className="rounded-full overflow-hidden bg-white/[0.08]" style={{ height }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${accent}AA, ${accent})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   ScreenTransition — wraps each screen so switching screens slides/fades
   instead of snapping. Use inside AnimatePresence in the root page.
--------------------------------------------------------------------- */
export function ScreenTransition({ children, id }: { children: ReactNode; id: string }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="w-full flex justify-center"
    >
      {children}
    </motion.div>
  );
}

export { AnimatePresence, motion };