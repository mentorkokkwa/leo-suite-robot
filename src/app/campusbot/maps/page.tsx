"use client";

import { CampusNav } from "@/components/campusbot/CampusNav";
import { useLocale } from "@/contexts/LocaleContext";
import { MAIN_SCHOOL_MAP, localizeMap } from "@/lib/campusbot/maps";
import { useMemo } from "react";

export default function MapsPage() {
  const { locale, t } = useLocale();
  const map = useMemo(() => localizeMap(MAIN_SCHOOL_MAP, locale), [locale]);

  const typeCounts = map.cells.flat().reduce(
    (acc, c) => {
      acc[c.type] = (acc[c.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <CampusNav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-cyan-400">{t("maps.title")}</h1>
        <p className="mt-2 text-slate-400">{t("maps.subtitle")}</p>

        <article className="mt-8 rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold">{map.name}</h2>
          <p className="mt-1 font-mono text-sm text-slate-500">
            {map.width} × {map.height} · {t("maps.id")}: {map.id}
          </p>

          <h3 className="mt-6 text-sm font-semibold text-cyan-300">
            {t("maps.locations")}
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {map.locations.map((loc) => (
              <li key={loc.id}>
                {loc.name} — ({loc.x}, {loc.y}) ·{" "}
                {t(`cellType.${loc.type}`)}
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-sm font-semibold text-cyan-300">
            {t("maps.cellDistribution")}
          </h3>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-sm text-slate-400">
            {Object.entries(typeCounts).map(([type, count]) => (
              <li key={type}>
                {t(`cellType.${type}`)}: {count}
              </li>
            ))}
          </ul>
        </article>
      </main>
    </div>
  );
}
