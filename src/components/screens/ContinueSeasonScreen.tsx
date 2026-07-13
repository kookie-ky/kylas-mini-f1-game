"use client";

import { motion } from "framer-motion";
import { PlayCircle, Flag } from "lucide-react";
import { BackRow } from "@/components/ui/BackRow";
import { GlassCard, GlassButton } from "@/components/ui/Glass";
import { PALETTE } from "@/lib/theme";

export function ContinueSeasonScreen({
  onBack,
  onNewCareer,
  onResume,
  hasSave,
  teamName,
}: {
  onBack: () => void;
  onNewCareer: () => void;
  onResume: () => void;
  hasSave: boolean;
  teamName?: string;
}) {
  return (
    <div className="w-full max-w-xl px-2 flex flex-col items-center text-center gap-6 py-6">
      <BackRow onBack={onBack} label="Continue Season" accent={PALETTE.gold} centered />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: `${PALETTE.gold}18`, color: PALETTE.gold }}
      >
        {hasSave ? <PlayCircle size={34} /> : <Flag size={34} />}
      </motion.div>

      <GlassCard hoverLift={false} className="w-full">
        <div className="px-6 py-6">
          {hasSave ? (
            <>
              <p className="text-base text-white/70 mb-5">
                <strong className="text-white">{teamName}</strong> is fuelled up and waiting in the garage. Your
                save was loaded from this browser&apos;s storage.
              </p>
              <GlassButton onClick={onResume} accent={PALETTE.gold} className="w-full py-3.5">
                Resume season →
              </GlassButton>
            </>
          ) : (
            <>
              <p className="text-base text-white/70 mb-5">
                No saved season on this device yet. Start a career and it will be saved automatically after every
                race.
              </p>
              <GlassButton onClick={onNewCareer} variant="outline" accent={PALETTE.gold} className="w-full py-3.5">
                Start New Career →
              </GlassButton>
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
}