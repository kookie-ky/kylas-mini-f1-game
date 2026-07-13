// Glassmorphism / F1-premium design tokens.
// Dark cockpit-inspired base with a signal red accent and a cyan secondary,
// replacing the old parchment/paper palette.
export const PALETTE = {
  bg: "#07070C",          // near-black base
  bgSoft: "#0F0F18",       // panel base before glass blur
  surface: "rgba(255,255,255,0.06)",   // glass panel fill
  surfaceBorder: "rgba(255,255,255,0.12)",
  ink: "#F5F6FA",          // primary text (near-white)
  inkMuted: "rgba(245,246,250,0.62)",
  red: "#E10600",          // F1 signal red — primary accent
  gold: "#D4AF37",         // podium gold
  cyan: "#00D9FF",         // telemetry / DRS accent
  green: "#00C97A",        // positive delta / purple-lap-adjacent success
  purple: "#B14EFF",       // fastest lap
  amber: "#F5A623",        // warnings / VSC
};

// Reusable class fragments (Tailwind) for glass surfaces.
export const GLASS = {
  panel:
    "backdrop-blur-xl bg-white/[0.06] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
  panelHover:
    "hover:bg-white/[0.09] hover:border-white/20 transition-colors duration-200",
  chip:
    "backdrop-blur-md bg-white/[0.08] border border-white/10",
};