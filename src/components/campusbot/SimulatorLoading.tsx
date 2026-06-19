"use client";

import { useLocale } from "@/contexts/LocaleContext";

/**
 * Localized simulator suspense fallback.
 */
export function SimulatorLoading() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-400">
      {t("simulator.loading")}
    </div>
  );
}
