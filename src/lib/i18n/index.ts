import { localeMessages } from "./messages";
import type { Locale, MessageParams } from "./types";

/**
 * Resolves a dot-separated message key for the given locale.
 */
export function t(
  locale: Locale,
  key: string,
  params?: MessageParams
): string {
  const parts = key.split(".");
  let value: unknown = localeMessages[locale];
  for (const part of parts) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  if (typeof value !== "string") return key;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const v = params[name];
    return v === undefined ? "" : String(v);
  });
}

/**
 * Returns localized location name by id.
 */
export function locationName(locale: Locale, locationId: string): string {
  return t(locale, `location.${locationId}`);
}

/**
 * Returns localized task name by id.
 */
export function taskName(locale: Locale, taskId: string): string {
  return t(locale, `task.${taskId}.name`);
}

/**
 * Returns localized task safety rules.
 */
export function taskSafetyRules(locale: Locale, taskId: string): string[] {
  const rules: string[] = [];
  for (let i = 0; i < 3; i++) {
    const key = `task.${taskId}.rule${i}`;
    const msg = t(locale, key);
    if (msg !== key) rules.push(msg);
  }
  return rules;
}

/**
 * Formats a decision log entry for display.
 */
export function formatDecisionEntry(
  locale: Locale,
  entry: {
    action: string;
    reasonKey: string;
    reasonParams?: MessageParams;
  }
): { actionLabel: string; reason: string } {
  const actionLabel =
    t(locale, `action.${entry.action}`) !== `action.${entry.action}`
      ? t(locale, `action.${entry.action}`)
      : entry.action;

  const params: MessageParams = { ...entry.reasonParams };
  if (params.taskId != null) {
    params.task = taskName(locale, String(params.taskId));
  }
  if (params.safetyMode === true) {
    params.safety = t(locale, "sim.safetyOn");
  } else if (params.safetyMode === false) {
    params.safety = t(locale, "sim.safetyOff");
  }

  const reason = t(locale, `sim.${entry.reasonKey}`, params);
  return { actionLabel, reason };
}

export const LOCALE_STORAGE_KEY = "campusbot-locale";

export const DEFAULT_LOCALE: Locale = "zh";
