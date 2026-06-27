import type { Locale } from "./types";

/**
 * Reads locale from the current page URL query string.
 */
export function readLocaleFromUrl(): Locale | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("locale");
  if (value === "en" || value === "zh") return value;
  return null;
}
