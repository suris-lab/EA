"use client";

export default function LanguageSwitcher() {
  // TODO: wire up next-intl locale switching
  return (
    <select className="rounded border border-gray-300 px-2 py-1 text-sm">
      <option value="en">English</option>
      <option value="zh-HK">中文（繁體）</option>
    </select>
  );
}
