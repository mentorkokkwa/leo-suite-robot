import type { Locale } from "@/lib/i18n/types";
import { formatDecisionEntry, locationName, t, taskName } from "@/lib/i18n";
import type { SimulationReport } from "./types";
import { calculateMetrics, type SimulationContext } from "./simulation";

/**
 * Builds a locale-aware simulation report from context.
 */
export function buildSimulationReport(
  ctx: SimulationContext,
  locale: Locale
): SimulationReport {
  return {
    locale,
    taskId: ctx.task.id,
    startLocationId: ctx.task.startLocationId,
    targetLocationId: ctx.task.targetLocationId,
    algorithmKey: "algorithm.astar",
    success: calculateMetrics(ctx).success,
    metrics: calculateMetrics(ctx),
    decisionLog: ctx.decisionLog,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Resolves localized report sections for the report page.
 */
export function getLocalizedReportSections(
  report: SimulationReport,
  locale: Locale
) {
  const metrics = report.metrics;
  const whatWorked: string[] = [];
  const whatFailed: string[] = [];

  if (metrics.success) {
    whatWorked.push(t(locale, "reportAnalysis.astarSuccess"));
    if (metrics.replanningCount > 0) {
      whatWorked.push(
        t(locale, "reportAnalysis.replanSuccess", {
          count: metrics.replanningCount,
        })
      );
    }
    if (metrics.restrictedZoneViolations === 0) {
      whatWorked.push(t(locale, "reportAnalysis.safetyClear"));
    }
  } else {
    whatFailed.push(t(locale, "reportAnalysis.notReached"));
    if (report.decisionLog.some((e) => e.action === "BLOCKED")) {
      whatFailed.push(t(locale, "reportAnalysis.pathBlocked"));
    }
    if (metrics.collisionCount > 0) {
      whatFailed.push(
        t(locale, "reportAnalysis.collisions", {
          count: metrics.collisionCount,
        })
      );
    }
  }

  const majorActions = new Set([
    "PATH_PLANNED",
    "REPLAN",
    "BLOCKED",
    "TASK_COMPLETE",
    "NO_PATH",
  ]);
  const decisionSummary = report.decisionLog
    .filter((e) => majorActions.has(e.action))
    .slice(-8)
    .map((e) => {
      const { actionLabel, reason } = formatDecisionEntry(locale, e);
      return `${actionLabel}: ${reason}`;
    });

  return {
    taskName: taskName(locale, report.taskId),
    start: locationName(locale, report.startLocationId),
    destination: locationName(locale, report.targetLocationId),
    algorithm: t(locale, report.algorithmKey),
    decisionSummary,
    whatWorked,
    whatFailed,
    futureImprovements: [
      t(locale, "reportAnalysis.future0"),
      t(locale, "reportAnalysis.future1"),
      t(locale, "reportAnalysis.future2"),
      t(locale, "reportAnalysis.future3"),
      t(locale, "reportAnalysis.future4"),
    ],
  };
}
