"use client";

import type { EventCategory, PrepZone, PreparationData } from "@/types/event";
import { getCategoryHex } from "@/types/event";
import { ZONE_ORDER } from "@/lib/prep-presets";

export type ActiveZone = PrepZone | "stroller" | null;

interface KidIllustrationProps {
  category: EventCategory;
  activeZone: ActiveZone;
  onZoneTap: (zone: PrepZone | "stroller") => void;
  preparation: PreparationData;
}

const BODY = "#C1C7D3";

const KID_D1 = "M148.53,988.06c-20.27-2.26-37.24-15.9-44.38-31.91-8.44-18.93-7.43-42.16,5.98-57.76l80.89-94.1c5.91-6.88,8.41-17.92,11.6-26.29l21.31-55.9c19.78-13,32.72-31.76,35.57-55.2l23.77-102.27c18.7-27.36,35.65-53.76,51.21-82.66,22.61-45.63,18.96-104.41-25.67-129.13-34.33-19.01-74.86-3.45-94.07,31.26-23.1,44.44-44.24,87.93-64.81,133.86l-25.49,140.1-29.19-3.18c-18.6-2.03-35.65-6.69-50.86-17.98-18.59-13.8-31-35.83-28.18-60.19,5.73-49.46,12.71-97.36,21.01-146.35,8.5-50.13,41.41-91.71,91.58-102.93.8-15.53,4.61-29.37,15.8-39.07,19-16.47,48.4-14.17,64.83,4.88,9.52,11.03,11.25,24.48,9.73,40.57,18.69-15.2,39.06-21.45,62.12-22.9,6.48-.41,8.51-14.71,2.6-18.11-44.2-25.43-71.78-69.88-75.4-121.44-1.89-26.95,4.89-53.72,17.29-77.7,27.25-52.68,81.41-82.19,140.74-78.17,36.28,2.46,69.56,17.7,94.83,44.49,37.34,39.58,51.07,95.19,34.02,148.93-14.91,47-54.22,85.87-105.4,99.44-4.8,1.27-7.61,9.35-7.64,13.27-.05,5.26,2.53,11.89,6.91,15.71,20.38,17.8,34.28,39.44,44.15,64.43l11.35,37.65c6.14,20.37,19.53,37.56,29.97,56.24,3.97,7.09,10.64,12.93,17.79,16.64,26.47,13.74,53.02,24.16,80.76,34.71,20.56,7.81,31,30.63,25.59,50.39-5.43,19.82-26.12,35.77-47.49,30.89-20.4-4.65-39.26-11.69-58.93-18.48-16.12-5.56-31.08-13.05-46.77-20.97l-14.45,76.5c-1.34,7.1.76,13.37,4.67,18.97l51.98,74.38c7.73,11.07,12.9,22.61,16.86,35.63l39.54,130.07c5.59,18.4,3.91,37.8-7.36,54.08-9.27,13.39-26.37,24.22-45.27,25.18-29.2,1.49-51.93-18.63-60.73-45.58l-41.83-128.09-52.63-60.9c-7.53-8.72-35.61-30.07-36.31-26.5l-1.16,6,30.58,44.14-36.54,71.7-89.56,99.99c-14.32,15.98-31.33,26.26-54.87,23.64l-.04.02ZM196.83,330.21c.82-8.45.33-16.07-4.33-22.44-2.97-4.07-11.06-6.97-17.38-7.41-15.57-1.08-24.74,10.55-24.61,25.2l46.32,4.65h0Z";
const KID_D2 = "M236.18,675.34c-5.67,23.88-31.62,35.51-51.85,32.16-24.11-3.99-39.04-24.84-38.76-49.64,7.34-46,14.93-90.17,24.62-135.89l62.04-127.58c10.21-19.45,29.52-30.98,51.15-28.1,20.14,2.68,36.72,18.04,41.65,39.19,5.86,25.09,2.23,51.28-11.82,73.41l-48.54,76.44-28.49,120.01h0Z";

