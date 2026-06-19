"use client";

import { useLocale } from "@/contexts/LocaleContext";
import type { RobotState, SimulationMetrics } from "@/lib/campusbot/types";

type MetricsBarProps = {
  robot: RobotState;
  metrics: SimulationMetrics;
};

/**
 * Top metrics strip for the robotics control dashboard.
 */
export function MetricsBar({ robot, metrics }: MetricsBarProps) {
  const { t } = useLocale();

  const resultLabel = metrics.success
    ? t("metrics.success")
    : robot.status === "idle"
      ? t("metrics.dash")
      : t("metrics.running");

  const items = [
    {
      label: t("metrics.status"),
      value: t(`robotStatus.${robot.status}`),
    },
    {
      label: t("metrics.position"),
      value: `(${robot.position.x}, ${robot.position.y})`,
    },
    { label: t("metrics.steps"), value: String(robot.completedSteps) },
    { label: t("metrics.pathLen"), value: String(metrics.pathLength) },
    { label: t("metrics.time"), value: String(metrics.timeSteps) },
    { label: t("metrics.replans"), value: String(metrics.replanningCount) },
    { label: t("metrics.collisions"), value: String(metrics.collisionCount) },
    {
      label: t("metrics.zoneViol"),
      value: String(metrics.restrictedZoneViolations),
    },
    { label: t("metrics.result"), value: resultLabel },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 border-b border-cyan-900/40 bg-slate-900/80 px-4 py-2 sm:grid-cols-4 lg:grid-cols-9">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            {item.label}
          </div>
          <div className="font-mono text-base font-semibold text-cyan-300">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
