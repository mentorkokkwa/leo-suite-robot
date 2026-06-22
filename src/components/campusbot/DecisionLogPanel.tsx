"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDecisionEntry } from "@/lib/i18n";
import type { DecisionLogEntry } from "@/lib/campusbot/types";

type DecisionLogPanelProps = {
  entries: DecisionLogEntry[];
  showReportLink?: boolean;
};

/**
 * Bottom decision log showing robot reasoning per step.
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

  const [expanded, setExpanded] = useState(false);
  const panelHeight = expanded ? "h-48" : "h-28";

  return (
    <div className={`flex ${panelHeight} shrink-0 flex-col border-t border-cyan-900/40 bg-slate-950 transition-all duration-200`}>
      <div className="flex items-center justify-between px-3 py-1.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-left"
          aria-expanded={expanded}
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-cyan-500">
            {t("simulator.decisionLog")}
          </span>
          {entries.length > 0 && (
            <span className="rounded-full bg-cyan-900/60 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
              {entries.length}
            </span>
          )}
          <span className="text-[10px] text-slate-500">
            {expanded ? "▲" : "▼"}
          </span>
        </button>
        {showReportLink && (
          <a
            href="/campusbot/report"
            className="rounded bg-cyan-700 px-2 py-1 text-xs font-semibold text-white hover:bg-cyan-600"
          >
            {t("simulator.viewReport")}
          </a>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-2 font-mono text-xs">
        {display.length === 0 ? (
          <p className="text-slate-500">{t("simulator.noDecisions")}</p>
        ) : (
          <ul ref={listRef} className="space-y-1">
            {display.map((e, i) => {
              const { actionLabel, reason } = formatDecisionEntry(locale, e);
              const isLatest = i === 0;
              return (
                <li
                  key={`${e.timestamp}-${i}`}
                  className={`rounded px-1.5 py-1 text-slate-300 ${
                    isLatest
                      ? "bg-cyan-950/70 ring-1 ring-cyan-700/60"
                      : "opacity-70"
                  }`}
                >
                  <span className="font-bold text-cyan-500">[{actionLabel}]</span>{" "}
                  <span className="text-slate-500">({e.robotPosition.x},{e.robotPosition.y})</span>{" "}
                  {reason}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