const BAG_D1 = "M465.01,859.92H168.29c-23.74,0-46.26-11.41-59.93-28.73-13.92-17.63-20.03-39.02-20.04-61.89l-.19-321.77,1.96-26.97c7.68-80.75,53.97-140.67,131.17-166.46-1.83-38.49,20.89-71.54,56.77-84.17,23.7-7.35,47.8-7.86,71.71-.99,37.38,11.34,62,45.51,59.4,84.81,53.22,17.4,95.79,53.99,116.84,105.45,10.39,25.41,13.7,50.59,16.2,78.3l-.05,333.88c0,12.49-3.16,23.57-6.76,35.31-9.22,30.06-36.02,53.24-70.34,53.24h-.02ZM362.64,243.77l12.41.97c-1.37-17.19-11.3-33.84-27.75-40.7-18.18-7.58-38.87-7.76-57.5-2.38-19.9,5.74-32.3,22.92-33.44,43.27l14.08-1.1,92.2-.06ZM473.51,609.07l.71,168.36c.02,4.29,7.96,6.63,11.18,5.48,2.72-.97,6.79-5.07,6.79-8.97l-.23-170.51c-7-42.21-38.41-71.92-81.38-71.87l-190.95.23c-43.13.05-80.39,33.33-80.54,76.78l-.6,166.31c-.02,5.35,8.07,9.26,11.53,8.27,4.23-1.21,7.06-5.51,7.09-11.06l.77-164.17c.16-33.45,29.46-56.32,61.62-56.36l191.33-.24c32.79-.04,62.53,22.26,62.68,57.74h0Z";
const BAG_D2 = "M611.34,737.05c.09,38.63-22.37,74.46-59.97,80.69,4.25-13.65,9.32-26.11,9.33-40.28l.18-224.73c30.78-.12,50.11,29.33,50.17,55.4l.29,128.93h0Z";
const BAG_D3 = "M78.64,817.86c-33.78-4.97-59.45-42.28-59.41-74.56l.16-136.9c.03-23.86,20.93-53.37,49.8-53.44l.25,224.52c.02,14.22,5.31,26.51,9.2,40.39h0Z";

const STROLLER_D1 = "M345.94,948.31c-40.62,34.68-101.26,30.38-136.95-7.95-30.37-32.61-35.12-79.97-13.91-118.44,27.66-50.17,89.57-66.68,138.57-37.26l63.91-69.98c-2.23-8.4-3.06-14.6-3.65-23.35l-75.69-.26c-53.43-.19-98.16-30.77-120.69-79.18-16.13-34.66-22.14-72.17-24.65-110.71-.46-7.03-.18-14.3,3.54-20.24,3.53-5.65,11.58-8.29,19.08-8.38l58.58-.72-124.02-172.7c-2.71-3.77-7.82-7.11-12.06-7.93l-68.24-13.19c-14.59-2.82-20.96-21.28-17.17-32.54,4.98-14.81,18.34-21.01,33.32-17.94l67.94,13.91c11.8,2.42,25.57,10.55,33.05,21.04l272.76,382.44c17.66-1.82,32.76,3.28,44.51,15.56,11.44,11.96,16.28,28.57,12.94,46.69l88.8,87.18c48.93-40.6,119.78-27.76,151.09,24.45,18.98,31.65,18.89,68.08,2.66,99.51-24.37,47.22-80.82,65.68-128.64,45.05-47.8-20.62-71.59-76.42-53.28-126.95l-94.27-91.33c-9.36,2.18-17.79,3.04-28.16,2.49l-67.17,71.82c24.46,43.5,15.85,96.44-22.2,128.92ZM331.26,871.08c0-27.31-22.14-49.45-49.46-49.45s-49.46,22.14-49.46,49.45,22.14,49.45,49.46,49.45,49.46-22.14,49.46-49.45ZM700.9,871.08c0-27.32-22.16-49.47-49.49-49.47s-49.49,22.15-49.49,49.47,22.16,49.47,49.49,49.47,49.49-22.15,49.49-49.47Z";
const STROLLER_D2 = "M756.82,640.49c-25.3,32-60.97,50.77-101.55,50.74l-138.61-.11c-1.68-37.34-30.79-63.59-66.98-66.2l-106.85-152.31,438.76-.28c9.86.7,18.73,7.56,18.43,17.83-1.47,50.69-11.33,109.16-43.2,150.32Z";
const STROLLER_D3 = "M782.02,450.21l-236-.06c-9.32,0-15.34-7.92-16.89-16.22l-51.99-277.86c-1.09-5.82,1.3-12.72,4.45-16.3,3.16-3.59,9.32-6.34,15.64-6.23,163.74,2.83,304.66,128.94,303.17,296.73-.1,10.91-6.56,19.94-18.37,19.93Z";

