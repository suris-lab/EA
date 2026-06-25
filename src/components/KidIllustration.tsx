"use client";

import type { EventCategory, PrepZone, PreparationData } from "@/types/event";
import { getCategoryHex } from "@/types/event";
import { ZONE_ORDER } from "@/lib/prep-presets";

interface KidIllustrationProps {
  category: EventCategory;
  activeZone: PrepZone | null;
  onZoneTap: (zone: PrepZone) => void;
  preparation: PreparationData;
}

function BagVariant({ category }: { category: EventCategory }) {
  switch (category) {
    case "school":
      return (
        <g>
          {/* Schoolbag on back */}
          <rect x="72" y="62" width="22" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="76" y1="62" x2="76" y2="56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="90" y1="62" x2="90" y2="56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <rect x="76" y="72" width="14" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </g>
      );
    case "tutor":
      return (
        <g>
          {/* Small backpack */}
          <rect x="74" y="66" width="18" height="22" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="78" y1="66" x2="78" y2="60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="88" y1="66" x2="88" y2="60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "medical":
      return (
        <g>
          {/* Medical bag with cross */}
          <rect x="74" y="68" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="83" y1="73" x2="83" y2="81" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="79" y1="77" x2="87" y2="77" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M78 68 Q83 63 88 68" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "family":
      return (
        <g>
          {/* Tote/sling bag */}
          <rect x="74" y="70" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M74 70 Q83 60 92 70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g>
          {/* Generic backpack */}
          <rect x="74" y="66" width="18" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="78" y1="66" x2="78" y2="61" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="88" y1="66" x2="88" y2="61" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
  }
}

const ZONE_RECTS: Record<PrepZone, { x: number; y: number; w: number; h: number }> = {
  head: { x: 25, y: 5, w: 50, h: 48 },
  body: { x: 20, y: 53, w: 60, h: 55 },
  feet: { x: 20, y: 108, w: 60, h: 52 },
  bag: { x: 68, y: 53, w: 30, h: 55 },
};

export default function KidIllustration({ category, activeZone, onZoneTap, preparation }: KidIllustrationProps) {
  const hex = getCategoryHex(category);

  const hasItems = (zone: PrepZone) => {
    const items = preparation[zone];
    return items && items.length > 0;
  };

  return (
    <div className="flex justify-center py-2">
      <svg viewBox="0 0 120 160" width="140" height="187" className="text-text-secondary" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Head */}
        <circle cx="50" cy="25" r="16" stroke="currentColor" strokeWidth="2" />
        {/* Eyes */}
        <circle cx="44" cy="23" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="56" cy="23" r="1.5" fill="currentColor" stroke="none" />
        {/* Smile */}
        <path d="M45 29 Q50 33 55 29" stroke="currentColor" strokeWidth="1.5" fill="none" />

        {/* Neck */}
        <line x1="50" y1="41" x2="50" y2="48" stroke="currentColor" strokeWidth="2" />

        {/* Torso */}
        <path d="M34 48 L66 48 L62 90 L38 90 Z" stroke="currentColor" strokeWidth="2" />

        {/* Arms */}
        <path d="M34 48 L22 72" stroke="currentColor" strokeWidth="2" />
        <path d="M66 48 L72 65" stroke="currentColor" strokeWidth="2" />

        {/* Hands */}
        <circle cx="22" cy="73" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="72" cy="66" r="3" stroke="currentColor" strokeWidth="1.5" />

        {/* Legs */}
        <line x1="44" y1="90" x2="40" y2="125" stroke="currentColor" strokeWidth="2" />
        <line x1="56" y1="90" x2="60" y2="125" stroke="currentColor" strokeWidth="2" />

        {/* Shoes */}
        <path d="M35 125 L40 125 L42 130 L33 130 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M58 125 L63 125 L65 130 L56 130 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />

        {/* Category-specific bag */}
        <BagVariant category={category} />

        {/* Zone highlight overlays */}
        {ZONE_ORDER.map((zone) => {
          const r = ZONE_RECTS[zone];
          const isActive = activeZone === zone;
          return (
            <g key={zone}>
              {isActive && (
                <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="8"
                  fill={hex} opacity={0.12} stroke={hex} strokeWidth="1.5" strokeDasharray="4 3" />
              )}
              {/* Item indicator dot */}
              {hasItems(zone) && !isActive && (
                <circle cx={r.x + r.w - 4} cy={r.y + 6} r="4" fill={hex} />
              )}
              {/* Tappable overlay */}
              <rect x={r.x} y={r.y} width={r.w} height={r.h}
                fill="transparent" cursor="pointer"
                onClick={() => onZoneTap(zone)} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
