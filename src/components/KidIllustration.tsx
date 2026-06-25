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

const BODY = "#C1C7D3";

function BagVariant({ category, color }: { category: EventCategory; color: string }) {
  switch (category) {
    case "school":
      return (
        <g>
          <rect x="48" y="26" width="13" height="16" rx="3.5" fill={color} fillOpacity="0.2" />
          <rect x="48" y="26" width="13" height="16" rx="3.5" fill="none" stroke={color} strokeWidth="1.2" />
          <path d="M51 26 L51 23 Q54.5 21 58 23 L58 26" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <rect x="51" y="31" width="7" height="4" rx="1" fill="none" stroke={color} strokeWidth="0.8" />
        </g>
      );
    case "tutor":
      return (
        <g>
          <rect x="48" y="28" width="12" height="13" rx="4" fill={color} fillOpacity="0.2" />
          <rect x="48" y="28" width="12" height="13" rx="4" fill="none" stroke={color} strokeWidth="1.2" />
          <path d="M51 28 L51 25 Q54 23.5 57 25 L57 28" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    case "medical":
      return (
        <g>
          <rect x="48" y="28" width="12" height="12" rx="3" fill={color} fillOpacity="0.2" />
          <rect x="48" y="28" width="12" height="12" rx="3" fill="none" stroke={color} strokeWidth="1.2" />
          <line x1="54" y1="31.5" x2="54" y2="36.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="51.5" y1="34" x2="56.5" y2="34" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M51 28 Q54 25 57 28" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    case "family":
      return (
        <g>
          <rect x="48" y="29" width="12" height="11" rx="2.5" fill={color} fillOpacity="0.2" />
          <rect x="48" y="29" width="12" height="11" rx="2.5" fill="none" stroke={color} strokeWidth="1.2" />
          <path d="M48 29 Q54 22 60 29" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g>
          <rect x="48" y="28" width="12" height="13" rx="3" fill={color} fillOpacity="0.2" />
          <rect x="48" y="28" width="12" height="13" rx="3" fill="none" stroke={color} strokeWidth="1.2" />
          <path d="M51 28 L51 25.5 Q54 24 57 25.5 L57 28" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
  }
}

function StrollerGraphic({ color }: { color: string }) {
  return (
    <g>
      {/* Handle */}
      <path d="M68 20 L66.5 36" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Seat body */}
      <path d="M66 28 L66 38 Q66 40 68 40 L78 40 Q80 40 80 38 L80 30 Q80 28 78 28 Z"
        fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      {/* Canopy */}
      <path d="M66 28 Q73 20 80 28" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {/* Rear leg */}
      <line x1="69" y1="40" x2="69" y2="46" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Front leg */}
      <line x1="77" y1="40" x2="77" y2="46" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Rear wheel */}
      <circle cx="69" cy="48.5" r="2.5" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1" />
      {/* Front wheel */}
      <circle cx="77" cy="48.5" r="2.5" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1" />
    </g>
  );
}

const ZONE_RECTS: Record<PrepZone, { x: number; y: number; w: number; h: number }> = {
  head: { x: 18, y: 0, w: 24, h: 22 },
  body: { x: 14, y: 20, w: 36, h: 22 },
  feet: { x: 20, y: 38, w: 24, h: 18 },
  bag: { x: 44, y: 18, w: 22, h: 28 },
};

export default function KidIllustration({ category, activeZone, onZoneTap, preparation }: KidIllustrationProps) {
  const hex = getCategoryHex(category);

  const hasItems = (zone: PrepZone) => {
    const items = preparation[zone];
    return items && items.length > 0;
  };

  const showStroller = ZONE_ORDER.some((z) =>
    (preparation[z] || []).some((item) => item.id.endsWith("-stroller"))
  );

  const vb = showStroller ? "0 0 90 56" : "6 0 56 56";
  const w = showStroller ? 200 : 148;
  const h = showStroller ? 124 : 148;

  return (
    <div className="flex justify-center py-3">
      <svg viewBox={vb} width={w} height={h} fill="none">
        {/* === Child silhouette (filled shapes, no strokes) === */}

        {/* Head */}
        <circle cx="30" cy="9" r="8" fill={BODY} />

        {/* Neck (bridge head → torso) */}
        <rect x="26.5" y="15" width="7" height="5" rx="2" fill={BODY} />

        {/* Torso */}
        <rect x="22" y="18" width="16" height="20" rx="5.5" fill={BODY} />

        {/* Left arm */}
        <rect x="15" y="21" width="8.5" height="14" rx="4.25" fill={BODY} />

        {/* Right arm */}
        <rect x="36.5" y="21" width="8.5" height="14" rx="4.25" fill={BODY} />

        {/* Left leg */}
        <rect x="23" y="35" width="6.5" height="16" rx="3.25" fill={BODY} />

        {/* Right leg */}
        <rect x="30.5" y="35" width="6.5" height="16" rx="3.25" fill={BODY} />

        {/* === Category bag === */}
        <BagVariant category={category} color={hex} />

        {/* === Stroller (when selected) === */}
        {showStroller && <StrollerGraphic color={hex} />}

        {/* === Zone interaction overlays === */}
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
                <circle cx={r.x + r.w - 3} cy={r.y + 4} r="3" fill={hex} />
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
