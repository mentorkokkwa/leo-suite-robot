"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { locationName, taskName, t as translate } from "@/lib/i18n";
import type { SimulationScenario } from "@/lib/campusbot/types";
import { getTaskById } from "@/lib/campusbot/tasks";

type MissionBriefingPanelProps = {
  scenario: SimulationScenario | undefined;
  taskId: string;
  running: boolean;
};

/**
 * Pre-flight mission briefing for portfolio demos and classroom walkthroughs.
 */
export function MissionBriefingPanel({
  scenario,
  taskId,
  running,
}: MissionBriefingPanelProps) {
  const { locale, t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const task = getTaskById(taskId);
  if (!scenario || !task) return null;

  const startName = locationName(locale, task.startLocationId);
  const targetName = locationName(locale, task.targetLocationId);
  const watchKeys = scenario.watchKeys ?? [];
  const summary = translate(locale, `scenario.${scenario.id}.briefing`);

  return (
    <section
      className={`rounded-lg border ${
        running
          ? "border-cyan-800/40 bg-slate-900/40"
          : "border-cyan-700/50 bg-gradient-to-br from-slate-900/80 to-cyan-950/30"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
        aria-expanded={expanded}
      >
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          {t("simulator.missionBriefing")}
        </span>
        <span className="shrink-0 text-xs text-cyan-300/90">
          {expanded ? t("simulator.briefingCollapse") : t("simulator.briefingExpand")}
        </span>
      </button>

      {!expanded && (
        <p className="line-clamp-2 px-3 pb-2.5 text-xs leading-relaxed text-slate-300">
          {startName} → {targetName}
          {" · "}
          {summary}
        </p>
      )}

      {expanded && (
        <div className="max-h-48 overflow-y-auto border-t border-cyan-900/30 px-3 pb-3 pt-2">
      <p className="text-sm leading-relaxed text-slate-200">
        {summary}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-1">
        <div className="rounded border border-slate-700/80 bg-slate-950/50 px-3 py-2">
          <p className="text-[10px] uppercase text-slate-500">
            {t("simulator.phasePlan")}
          </p>
          <p className="mt-0.5 text-xs text-cyan-200">{t("simulator.phasePlanDesc")}</p>
        </div>
        <div className="rounded border border-slate-700/80 bg-slate-950/50 px-3 py-2">
          <p className="text-[10px] uppercase text-slate-500">
            {t("simulator.phaseNavigate")}
          </p>
          <p className="mt-0.5 text-xs text-cyan-200">
            {startName} → {targetName}
          </p>
        </div>
        <div className="rounded border border-slate-700/80 bg-slate-950/50 px-3 py-2">
          <p className="text-[10px] uppercase text-slate-500">
            {t("simulator.phaseDeliver")}
          </p>
          <p className="mt-0.5 text-xs text-cyan-200">{targetName}</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase text-amber-400/90">
          {t("simulator.watchFor")}
        </p>
        <ul className="mt-1 space-y-1">
          {watchKeys.map((key) => (
            <li
              key={key}
              className="flex items-start gap-2 text-xs text-slate-300"
            >
              <span className="mt-0.5 text-amber-400">▸</span>
              {translate(locale, `scenario.${scenario.id}.watch.${key}`)}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        <span className="font-medium text-slate-300">{taskName(locale, task.id)}</span>
        {" — "}
        {translate(locale, `task.${task.id}.description`)}
      </p>
        </div>
      )}
    </section>
  );
}
