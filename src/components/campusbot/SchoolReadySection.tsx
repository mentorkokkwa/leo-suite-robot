"use client";

import { useLocale } from "@/contexts/LocaleContext";

/**
 * Four-pillar school-readiness block for educators and DSA reviewers.
 */
export function SchoolReadySection() {
  const { t } = useLocale();
  const rows = ["problem", "workflow", "safety", "pilot"] as const;

  return (
    <section className="border-y border-slate-800 bg-slate-900/50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          {t("home.schoolReady.badge")}
        </p>
        <h2 className="mt-1 text-xl font-bold text-white">{t("home.schoolReady.title")}</h2>
        <p className="mt-2 text-sm text-slate-400">{t("home.schoolReady.subtitle")}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {rows.map((key) => (
            <div
              key={key}
              className="rounded-xl border border-slate-700/60 bg-slate-900 p-5"
            >
              <h3 className="text-sm font-semibold text-cyan-300">
                {t(`home.schoolReady.rows.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {t(`home.schoolReady.rows.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
