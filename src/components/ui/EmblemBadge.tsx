import { EMBLEMS } from "@/lib/data";

export function EmblemBadge({ emblemId, size = 32 }: { emblemId: string; size?: number }) {
  const emblem = EMBLEMS.find((e) => e.id === emblemId) ?? EMBLEMS[0];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 2 L36 8 V20 C36 30 29 36 20 38 C11 36 4 30 4 20 V8 Z" fill={emblem.colors[0]} />
      <path d="M20 2 L36 8 V20 C36 28 31 34 22 37.5 L20 38 L20 2 Z" fill={emblem.colors[1]} opacity="0.88" />
      <path
        d="M20 2 L36 8 V20 C36 30 29 36 20 38 C11 36 4 30 4 20 V8 Z"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
      />
    </svg>
  );
}