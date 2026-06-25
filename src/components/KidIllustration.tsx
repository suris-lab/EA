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

function BagVariant({ category, color }: { category: EventCategory; color: string }) {
  const fill = color;
  switch (category) {
    case "school":
      return (
        <g>
          <rect x="63" y="34" width="16" height="20" rx="3" fill={fill} opacity="0.18" />
          <rect x="63" y="34" width="16" height="20" rx="3" fill="none" stroke={fill} strokeWidth="1.5" />
          <path d="M67 34 L67 30 Q71 27 75 30 L75 34" fill="none" stroke={fill} strokeWidth="1.5" />
          <rect x="67" y="40" width="8" height="5" rx="1" fill="none" stroke={fill} strokeWidth="1" />
        </g>
      );
    case "tutor":
      return (
        <g>
          <rect x="63" y="36" width="14" height="16" rx="4" fill={fill} opacity="0.18" />
          <rect x="63" y="36" width="14" height="16" rx="4" fill="none" stroke={fill} strokeWidth="1.5" />
          <path d="M66 36 L66 32 Q70 30 74 32 L74 36" fill="none" stroke={fill} strokeWidth="1.5" />
        </g>
      );
    case "medical":
      return (
        <g>
          <rect x="63" y="36" width="15" height="15" rx="3" fill={fill} opacity="0.18" />
          <rect x="63" y="36" width="15" height="15" rx="3" fill="none" stroke={fill} strokeWidth="1.5" />
          <line x1="70.5" y1="40" x2="70.5" y2="47" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="67" y1="43.5" x2="74" y2="43.5" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M66 36 Q70.5 32 75 36" fill="none" stroke={fill} strokeWidth="1.5" />
        </g>
      );
    case "family":
      return (
        <g>
          <rect x="63" y="37" width="14" height="14" rx="2" fill={fill} opacity="0.18" />
          <rect x="63" y="37" width="14" height="14" rx="2" fill="none" stroke={fill} strokeWidth="1.5" />
          <path d="M63 37 Q70 29 77 37" fill="none" stroke={fill} strokeWidth="1.5" />
        </g>
      );
    default:
      return (
        <g>
          <rect x="63" y="36" width="14" height="16" rx="3" fill={fill} opacity="0.18" />
          <rect x="63" y="36" width="14" height="16" rx="3" fill="none" stroke={fill} strokeWidth="1.5" />
          <path d="M66 36 L66 33 Q70 31 74 33 L74 36" fill="none" stroke={fill} strokeWidth="1.5" />
        </g>
      );
  }
}

const ZONE_RECTS: Record<PrepZone, { x: number; y: number; w: number; h: number }> = {
  head: { x: 16, y: 0, w: 38, h: 22 },
  body: { x: 16, y: 22, w: 42, h: 36 },
  feet: { x: 16, y: 58, w: 42, h: 22 },
  bag: { x: 58, y: 22, w: 26, h: 36 },
};

export default function KidIllustration({ category, activeZone, onZoneTap, preparation }: KidIllustrationProps) {
  const hex = getCategoryHex(category);
  const bodyColor = "#c4c9d4";

  const hasItems = (zone: PrepZone) => {
    const items = preparation[zone];
    return items && items.length > 0;
  };

  return (
    <div className="flex justify-center py-3">
      <svg viewBox="0 0 84 80" width="168" height="160" fill="none">
        {/* Head */}
        <circle cx="35" cy="10" r="9" fill={bodyColor} />

        {/* Body — simple rounded torso */}
        <rect x="26" y="21" width="18" height="22" rx="4" fill={bodyColor} />

        {/* Arms */}
        <rect x="19" y="23" width="7" height="16" rx="3.5" fill={bodyColor} />
        <rect x="44" y="23" width="7" height="16" rx="3.5" fill={bodyColor} />

        {/* Legs */}
        <rect x="28" y="43" width="7" height="18" rx="3.5" fill={bodyColor} />
        <rect x="37" y="43" width="7" height="18" rx="3.5" fill={bodyColor} />

        {/* Feet */}
        <ellipse cx="31" cy="62" rx="5" ry="3" fill={bodyColor} />
        <ellipse cx="41" cy="62" rx="5" ry="3" fill={bodyColor} />

        {/* Bag */}
        <BagVariant category={category} color={hex} />

        {/* Zone highlight overlays */}
        {ZONE_ORDER.map((zone) => {
          const r = ZONE_RECTS[zone];
          const isActive = activeZone === zone;
          return (
            <g key={zone}>
              {isActive && (
                <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="6"
                  fill={hex} opacity={0.1} stroke={hex} strokeWidth="1" strokeDasharray="3 2" />
              )}
              {hasItems(zone) && !isActive && (
                <circle cx={r.x + r.w - 3} cy={r.y + 5} r="3.5" fill={hex} />
              )}
              <rect x={r.x} y={r.y} width={r.w} height={r.h}
                fill="transparent" cursor="pointer" style={{ pointerEvents: "all" }}
                onClick={() => onZoneTap(zone)} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