const KID_SCALE = 0.048;
const KID_CX = 18;
const BAG_SCALE = 0.04;
const STROLLER_SCALE = 0.038;

const ZONE_RECTS: Record<PrepZone, { x: number; y: number; w: number; h: number }> = {
  head: { x: 8, y: -1, w: 20, h: 14 },
  body: { x: 2, y: 12, w: 28, h: 18 },
  feet: { x: 0, y: 28, w: 30, h: 24 },
  bag: { x: 36, y: 3, w: 28, h: 44 },
};

export default function KidIllustration({ category, activeZone, onZoneTap, preparation }: KidIllustrationProps) {
  const hex = getCategoryHex(category);

  const hasItems = (zone: PrepZone) => {
    const items = preparation[zone];
    return items && items.length > 0;
  };

  const showStroller = Array.isArray(preparation.stroller);
  const strollerHasItems = showStroller && preparation.stroller!.length > 0;
  const vb = showStroller ? "-3 -2 100 56" : "-3 -2 66 56";
  const svgW = showStroller ? 250 : 168;

  return (
    <div className="flex justify-center py-3">
      <svg viewBox={vb} width={svgW} height={140} fill="none">
        <defs>
          <clipPath id="kid-silhouette">
            <path d={KID_D1} transform={`scale(${KID_SCALE})`} />
            <path d={KID_D2} transform={`scale(${KID_SCALE})`} />
          </clipPath>

          {/* Head: solid top, fades at neck */}
          <linearGradient id="head-fade" gradientUnits="userSpaceOnUse" x1="0" y1="-2" x2="0" y2="16">
            <stop offset="0%" stopColor="white" />
            <stop offset="55%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </linearGradient>
          <mask id="head-mask"><rect x="-10" y="-10" width="120" height="70" fill="url(#head-fade)" /></mask>

          {/* Body: fades at top (neck) and bottom (waist) */}
          <linearGradient id="body-fade" gradientUnits="userSpaceOnUse" x1="0" y1="8" x2="0" y2="36">
            <stop offset="0%" stopColor="black" />
            <stop offset="18%" stopColor="white" />
            <stop offset="78%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </linearGradient>
          <mask id="body-mask"><rect x="-10" y="-10" width="120" height="70" fill="url(#body-fade)" /></mask>

          {/* Feet: fades at top (waist), solid bottom */}
          <linearGradient id="feet-fade" gradientUnits="userSpaceOnUse" x1="0" y1="26" x2="0" y2="54">
            <stop offset="0%" stopColor="black" />
            <stop offset="25%" stopColor="white" />
            <stop offset="100%" stopColor="white" />
          </linearGradient>
          <mask id="feet-mask"><rect x="-10" y="-10" width="120" height="70" fill="url(#feet-fade)" /></mask>
        </defs>

        {/* Child with backpack */}
        <g id="child-with-backpack" transform={`scale(${KID_SCALE})`}>
          <path d={KID_D1} fill={BODY} />
          <path d={KID_D2} fill={BODY} />
        </g>

        {/* Active zone: color body part with gradient fade via clip + mask */}
        {activeZone === "head" && (
          <rect x={-5} y={-3} width={40} height={22} fill={hex}
            clipPath="url(#kid-silhouette)" mask="url(#head-mask)" />
        )}
        {activeZone === "body" && (
          <rect x={-5} y={6} width={40} height={32} fill={hex}
            clipPath="url(#kid-silhouette)" mask="url(#body-mask)" />
        )}
        {activeZone === "feet" && (
          <rect x={-5} y={24} width={40} height={32} fill={hex}
            clipPath="url(#kid-silhouette)" mask="url(#feet-mask)" />
        )}

        {/* Standalone school bag — grey when inactive, category color when active */}
        <g id="school-backpack" transform={`translate(37, 5) scale(${BAG_SCALE})`}>
          <path d={BAG_D1} fill={activeZone === "bag" ? hex : BODY} />
          <path d={BAG_D2} fill={activeZone === "bag" ? hex : BODY} />
          <path d={BAG_D3} fill={activeZone === "bag" ? hex : BODY} />
        </g>

        {/* Baby stroller — grey when inactive, category color when active */}
        {showStroller && (
          <g id="baby-stroller" transform={`translate(64, 10) scale(${STROLLER_SCALE})`}>
            <path d={STROLLER_D1} fill={activeZone === "stroller" ? hex : BODY} />
            <path d={STROLLER_D2} fill={activeZone === "stroller" ? hex : BODY} />
            <path d={STROLLER_D3} fill={activeZone === "stroller" ? hex : BODY} />
          </g>
        )}

        {/* Plus indicators — kid zones aligned on head center x */}
        {hasItems("head") && activeZone !== "head" && (
          <g><circle cx={KID_CX} cy={8} r="4.5" fill={hex} />
            <line x1={KID_CX - 2.2} y1={8} x2={KID_CX + 2.2} y2={8} stroke="white" strokeWidth="1.3" strokeLinecap="round" />
            <line x1={KID_CX} y1={5.8} x2={KID_CX} y2={10.2} stroke="white" strokeWidth="1.3" strokeLinecap="round" /></g>
        )}
        {hasItems("body") && activeZone !== "body" && (
          <g><circle cx={KID_CX} cy={24} r="4.5" fill={hex} />
            <line x1={KID_CX - 2.2} y1={24} x2={KID_CX + 2.2} y2={24} stroke="white" strokeWidth="1.3" strokeLinecap="round" />
            <line x1={KID_CX} y1={21.8} x2={KID_CX} y2={26.2} stroke="white" strokeWidth="1.3" strokeLinecap="round" /></g>
        )}
        {hasItems("feet") && activeZone !== "feet" && (
          <g><circle cx={KID_CX} cy={42} r="4.5" fill={hex} />
            <line x1={KID_CX - 2.2} y1={42} x2={KID_CX + 2.2} y2={42} stroke="white" strokeWidth="1.3" strokeLinecap="round" />
            <line x1={KID_CX} y1={39.8} x2={KID_CX} y2={44.2} stroke="white" strokeWidth="1.3" strokeLinecap="round" /></g>
        )}
        {/* Plus indicator on bag */}
        {hasItems("bag") && activeZone !== "bag" && (
          <g><circle cx={50} cy={26} r="4.5" fill={hex} />
            <line x1={47.8} y1={26} x2={52.2} y2={26} stroke="white" strokeWidth="1.3" strokeLinecap="round" />
            <line x1={50} y1={23.8} x2={50} y2={28.2} stroke="white" strokeWidth="1.3" strokeLinecap="round" /></g>
        )}

        {/* Invisible tap targets */}
        {ZONE_ORDER.map((zone) => {
          const r = ZONE_RECTS[zone];
          return (
            <rect key={zone} x={r.x} y={r.y} width={r.w} height={r.h}
              fill="transparent" cursor="pointer" style={{ pointerEvents: "all" }}
              onClick={() => onZoneTap(zone)} />
          );
        })}

        {/* Stroller plus indicator + tap target */}
        {showStroller && (
          <g>
            {strollerHasItems && activeZone !== "stroller" && (
              <g><circle cx={81} cy={30} r="4.5" fill={hex} />
                <line x1={78.8} y1={30} x2={83.2} y2={30} stroke="white" strokeWidth="1.3" strokeLinecap="round" />
                <line x1={81} y1={27.8} x2={81} y2={32.2} stroke="white" strokeWidth="1.3" strokeLinecap="round" /></g>
            )}
            <rect x={62} y={8} width={36} height={44}
              fill="transparent" cursor="pointer" style={{ pointerEvents: "all" }}
              onClick={() => onZoneTap("stroller")} />
          </g>
        )}
      </svg>
    </div>
  );
}
