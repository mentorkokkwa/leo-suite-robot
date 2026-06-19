"use client";

import { useLocale } from "@/contexts/LocaleContext";
import type { Locale } from "@/lib/i18n/types";

/**
 * Toggle between English and Chinese UI.
 */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  const options: { value: Locale; labelKey: string }[] = [
    { value: "zh", labelKey: "language.zh" },
    { value: "en", labelKey: "language.en" },
  ];

  return (
    <div className="ml-auto flex items-center gap-2">
      <span className="text-[10px] uppercase text-slate-500">
        {t("language.label")}
      </span>
      <select
        aria-label={t("language.label")}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
