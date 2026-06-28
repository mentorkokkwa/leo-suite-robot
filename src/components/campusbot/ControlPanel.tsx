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
  const isRunning = controls.running;

  return (
    <div className="flex w-full flex-col gap-2">
      <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
        {t("simulator.missionControl")}
      </h2>

      {/* ── Configuration dropdowns (hidden while running) ── */}
      {!isRunning && (
        <>
          <label className="block text-xs text-slate-400">
            {t("simulator.scenario")}
            <select
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-white"
              value={controls.scenarioId}
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

          <label className="block text-xs text-slate-400">
            {t("simulator.task")}
            <select
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-white"
              value={controls.taskId}
              onChange={(e) => onChange({ taskId: e.target.value })}
            >
              {ROBOT_TASKS.map((item) => (
                <option key={item.id} value={item.id}>
                  {taskName(locale, item.id)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-slate-400">
            {t("simulator.playbackMode")}
            <select
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-white"
              value={controls.playbackMode}
              disabled={controls.stagedDemo}
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

          <label className="block text-xs text-slate-400">
            {t("simulator.speed")}
            <select
              className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-white"
              value={controls.speed}
              disabled={controls.playbackMode === "step"}
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

          {task && (
            <div className="rounded border border-slate-700 bg-slate-800/50 p-2 text-xs text-slate-300">
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
            <p className="text-xs text-amber-400/90">
              {t("simulator.challenge")}:{" "}
              {translate(locale, `scenario.${scenario.id}.challenge`)}
            </p>
          )}
        </>
      )}

      {/* ── Running compact task summary ── */}
      {isRunning && task && scenario && (
        <div className="rounded border border-cyan-800/50 bg-cyan-950/30 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">
            {t("simulator.runningTask")}
          </p>
          <p className="mt-1 font-semibold text-cyan-200">
            {taskName(locale, task.id)}
          </p>
          <p className="mt-0.5 text-xs text-amber-400">
            ⚡ {translate(locale, `scenario.${scenario.id}.challenge`)}
          </p>
        </div>
      )}

      {/* ── Launch buttons (shown only when not running) ── */}
      {!isRunning && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onStartStagedDemo}
            disabled={controls.stagedDemo}
            className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-violet-900/40 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
          >
            {t("simulator.stagedDemoStart")}
          </button>
          <p className="text-center text-xs text-violet-300/80">
            {t("simulator.stagedDemoHint")}
          </p>
        </div>
      )}

      {/* ── Playback controls (always visible) ── */}
      <div className="flex flex-wrap gap-2">
        {!isRunning && (
          <button
            type="button"
            onClick={onStart}
            className="flex-1 rounded bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
          >
            {t("simulator.start")}
          </button>
        )}
        {isRunning && (
          <button
            type="button"
            onClick={onPause}
            className="flex-1 rounded bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-600"
          >
            {controls.paused ? t("simulator.resume") : t("simulator.pause")}
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="flex-1 rounded border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
        >
          {t("simulator.reset")}
        </button>
      </div>

      {controls.playbackMode === "step" && isRunning && (
        <button
          type="button"
          onClick={onStepForward}
          disabled={!waitingForStep}
          className="w-full rounded border border-amber-600 bg-amber-950/50 px-3 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-900/40 disabled:opacity-40"
        >
          {t("simulator.nextStep")}
        </button>
      )}

      {waitingForStep && (
        <p className="rounded border border-amber-700/40 bg-amber-950/30 px-2 py-1.5 text-xs text-amber-200">
          {t("simulator.stepModeHint")}
        </p>
      )}

      {/* ── Toggle options ── */}
      <label className="flex items-center gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          checked={controls.dynamicObstaclesEnabled}
          disabled={isRunning}
          onChange={(e) =>
            onChange({ dynamicObstaclesEnabled: e.target.checked })
          }
        />
        {t("simulator.dynamicObstacles")}
      </label>

      <label className="flex items-center gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          checked={controls.safetyMode}
          disabled={isRunning}
          onChange={(e) => onChange({ safetyMode: e.target.checked })}
        />
        {t("simulator.safetyMode")}
      </label>

      {/* ── Interactive experiment section ── */}
      <div className="rounded-lg border border-amber-600/50 bg-amber-950/20 p-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
          🎮 {t("simulator.experimentTitle")}
        </p>
        {!isRunning && (
          <ol className="mt-1.5 space-y-0.5 pl-1 text-[10px] leading-relaxed text-amber-200/80">
            <li>1. {t("simulator.experimentStep1")}</li>
            <li>2. {t("simulator.experimentStep2")}</li>
            <li>3. {t("simulator.experimentStep3")}</li>
          </ol>
        )}
        {isRunning && (
          <p className="mt-1 text-[10px] leading-relaxed text-amber-200/80">
            {t("simulator.experimentRunningHint")}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onToggleAddObstacle}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-bold transition-all ${
          addObstacleMode
            ? "animate-pulse border-amber-400 bg-amber-900/50 text-amber-200 shadow-lg shadow-amber-900/40"
            : "border-amber-700/60 bg-amber-950/30 text-amber-300 hover:border-amber-500 hover:bg-amber-900/30"
        }`}
      >
        🧱{" "}
        {addObstacleMode
          ? t("simulator.addObstacleActive")
          : t("simulator.addObstacle")}
        {controls.userObstacles.length > 0 && (
          <span className="ml-auto rounded-full bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {controls.userObstacles.length}
          </span>
        )}
      </button>

      {addObstacleMode && (
        <p className="rounded border border-amber-700/40 bg-amber-950/30 px-2 py-1.5 text-center text-xs font-semibold text-amber-100">
          👆 {t("simulator.addObstacleActive")}
        </p>
      )}

      {!isRunning && (
        <button
          type="button"
          onClick={onRunExperiment}
          className="w-full rounded-lg border-2 border-cyan-600 bg-cyan-950/50 px-3 py-2.5 text-sm font-bold text-cyan-200 hover:bg-cyan-900/30 hover:border-cyan-400"
        >
          ▶ {t("simulator.runExperiment")}
        </button>
      )}
    </div>
  );
}
