"use client";

import { useLocale } from "@/contexts/LocaleContext";

type AStarExplainPanelProps = {
  /** Total number of cells A* explored (full search, not animated reveal count). */
  exploredCount: number;
  /** Number of cells in the planned path (including start cell). */
  pathCells: number;
  /** True while the planning animation is still running. */
  planningPhase: boolean;
  /** True when safety mode is active (restricted zones excluded). */
  safetyMode: boolean;
};

/**
 * Educational callout displayed during the A* planning phase.
 * Shows live search stats, efficiency ratio, and a plain-language algorithm explanation.
 * Useful for classroom demos and client presentations.
 */
export function AStarExplainPanel({
  exploredCount,
  pathCells,
  planningPhase,
  safetyMode,
}: AStarExplainPanelProps) {
  const { t } = useLocale();

  const pathSteps = Math.max(0, pathCells - 1);
  const efficiencyPct =
    exploredCount > 0 && pathSteps > 0
      ? ((pathSteps / exploredCount) * 100).toFixed(1)
      : null;

  return (
    <section className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">🧠</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
          {t("simulator.astarTitle")}
        </h3>
        {planningPhase && (
          <span className="ml-auto animate-pulse font-mono text-xs text-amber-300">
            {t("simulator.astarExploring")}
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded bg-slate-900/70 px-2 py-2 text-center">
          <p className="font-mono text-xl font-bold text-amber-300">
            {exploredCount}
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-slate-400">
            {t("simulator.astarExplored")}
          </p>
        </div>
        <div className="rounded bg-slate-900/70 px-2 py-2 text-center">
          <p className="font-mono text-xl font-bold text-cyan-300">
            {pathSteps > 0 ? pathSteps : "—"}
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-slate-400">
            {t("simulator.astarPath")}
          </p>
        </div>
      </div>

      {/* Efficiency ratio */}
      {efficiencyPct !== null && (
        <div className="mt-2 rounded bg-slate-900/70 px-2 py-2 text-center">
          <p className="font-mono text-xl font-bold text-lime-300">
            {efficiencyPct}%
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-slate-400">
            {t("simulator.astarEfficiency")}{" "}
            <span className="text-slate-500">
              {t("simulator.astarEfficiencyNote")}
            </span>
          </p>
        </div>
      )}

      {/* Algorithm explanation */}
      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        {t("simulator.astarExplain")}
      </p>

      {/* Safety mode note */}
      {safetyMode && (
        <p className="mt-2 rounded border border-red-800/40 bg-red-950/20 px-2 py-1.5 text-xs text-red-300">
          🚫 {t("simulator.astarSafetyActive")}
        </p>
      )}
    </section>
  );
}
