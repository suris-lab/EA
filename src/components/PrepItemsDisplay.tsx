"use client";

import type { PreparationData, PrepItem, EventCategory } from "@/types/event";
import { getCategoryHex } from "@/types/event";
import { ZONE_LABELS, ZONE_ORDER } from "@/lib/prep-presets";

interface PrepItemsDisplayProps {
  preparation: PreparationData;
  category?: EventCategory | null;
}

export default function PrepItemsDisplay({ preparation, category }: PrepItemsDisplayProps) {
  const hasAny = ZONE_ORDER.some((z) => preparation[z] && preparation[z]!.length > 0) || preparation.stroller;
  if (!hasAny) return null;

  const hex = getCategoryHex(category);

  return (
    <div className="flex gap-3">
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <div className="space-y-1.5">
        {ZONE_ORDER.map((zone) => {
          const items = preparation[zone];
          if (!items || items.length === 0) return null;
          return (
            <div key={zone}>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                {ZONE_LABELS[zone]}
              </span>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {items.map((item: PrepItem) => (
                  <span
                    key={item.id}
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                    style={{ backgroundColor: hex }}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        {preparation.stroller && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            <span className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white" style={{ backgroundColor: hex }}>
              Baby cart / Stroller
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
