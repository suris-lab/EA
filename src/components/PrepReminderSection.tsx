"use client";

import { useEffect, useRef, useState } from "react";
import type { EventCategory, PrepZone, PreparationData, PrepItem } from "@/types/event";
import { getCategoryHex } from "@/types/event";
import { PREP_PRESETS, ZONE_LABELS, ZONE_ORDER, STROLLER_PRESETS, STROLLER_LABEL } from "@/lib/prep-presets";
import { L, BiText } from "@/lib/labels";
import KidIllustration, { type ActiveZone } from "./KidIllustration";

const CUSTOM_KEY = "ea-custom-prep";
const HIDDEN_KEY = "ea-hidden-presets";

function loadSavedCustoms(): Record<string, { id: string; label: string }[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "{}"); } catch { return {}; }
}

function saveCustoms(data: Record<string, { id: string; label: string }[]>) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(data));
}

function loadHiddenPresets(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]")); } catch { return new Set(); }
}

function saveHiddenPresets(set: Set<string>) {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...set]));
}

interface PrepReminderSectionProps {
  category: EventCategory;
  preparation: PreparationData;
  onUpdate: (data: PreparationData) => void;
}

export default function PrepReminderSection({ category, preparation, onUpdate }: PrepReminderSectionProps) {
  const [activeZone, setActiveZone] = useState<ActiveZone>(null);
  const [customInput, setCustomInput] = useState("");
  const [savedCustoms, setSavedCustoms] = useState<Record<string, { id: string; label: string }[]>>(loadSavedCustoms);
  const [hiddenPresets, setHiddenPresets] = useState<Set<string>>(loadHiddenPresets);
  const [suggestion, setSuggestion] = useState<{ original: string; bilingual: string } | null>(null);
  const [suggestEnabled, setSuggestEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("ea-suggest-bilingual") !== "0";
  });
  const prevCategory = useRef(category);

  useEffect(() => {
    if (prevCategory.current === category) return;
    prevCategory.current = category;

    const newPresets = PREP_PRESETS[category];
    const updated: PreparationData = {};

    for (const zone of ZONE_ORDER) {
      const existing = preparation[zone] || [];
      const validIds = new Set(newPresets[zone].map((p) => p.id));
      const kept = existing.filter((item) => item.isCustom || validIds.has(item.id));
      if (kept.length > 0) updated[zone] = kept;
    }

    if (preparation.stroller) updated.stroller = preparation.stroller;
    onUpdate(updated);
  }, [category, preparation, onUpdate]);

  const hex = getCategoryHex(category);
  const showStroller = Array.isArray(preparation.stroller);

  const getZoneItems = (zone: ActiveZone): PrepItem[] => {
    if (zone === "stroller") return preparation.stroller || [];
    if (zone) return preparation[zone] || [];
    return [];
  };

  const getZonePresets = (zone: ActiveZone) => {
    let presets: { id: string; label: string }[] = [];
    if (zone === "stroller") presets = STROLLER_PRESETS;
    else if (zone) presets = PREP_PRESETS[category][zone];
    return presets.filter((p) => !hiddenPresets.has(p.id));
  };

  const getSavedCustomsForZone = (zone: ActiveZone): { id: string; label: string }[] => {
    if (!zone) return [];
    return savedCustoms[zone] || [];
  };

  const getZoneLabel = (zone: ActiveZone) => {
    if (zone === "stroller") return STROLLER_LABEL;
    if (zone) return ZONE_LABELS[zone];
    return "";
  };

  const togglePreset = (zone: ActiveZone, preset: { id: string; label: string }) => {
    const items = getZoneItems(zone);
    const exists = items.some((i) => i.id === preset.id);
    const newItems = exists
      ? items.filter((i) => i.id !== preset.id)
      : [...items, { id: preset.id, label: preset.label }];

    if (zone === "stroller") {
      onUpdate({ ...preparation, stroller: newItems });
    } else if (zone) {
      const updated = { ...preparation, [zone]: newItems };
      if (newItems.length === 0) delete updated[zone as PrepZone];
      onUpdate(updated);
    }
  };

  const toggleCustom = (zone: ActiveZone, item: { id: string; label: string }) => {
    const items = getZoneItems(zone);
    const exists = items.some((i) => i.id === item.id);
    const newItems = exists
      ? items.filter((i) => i.id !== item.id)
      : [...items, { id: item.id, label: item.label, isCustom: true }];

    if (zone === "stroller") {
      onUpdate({ ...preparation, stroller: newItems });
    } else if (zone) {
      const updated = { ...preparation, [zone]: newItems };
      if (newItems.length === 0) delete updated[zone as PrepZone];
      onUpdate(updated);
    }
  };

  const hasChinese = (s: string) => /[一-鿿㐀-䶿]/.test(s);
  const hasEnglish = (s: string) => /[a-zA-Z]{2,}/.test(s);
  const isMono = (s: string) => (hasChinese(s) && !hasEnglish(s)) || (hasEnglish(s) && !hasChinese(s));

  const commitItem = (zone: ActiveZone, label: string) => {
    if (!zone) return;
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const items = getZoneItems(zone);
    const newItems = [...items, { id, label, isCustom: true } as PrepItem];

    if (zone === "stroller") {
      onUpdate({ ...preparation, stroller: newItems });
    } else {
      onUpdate({ ...preparation, [zone]: newItems });
    }

    const updated = { ...savedCustoms };
    updated[zone] = [...(updated[zone] || []), { id, label }];
    setSavedCustoms(updated);
    saveCustoms(updated);
  };

  const addCustomItem = async (zone: ActiveZone) => {
    const label = customInput.trim();
    if (!label || !zone) return;

    if (suggestEnabled && isMono(label)) {
      setCustomInput("");
      setSuggestion(null);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: label }),
        });
        const data = await res.json();
        if (data.suggestion && data.suggestion !== label) {
          setSuggestion({ original: label, bilingual: data.suggestion });
          return;
        }
      } catch { /* fall through */ }
    }

    commitItem(zone, label);
    setCustomInput("");
    setSuggestion(null);
  };

  const acceptSuggestion = () => {
    if (!suggestion) return;
    commitItem(activeZone, suggestion.bilingual);
    setSuggestion(null);
  };

  const rejectSuggestion = () => {
    if (!suggestion) return;
    commitItem(activeZone, suggestion.original);
    setSuggestion(null);
  };

  const toggleSuggest = () => {
    const next = !suggestEnabled;
    setSuggestEnabled(next);
    localStorage.setItem("ea-suggest-bilingual", next ? "1" : "0");
  };

  const deleteCustom = (zone: ActiveZone, itemId: string) => {
    if (!zone) return;

    const newItems = getZoneItems(zone).filter((i) => i.id !== itemId);
    if (zone === "stroller") {
      onUpdate({ ...preparation, stroller: newItems });
    } else {
      const updated = { ...preparation, [zone]: newItems };
      if (newItems.length === 0) delete updated[zone as PrepZone];
      onUpdate(updated);
    }

    const updated = { ...savedCustoms };
    updated[zone] = (updated[zone] || []).filter((i) => i.id !== itemId);
    if (updated[zone].length === 0) delete updated[zone];
    setSavedCustoms(updated);
    saveCustoms(updated);
  };

  const handleZoneTap = (zone: PrepZone | "stroller") => {
    setActiveZone((prev) => (prev === zone ? null : zone));
    setCustomInput("");
  };

  const hidePreset = (zone: ActiveZone, presetId: string) => {
    if (!zone) return;
    const newItems = getZoneItems(zone).filter((i) => i.id !== presetId);
    if (zone === "stroller") {
      onUpdate({ ...preparation, stroller: newItems });
    } else {
      const updated = { ...preparation, [zone]: newItems };
      if (newItems.length === 0) delete updated[zone as PrepZone];
      onUpdate(updated);
    }
    const next = new Set(hiddenPresets);
    next.add(presetId);
    setHiddenPresets(next);
    saveHiddenPresets(next);
  };

  const toggleStroller = () => {
    if (showStroller) {
      const updated = { ...preparation };
      delete updated.stroller;
      setActiveZone(null);
      onUpdate(updated);
    } else {
      onUpdate({ ...preparation, stroller: [] });
    }
  };

  const totalItems =
    ZONE_ORDER.reduce((n, z) => n + (preparation[z]?.length || 0), 0) +
    (preparation.stroller?.length || 0);

  const currentPresets = getZonePresets(activeZone);
  const currentItems = getZoneItems(activeZone);
  const currentSavedCustoms = getSavedCustomsForZone(activeZone);

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
        <BiText text={L.prepReminder} />
      </label>

      <div className="rounded-2xl border border-border-light bg-surface-dim p-4">
        <p className="mb-2 text-center text-[11px] text-text-muted"><BiText text={L.tapZoneHint} /></p>

        <KidIllustration
          category={category}
          activeZone={activeZone}
          onZoneTap={handleZoneTap}
          preparation={preparation}
        />

        {/* Stroller toggle */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggleStroller}
            className="flex items-center gap-2 rounded-full h-9 px-4 text-[13px] font-semibold transition-all"
            style={
              showStroller
                ? { backgroundColor: hex, color: "#fff" }
                : { border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }
            }
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 3 L4 14 L16 14 L16 8 Q16 6 14 6 L4 6" />
              <path d="M4 6 Q10 1 16 6" />
              <circle cx="7" cy="17.5" r="1.8" />
              <circle cx="14" cy="17.5" r="1.8" />
            </svg>
            <BiText text={L.strollerLabel} />
          </button>
        </div>

        {/* Zone editing panel */}
        {activeZone && (
          <div className="animate-slide-down mt-3 rounded-2xl border border-border-light bg-surface p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[15px] font-semibold text-text-primary">{getZoneLabel(activeZone)}</span>
              <button
                type="button"
                onClick={() => setActiveZone(null)}
                className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-dim"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preset + saved custom pills — all deletable */}
            <div className="mb-3 flex flex-wrap gap-2">
              {currentPresets.map((preset) => {
                const selected = currentItems.some((i) => i.id === preset.id);
                return (
                  <span key={preset.id} className="inline-flex items-center">
                    <button type="button" onClick={() => togglePreset(activeZone, preset)}
                      className="rounded-l-full h-9 px-3 text-[13px] font-semibold transition-all"
                      style={selected
                        ? { backgroundColor: hex, color: "#fff" }
                        : { border: "1px solid var(--color-border)", borderRight: "none", color: "var(--color-text-secondary)" }}>
                      {preset.label}
                    </button>
                    <button type="button" onClick={() => hidePreset(activeZone, preset.id)}
                      className="rounded-r-full h-9 px-2 text-[13px] transition-all"
                      style={selected
                        ? { backgroundColor: hex, color: "#fff", opacity: 0.8 }
                        : { border: "1px solid var(--color-border)", borderLeft: "none", color: "var(--color-text-muted)" }}>
                      ×
                    </button>
                  </span>
                );
              })}
              {currentSavedCustoms.map((item) => {
                const selected = currentItems.some((i) => i.id === item.id);
                return (
                  <span key={item.id} className="inline-flex items-center">
                    <button type="button" onClick={() => toggleCustom(activeZone, item)}
                      className="rounded-l-full h-9 px-3 text-[13px] font-semibold transition-all"
                      style={selected
                        ? { backgroundColor: hex, color: "#fff" }
                        : { border: "1px solid var(--color-border)", borderRight: "none", color: "var(--color-text-secondary)" }}>
                      {item.label}
                    </button>
                    <button type="button" onClick={() => deleteCustom(activeZone, item.id)}
                      className="rounded-r-full h-9 px-2 text-[13px] transition-all"
                      style={selected
                        ? { backgroundColor: hex, color: "#fff", opacity: 0.8 }
                        : { border: "1px solid var(--color-border)", borderLeft: "none", color: "var(--color-text-muted)" }}>
                      ×
                    </button>
                  </span>
                );
              })}
            </div>

            {/* Suggestion banner */}
            {suggestion && (
              <div className="mb-3 rounded-xl border border-brand-200 bg-brand-50 p-3">
                <p className="mb-2 text-xs text-brand-700">
                  Do you mean 你是否指：<span className="font-semibold">{suggestion.bilingual}</span>?
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={acceptSuggestion}
                    className="rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white">
                    Accept 接受
                  </button>
                  <button type="button" onClick={rejectSuggestion}
                    className="rounded-xl border border-border-light px-3 py-1.5 text-xs font-semibold text-text-secondary">
                    Keep original 保留原文
                  </button>
                </div>
              </div>
            )}

            {/* Add custom input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={L.addCustomPlaceholder}
                value={customInput}
                onChange={(e) => { setCustomInput(e.target.value); setSuggestion(null); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    addCustomItem(activeZone);
                  }
                }}
                className="flex-1 rounded-xl h-11 border border-border-light bg-surface px-4 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={() => addCustomItem(activeZone)}
                disabled={!customInput.trim() && !suggestion}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-opacity disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>

            {/* Bilingual suggestion toggle */}
            <div className="mt-2 flex items-center justify-end gap-2">
              <span className="text-[10px] text-text-muted">Auto-translate 自動翻譯</span>
              <button type="button" role="switch" aria-checked={suggestEnabled} onClick={toggleSuggest}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${suggestEnabled ? "bg-[#34C759]" : "bg-gray-300"}`}>
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${suggestEnabled ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
              </button>
            </div>
          </div>
        )}

        {/* Summary tags */}
        {totalItems > 0 && !activeZone && (
          <div className="mt-3 space-y-2">
            {ZONE_ORDER.map((zone) => {
              const items = preparation[zone];
              if (!items || items.length === 0) return null;
              return (
                <div key={zone} className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-text-secondary">
                    {ZONE_LABELS[zone]}:
                  </span>
                  {items.map((item: PrepItem) => (
                    <span key={item.id} className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white" style={{ backgroundColor: hex }}>
                      {item.label}
                    </span>
                  ))}
                </div>
              );
            })}
            {preparation.stroller && preparation.stroller.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[13px] font-semibold text-text-secondary">
                  {STROLLER_LABEL}:
                </span>
                {preparation.stroller.map((item: PrepItem) => (
                  <span key={item.id} className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white" style={{ backgroundColor: hex }}>
                    {item.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
