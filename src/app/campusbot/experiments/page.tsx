"use client";

import Link from "next/link";
import { CampusNav } from "@/components/campusbot/CampusNav";
import { useLocale } from "@/contexts/LocaleContext";
import { DEMO_SCENARIOS } from "@/lib/campusbot/scenarios";
import { getTaskById } from "@/lib/campusbot/tasks";
import { MAIN_SCHOOL_MAP, localizeMap } from "@/lib/campusbot/maps";
import { useMemo } from "react";

export default function ExperimentsPage() {
  const { locale, t } = useLocale();
  const map = useMemo(() => localizeMap(MAIN_SCHOOL_MAP, locale), [locale]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <CampusNav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-cyan-400">
          {t("experiments.title")}
        </h1>
        <p className="mt-2 text-slate-400">{t("experiments.subtitle")}</p>

        <ul className="mt-8 space-y-6">
          {DEMO_SCENARIOS.map((scenario) => {
            const task = getTaskById(scenario.taskId);
            const start = task
              ? map.locations.find((l) => l.id === task.startLocationId)
              : undefined;
            const target = task
              ? map.locations.find((l) => l.id === task.targetLocationId)
              : undefined;
            return (
              <li
                key={scenario.id}
                className="rounded-lg border border-cyan-900/40 bg-slate-900/60 p-6"
              >
                <h2 className="text-lg font-semibold text-cyan-300">
                  {t(`scenario.${scenario.id}.name`)}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {t(`scenario.${scenario.id}.description`)}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase text-amber-400">
                  {t("experiments.challenge")}:{" "}
                  {t(`scenario.${scenario.id}.challenge`)}
                </p>
                {task && (
                  <p className="mt-2 font-mono text-xs text-slate-500">
                    {t("experiments.route")}: {start?.name} → {target?.name}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {t("experiments.dynamicAgents")}:{" "}
                  {scenario.dynamicAgents.length} ·{" "}
                  {t("experiments.extraObstacles")}:{" "}
                  {scenario.extraObstacles?.length ?? 0}
                </p>
                <Link
                  href={`/campusbot/simulator?scenario=${scenario.id}`}
                  className="mt-4 inline-block rounded border border-cyan-700 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-950"
                >
                  {t("experiments.openInSimulator")}
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
