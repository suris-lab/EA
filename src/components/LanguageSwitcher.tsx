"use client";

import { useState } from "react";

const languages = [
  { code: "en", label: "EN" },
  { code: "zh-HK", label: "繁" },
] as const;

export default function LanguageSwitcher() {
  const [active, setActive] = useState<string>("en");

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-surface-dim p-0.5">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setActive(lang.code)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150 ${
            active === lang.code
              ? "bg-surface text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
