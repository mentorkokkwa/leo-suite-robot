import type { SimulationReport } from "./types";

const STORAGE_KEY = "campusbot-last-report";

/**
 * Persists the latest simulation report to sessionStorage.
 */
export function saveReport(report: SimulationReport): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(report));
}

/**
 * Loads the latest simulation report from sessionStorage.
 */
export function loadReport(): SimulationReport | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SimulationReport;
    if (!parsed.taskId || !parsed.decisionLog) return null;
    return parsed;
  } catch {
    return null;
  }
}
