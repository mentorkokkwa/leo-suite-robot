"use client";

import { useLocale } from "@/contexts/LocaleContext";
import type { RobotState, RobotStatus, SimulationMetrics } from "@/lib/campusbot/types";

type MetricsBarProps = {
  robot: RobotState;
  metrics: SimulationMetrics;
};

/** Color class for robot status value. */
function statusColor(status: RobotStatus): string {
  switch (status) {
    case "planning":    return "text-amber-300";
    case "moving":      return "text-cyan-300";
    case "replanning":  return "text-orange-400";
    case "blocked":     return "text-red-400";
    case "failed":      return "text-red-400";
    case "completed":   return "text-lime-400";
    default:            return "text-slate-400";
  }
}

/**
 * Top metrics strip for the robotics control dashboard.
 * Key metrics are color-coded: replanning = amber, collisions = red, success = green.
 */
export function MetricsBar({ robot, metrics }: MetricsBarProps) {
  const { t } = useLocale();

  const resultLabel = metrics.success
    ? t("metrics.success")
    : robot.status === "idle"
      ? t("metrics.dash")
      : t("metrics.running");

  const resultColor = metrics.success
    ? "text-lime-400"
    : robot.status === "blocked" || robot.status === "failed"
      ? "text-red-400"
      : "text-slate-400";

  const items = [
    {
      label: t("metrics.status"),
      value: t(`robotStatus.${robot.status}`),
      color: statusColor(robot.status),
    },
    {
      label: t("metrics.position"),
      value: `(${robot.position.x}, ${robot.position.y})`,
      color: "text-cyan-300",
    },
    {
      label: t("metrics.steps"),
      value: String(robot.completedSteps),
      color: "text-cyan-300",
    },
    {
      label: t("metrics.pathLen"),
      value: String(metrics.pathLength),
      color: "text-cyan-300",
    },
    {
      label: t("metrics.time"),
      value: String(metrics.timeSteps),
      color: "text-cyan-300",
    },
    {
      label: t("metrics.replans"),
      value: String(metrics.replanningCount),
      color: metrics.replanningCount > 0 ? "text-orange-400" : "text-slate-400",
    },
    {
      label: t("metrics.collisions"),
      value: String(metrics.collisionCount),
      color: metrics.collisionCount > 0 ? "text-red-400" : "text-slate-400",
    },
    {
      label: t("metrics.zoneViol"),
      value: String(metrics.restrictedZoneViolations),
      color: metrics.restrictedZoneViolations > 0 ? "text-red-400" : "text-slate-400",
    },
    {
      label: t("metrics.result"),
      value: resultLabel,
      color: resultColor,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 border-b border-cyan-900/40 bg-slate-900/80 px-4 py-2 sm:grid-cols-4 lg:grid-cols-9">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            {item.label}
          </div>
          <div className={`font-mono text-base font-semibold ${item.color}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
