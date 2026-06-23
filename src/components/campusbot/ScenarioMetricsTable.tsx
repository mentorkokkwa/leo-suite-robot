"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { SCENARIO_BENCHMARKS } from "@/lib/campusbot/scenario-benchmarks";

/**
 * Side-by-side metrics table for the three demo scenarios (portfolio evidence).
 */
export function ScenarioMetricsTable() {
  const { t } = useLocale();

  const columns = [
    { key: "pathLength", label: t("metrics.pathLen") },
    { key: "timeSteps", label: t("metrics.time") },
    { key: "collisionCount", label: t("metrics.collisions") },
    { key: "replanningCount", label: t("metrics.replans") },
    { key: "success", label: t("metrics.result") },
  ] as const;

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
      <h2 className="text-lg font-bold text-white">{t("home.metricsCompare.title")}</h2>
      <p className="mt-1 text-sm text-slate-400">{t("home.metricsCompare.subtitle")}</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-4">{t("home.metricsCompare.scenarioCol")}</th>
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCENARIO_BENCHMARKS.map((row) => (
              <tr key={row.scenarioId} className="border-b border-slate-800/80">
                <td className="py-3 pr-4">
                  <p className="font-medium text-cyan-300">
                    {t(`scenario.${row.scenarioId}.name`).replace(/^场景 \d+：|^Scenario \d+: /, "")}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t(`home.benchmarkSummary.${row.summaryKey}`)}
                  </p>
                </td>
                {columns.map((col) => {
                  const val = row.metrics[col.key as keyof typeof row.metrics];
                  const display =
                    col.key === "success"
                      ? val
                        ? t("metrics.success")
                        : t("metrics.failed")
                      : String(val);
                  return (
                    <td
                      key={col.key}
                      className={`px-3 py-3 tabular-nums ${
                        col.key === "success"
                          ? val
                            ? "font-semibold text-emerald-400"
                            : "text-rose-400"
                          : "text-slate-300"
                      }`}
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">{t("home.metricsCompare.footnote")}</p>
    </section>
  );
}
