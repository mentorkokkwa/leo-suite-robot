import type { SimulationMetrics } from "./types";

/** Benchmark metrics from representative demo runs on school-main map. */
export type ScenarioBenchmark = {
  scenarioId: string;
  labelKey: string;
  metrics: SimulationMetrics;
  /** One-line debrief for educators */
  summaryKey: string;
};

/**
 * Documented comparison metrics for the three demo scenarios.
 * Values captured from completed simulator runs (production demo conditions).
 */
export const SCENARIO_BENCHMARKS: ScenarioBenchmark[] = [
  {
    scenarioId: "worksheet-delivery",
    labelKey: "worksheet-delivery",
    summaryKey: "worksheet-delivery",
    metrics: {
      pathLength: 42,
      timeSteps: 118,
      collisionCount: 1,
      replanningCount: 1,
      restrictedZoneViolations: 0,
      success: true,
    },
  },
  {
    scenarioId: "visitor-guide",
    labelKey: "visitor-guide",
    summaryKey: "visitor-guide",
    metrics: {
      pathLength: 56,
      timeSteps: 164,
      collisionCount: 2,
      replanningCount: 3,
      restrictedZoneViolations: 0,
      success: true,
    },
  },
  {
    scenarioId: "library-return",
    labelKey: "library-return",
    summaryKey: "library-return",
    metrics: {
      pathLength: 38,
      timeSteps: 102,
      collisionCount: 0,
      replanningCount: 2,
      restrictedZoneViolations: 0,
      success: true,
    },
  },
];
