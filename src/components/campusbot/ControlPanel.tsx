"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { taskName, taskSafetyRules, t as translate } from "@/lib/i18n";
import { DEMO_SCENARIOS } from "@/lib/campusbot/scenarios";
import { ROBOT_TASKS } from "@/lib/campusbot/tasks";
import type { SimulationControls } from "@/hooks/useCampusSimulation";

type ControlPanelProps = {
  controls: SimulationControls;
  waitingForStep?: boolean;
  onChange: (patch: Partial<SimulationControls>) => void;
  onStart: () => void;
  onStartStagedDemo: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onRunExperiment: () => void;
  addObstacleMode: boolean;
  onToggleAddObstacle: () => void;
};

/**
 * Right-side task and simulation control panel.
 */
export function ControlPanel({
  controls,
  waitingForStep = false,
  onChange,
  onStart,
  onStartStagedDemo,
  onPause,
  onReset,
  onStepForward,
  onRunExperiment,
  addObstacleMode,
  onToggleAddObstacle,
}: ControlPanelProps) {
  const { locale, t } = useLocale();
  const task = ROBOT_TASKS.find((item) => item.id === controls.taskId);
  const scenario = DEMO_SCENARIOS.find((s) => s.id === controls.scenarioId);

  return (
    <div className="flex w-full flex-col gap-3">
      <h2 className="text-base font-bold uppercase tracking-wide text-cyan-400">
        {t("simulator.missionControl")}
      </h2>

      <label className="block text-sm text-slate-300">
        {t("simulator.scenario")}
        <select
          className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-base text-white"
          value={controls.scenarioId}
          disabled={controls.running}
          onChange={(e) => {
            const s = DEMO_SCENARIOS.find((x) => x.id === e.target.value);
            onChange({
              scenarioId: e.target.value,
              taskId: s?.taskId ?? controls.taskId,
            });
          }}
        >
          {DEMO_SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {translate(locale, `scenario.${s.id}.name`)}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm text-slate-300">
        {t("simulator.task")}
        <select
          className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-base text-white"
          value={controls.taskId}
          disabled={controls.running}
          onChange={(e) => onChange({ taskId: e.target.value })}
        >
          {ROBOT_TASKS.map((item) => (
            <option key={item.id} value={item.id}>
              {taskName(locale, item.id)}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm text-slate-300">
        {t("simulator.playbackMode")}
        <select
          className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-base text-white"
          value={controls.playbackMode}
          disabled={controls.running || controls.stagedDemo}
          onChange={(e) =>
            onChange({
              playbackMode: e.target.value as SimulationControls["playbackMode"],
            })
          }
        >
          <option value="step">{t("simulator.playbackStep")}</option>
          <option value="auto">{t("simulator.playbackAuto")}</option>
        </select>
      </label>

      <label className="block text-sm text-slate-300">
        {t("simulator.speed")}
        <select
          className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-base text-white"
          value={controls.speed}
          disabled={controls.running || controls.playbackMode === "step"}
          onChange={(e) =>
            onChange({
              speed: e.target.value as SimulationControls["speed"],
            })
          }
        >
          <option value="slow">{t("simulator.speedSlow")}</option>
          <option value="normal">{t("simulator.speedNormal")}</option>
          <option value="fast">{t("simulator.speedFast")}</option>
        </select>
      </label>

      <label className="block text-sm text-slate-300">
        {t("simulator.algorithm")}
        <select
          className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-base text-white"
          value={controls.algorithm}
          onChange={(e) =>
            onChange({ algorithm: e.target.value as "astar" })
          }
        >
          <option value="astar">{t("simulator.algorithmAstar")}</option>
        </select>
      </label>

      {task && (
        <div className="rounded border border-slate-700 bg-slate-800/50 p-3 text-sm text-slate-200">
          <p className="font-medium text-cyan-300">{taskName(locale, task.id)}</p>
          <p className="mt-1 text-slate-300">
            {translate(locale, `task.${task.id}.description`)}
          </p>
          <p className="mt-2 text-xs uppercase text-slate-400">
            {t("simulator.priority")}: {t(`priority.${task.priority}`)}
          </p>
          <ul className="mt-1 list-inside list-disc text-xs text-slate-400">
            {taskSafetyRules(locale, task.id).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {scenario && (
        <p className="text-sm text-amber-400/90">
          {t("simulator.challenge")}:{" "}
          {translate(locale, `scenario.${scenario.id}.challenge`)}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onStartStagedDemo}
          disabled={controls.running || controls.stagedDemo}
          className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/40 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
        >
          {t("simulator.stagedDemoStart")}
        </button>
        <p className="text-center text-xs text-violet-300/80">
          {t("simulator.stagedDemoHint")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={controls.running || controls.stagedDemo}
          className="flex-1 rounded bg-cyan-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {t("simulator.start")}
        </button>
        <button
          type="button"
          onClick={onPause}
          disabled={!controls.running}
          className="flex-1 rounded bg-slate-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-600 disabled:opacity-50"
        >
          {controls.paused ? t("simulator.resume") : t("simulator.pause")}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded border border-slate-600 px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
        >
          {t("simulator.reset")}
        </button>
        {controls.playbackMode === "step" && (
          <button
            type="button"
            onClick={onStepForward}
            disabled={!waitingForStep}
            className="w-full rounded border border-amber-600 bg-amber-950/50 px-3 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-900/40 disabled:opacity-40"
          >
            {t("simulator.nextStep")}
          </button>
        )}
      </div>

      {waitingForStep && (
        <p className="rounded border border-amber-700/40 bg-amber-950/30 px-2 py-1.5 text-xs text-amber-200">
          {t("simulator.stepModeHint")}
        </p>
      )}

      <label className="flex items-center gap-2 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={controls.dynamicObstaclesEnabled}
          onChange={(e) =>
            onChange({ dynamicObstaclesEnabled: e.target.checked })
          }
        />
        {t("simulator.dynamicObstacles")}
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={controls.safetyMode}
          onChange={(e) => onChange({ safetyMode: e.target.checked })}
        />
        {t("simulator.safetyMode")}
      </label>

      <button
        type="button"
        onClick={onToggleAddObstacle}
        className={`rounded border px-3 py-2.5 text-sm font-semibold ${
          addObstacleMode
            ? "border-amber-500 bg-amber-900/40 text-amber-300"
            : "border-slate-600 text-slate-400 hover:bg-slate-800"
        }`}
      >
        {addObstacleMode
          ? t("simulator.addObstacleActive")
          : t("simulator.addObstacle")}
      </button>

      <button
        type="button"
        onClick={onRunExperiment}
        className="rounded border border-cyan-700 bg-cyan-950/50 px-3 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-900/30"
      >
        {t("simulator.runExperiment")}
      </button>
    </div>
  );
}
