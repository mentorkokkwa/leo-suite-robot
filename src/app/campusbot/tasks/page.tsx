"use client";

import Link from "next/link";
import { CampusNav } from "@/components/campusbot/CampusNav";
import { useLocale } from "@/contexts/LocaleContext";
import { taskName, taskSafetyRules } from "@/lib/i18n";
import { ROBOT_TASKS } from "@/lib/campusbot/tasks";
import { MAIN_SCHOOL_MAP, localizeMap } from "@/lib/campusbot/maps";
import { useMemo } from "react";

export default function TasksPage() {
  const { locale, t } = useLocale();
  const map = useMemo(() => localizeMap(MAIN_SCHOOL_MAP, locale), [locale]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <CampusNav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-cyan-400">{t("tasks.title")}</h1>
        <p className="mt-2 text-slate-400">{t("tasks.subtitle")}</p>

        <ul className="mt-8 space-y-4">
          {ROBOT_TASKS.map((task) => {
            const start = map.locations.find(
              (l) => l.id === task.startLocationId
            );
            const target = map.locations.find(
              (l) => l.id === task.targetLocationId
            );
            return (
              <li
                key={task.id}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-semibold text-white">
                    {taskName(locale, task.id)}
                  </h2>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      task.priority === "high"
                        ? "bg-red-900/50 text-red-300"
                        : task.priority === "medium"
                          ? "bg-amber-900/50 text-amber-300"
                          : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {t(`priority.${task.priority}`)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {t(`task.${task.id}.description`)}
                </p>
                <p className="mt-3 font-mono text-xs text-cyan-600">
                  {t("tasks.route")}: {start?.name} → {target?.name}
                </p>
                <p className="mt-2 text-[10px] uppercase text-slate-500">
                  {t("tasks.safetyRules")}
                </p>
                <ul className="mt-1 list-inside list-disc text-xs text-slate-500">
                  {taskSafetyRules(locale, task.id).map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>

        <Link
          href="/campusbot/simulator"
          className="mt-8 inline-block rounded bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
        >
          {t("tasks.runInSimulator")}
        </Link>
      </main>
    </div>
  );
}
