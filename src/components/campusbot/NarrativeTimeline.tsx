"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { taskName, t as translate } from "@/lib/i18n";
import type { SimulationNarrativeEvent } from "@/lib/campusbot/types";

type NarrativeTimelineProps = {
  events: SimulationNarrativeEvent[];
};

const TONE_STYLES: Record<
  SimulationNarrativeEvent["tone"],
  string
> = {
  info: "border-cyan-700/50 bg-cyan-950/30 text-cyan-100",
  warning: "border-amber-600/50 bg-amber-950/30 text-amber-100",
  success: "border-lime-600/50 bg-lime-950/30 text-lime-100",
  danger: "border-red-600/50 bg-red-950/30 text-red-100",
};

/**
 * Plain-language timeline of key robot decisions for live demos.
 */
export function NarrativeTimeline({ events }: NarrativeTimelineProps) {
  const { locale, t } = useLocale();
  const display = [...events].reverse();

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500">
        {t("simulator.narrativeTitle")}
      </h3>
      <p className="mt-1 text-xs text-slate-400">{t("simulator.narrativeDesc")}</p>

      <ul className="mt-2 max-h-36 space-y-2 overflow-y-auto">
        {display.length === 0 ? (
          <li className="text-sm text-slate-400">{t("simulator.narrativeEmpty")}</li>
        ) : (
          display.map((event, index) => {
            const params: Record<string, string | number | boolean> = {
              ...event.params,
            };
            if (params.taskId != null) {
              params.task = taskName(locale, String(params.taskId));
            }
            if (params.safetyMode === true) {
              params.safety = translate(locale, "sim.safetyOn");
            } else if (params.safetyMode === false) {
              params.safety = translate(locale, "sim.safetyOff");
            }
            return (
              <li
                key={event.id}
                className={`rounded border px-2 py-1.5 text-sm ${
                  TONE_STYLES[event.tone]
                } ${index === 0 ? "ring-1 ring-cyan-600/40" : ""}`}
              >
                <p className="font-semibold">
                  {translate(locale, event.titleKey, params)}
                </p>
                <p className="mt-0.5 text-xs opacity-90">
                  {translate(locale, event.detailKey, params)}
                </p>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
