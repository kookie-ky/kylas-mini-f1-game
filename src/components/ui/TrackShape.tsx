"use client";

import { useMemo } from "react";
import { hashStr, trackPoints } from "@/lib/gameLogic";
import { PALETTE } from "@/lib/theme";

export function TrackShape({ trackId, accent = PALETTE.red, className = "" }: { trackId: string; accent?: string; className?: string }) {
  const pts = useMemo(() => trackPoints(hashStr(trackId)), [trackId]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <path d={d} fill="none" stroke={accent} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
      <path d={d} fill="none" stroke={accent} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" opacity="0.15" />
      <circle cx={pts[0][0]} cy={pts[0][1]} r="3.4" fill={PALETTE.gold} />
      <rect
        x={pts[0][0] - 1}
        y={pts[0][1] - 7}
        width="2"
        height="14"
        fill="rgba(255,255,255,0.8)"
        transform={`rotate(20 ${pts[0][0]} ${pts[0][1]})`}
      />
    </svg>
  );
}