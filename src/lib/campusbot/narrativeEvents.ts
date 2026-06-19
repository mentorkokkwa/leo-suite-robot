import type { DecisionLogEntry, SimulationNarrativeEvent } from "./types";

/**
 * Maps raw decision log actions to audience-friendly narrative milestones.
 */
export function narrativeFromDecision(
  entry: DecisionLogEntry,
  index: number
): SimulationNarrativeEvent | null {
  const id = `${entry.timestamp}-${index}`;

  switch (entry.action) {
    case "PATH_PLANNED":
      return {
        id,
        titleKey: "narrative.pathPlannedTitle",
        detailKey: "narrative.pathPlannedDetail",
        params: entry.reasonParams,
        timestamp: entry.timestamp,
        tone: "info",
      };
    case "REPLAN":
      return {
        id,
        titleKey: "narrative.replanTitle",
        detailKey: "narrative.replanDetail",
        params: entry.reasonParams,
        timestamp: entry.timestamp,
        tone: "warning",
      };
    case "COLLISION_AVOIDED":
      return {
        id,
        titleKey: "narrative.waitTitle",
        detailKey: "narrative.waitDetail",
        params: entry.reasonParams,
        timestamp: entry.timestamp,
        tone: "warning",
      };
    case "SAFETY_WARNING":
      return {
        id,
        titleKey: "narrative.restrictedTitle",
        detailKey: "narrative.restrictedDetail",
        timestamp: entry.timestamp,
        tone: "warning",
      };
    case "BLOCKED":
      return {
        id,
        titleKey: "narrative.blockedTitle",
        detailKey: "narrative.blockedDetail",
        timestamp: entry.timestamp,
        tone: "danger",
      };
    case "TASK_COMPLETE":
      return {
        id,
        titleKey: "narrative.completeTitle",
        detailKey: "narrative.completeDetail",
        params: entry.reasonParams,
        timestamp: entry.timestamp,
        tone: "success",
      };
    case "NO_PATH":
    case "PLAN_FAILED":
      return {
        id,
        titleKey: "narrative.failedTitle",
        detailKey: "narrative.failedDetail",
        timestamp: entry.timestamp,
        tone: "danger",
      };
    default:
      return null;
  }
}

/**
 * Converts decision log entries into narrative timeline items.
 */
export function buildNarrativeTimeline(
  log: DecisionLogEntry[]
): SimulationNarrativeEvent[] {
  return log
    .map((entry, index) => narrativeFromDecision(entry, index))
    .filter((event): event is SimulationNarrativeEvent => event !== null);
}
