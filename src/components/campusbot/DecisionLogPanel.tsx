"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDecisionEntry } from "@/lib/i18n";
import type { DecisionLogEntry } from "@/lib/campusbot/types";

type DecisionLogPanelProps = {
  entries: DecisionLogEntry[];
  showReportLink?: boolean;
};

/**
 * Decision log showing robot reasoning per step.
 * Designed to be placed inside the scrollable right sidebar.
 */
export function DecisionLogPanel({
  entries,
  showReportLink = false,
}: DecisionLogPanelProps) {
  const { locale, t } = useLocale();
  const listRef = useRef<HTMLUListElement>(null);
  const display = [...entries].reverse();

  const latestTimestamp = entries[entries.length - 1]?.timestamp;

  useEffect(() => {
    if (listRef.current && entries.length > 0) {
      listRef.current.scrollTop = 0;
    }
  }, [entries.length, latestTimestamp]);

  return (
    <section className="rounded-lg border border-cyan-900/40 bg-slate-900/40">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            {t("simulator.decisionLog")}
          </span>
          {entries.length > 0 && (
            <span className="rounded-full bg-cyan-900/60 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
              {entries.length}
            </span>
          )}
        </div>
        {showReportLink && (
          <a
            href="/campusbot/report"
            className="rounded bg-cyan-700 px-2 py-1 text-xs font-semibold text-white hover:bg-cyan-600"
          >
            {t("simulator.viewReport")}
          </a>
        )}
      </div>
      <div className="max-h-52 overflow-y-auto border-t border-cyan-900/30 px-3 py-2 font-mono text-xs">
        {display.length === 0 ? (
          <p className="text-slate-400">{t("simulator.noDecisions")}</p>
        ) : (
          <ul ref={listRef} className="space-y-1">
            {display.map((e, i) => {
              const { actionLabel, reason } = formatDecisionEntry(locale, e);
              const isLatest = i === 0;
              return (
                <li
                  key={`${e.timestamp}-${i}`}
                  className={`rounded px-1.5 py-1 ${
                    isLatest
                      ? "bg-cyan-950/70 text-white ring-1 ring-cyan-700/60"
                      : "text-slate-200 opacity-80"
                  }`}
                >
                  <span className="font-bold text-cyan-400">[{actionLabel}]</span>{" "}
                  <span className="text-slate-400">({e.robotPosition.x},{e.robotPosition.y})</span>{" "}
                  {reason}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
