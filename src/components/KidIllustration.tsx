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

const CHILD_PATH = [
  "M 30,1",
  "C 35.5,1 38,4.5 38,9",
  "C 38,13 36,16 33,17",
  "C 36,17.5 39,19 41,21",
  "C 42.5,22.5 42.5,25 42.5,28",
  "L 42.5,30",
  "C 42.5,34 40,36.5 37,36.5",
  "L 37,49",
  "C 37,51.5 35.5,53 34,53",
  "C 32.5,53 31.5,51.5 31.5,49",
  "L 31.5,37.5",
  "Q 30,35.5 28.5,37.5",
  "L 28.5,49",
  "C 28.5,51.5 27.5,53 26,53",
  "C 24.5,53 23,51.5 23,49",
  "L 23,36.5",
  "C 20,36.5 17.5,34 17.5,30",
  "L 17.5,28",
  "C 17.5,25 17.5,22.5 19,21",
  "C 21,19 24,17.5 27,17",
  "C 24,16 22,13 22,9",
  "C 22,4.5 24.5,1 30,1",
  "Z",
].join(" ");

function BagVariant({ category, color }: { category: EventCategory; color: string }) {
  switch (category) {
    case "school":
      return (
        <g>
          <rect x="44" y="22" width="14" height="18" rx="3.5" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.2" />
          <path d="M47 22 L47 19 Q51 17 55 19 L55 22" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <rect x="47.5" y="28" width="7" height="4.5" rx="1.2" fill="none" stroke={color} strokeWidth="0.8" />
        </g>
      );
    case "tutor":
      return (
        <g>
          <rect x="44" y="25" width="12" height="14" rx="4" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.2" />
          <path d="M47 25 L47 22 Q50 20.5 53 22 L53 25" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    case "medical":
      return (
        <g>
          <rect x="44" y="25" width="13" height="13" rx="3" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.2" />
          <line x1="50.5" y1="28.5" x2="50.5" y2="34.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="47.5" y1="31.5" x2="53.5" y2="31.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M47 25 Q50.5 22 54 25" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    case "family":
      return (
        <g>
          <rect x="44" y="27" width="12" height="12" rx="2.5" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.2" />
          <path d="M44 27 Q50 20 56 27" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g>
          <rect x="44" y="25" width="12" height="14" rx="3" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.2" />
          <path d="M47 25 L47 22.5 Q50 21 53 22.5 L53 25" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
  }
}

function StrollerGraphic({ color }: { color: string }) {
  return (
    <g>
      <path d="M66 18 C66 18 65 28 64.5 35" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M64 27 L64 38 Q64 40 66 40 L78 40 Q80 40 80 38 L80 30 Q80 27 77 27 Z"
        fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M64 27 Q72 18 80 27" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.2" />
      <line x1="67" y1="40" x2="67" y2="45.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="77" y1="40" x2="77" y2="45.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="67" cy="48.5" r="3" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
      <circle cx="77" cy="48.5" r="3" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.2" />
    </g>
  );
}

const ZONE_RECTS: Record<PrepZone, { x: number; y: number; w: number; h: number }> = {
  head: { x: 18, y: 0, w: 24, h: 20 },
  body: { x: 14, y: 18, w: 32, h: 20 },
  feet: { x: 20, y: 35, w: 22, h: 20 },
  bag: { x: 42, y: 18, w: 20, h: 26 },
};

export default function KidIllustration({ category, activeZone, onZoneTap, preparation }: KidIllustrationProps) {
  const hex = getCategoryHex(category);

  const hasItems = (zone: PrepZone) => {
    const items = preparation[zone];
    return items && items.length > 0;
  };

  const showStroller = !!preparation.stroller;

  const vb = showStroller ? "6 0 84 56" : "10 0 52 56";
  const svgH = 140;
  const svgW = showStroller ? 210 : 130;

  return (
    <div className="flex justify-center py-3">
      <svg viewBox={vb} width={svgW} height={svgH} fill="none">
        {/* Child — single fused silhouette */}
        <path d={CHILD_PATH} fill={BODY} />

        {/* Category bag */}
        <BagVariant category={category} color={hex} />

        {/* Stroller */}
        {showStroller && <StrollerGraphic color={hex} />}

        {/* Zone interaction overlays */}
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
