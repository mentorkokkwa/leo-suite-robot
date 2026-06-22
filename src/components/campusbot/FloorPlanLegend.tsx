"use client";

import { useLocale } from "@/contexts/LocaleContext";

/**
 * Compact legend for the floor-plan map.
 */
export function FloorPlanLegend() {
  const { t } = useLocale();

  const items = [
    { color: "#166534", label: t("simulator.legendStart"), dot: true },
    { color: "#b45309", label: t("simulator.legendDest"), dot: true },
    { color: "#2563eb", label: t("simulator.markerRobot"), dot: true },
    { color: "#f97316", label: t("simulator.legendAgent"), dot: true },
    { color: "#2563eb", label: t("simulator.legendRouteLine"), line: true },
    { color: "#ef4444", label: t("simulator.legendOldPath"), dash: true },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {item.line ? (
            <span className="inline-block h-0.5 w-5 rounded bg-blue-600" />
          ) : item.dash ? (
            <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-red-400" />
          ) : (
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
          )}
          {item.label}
        </span>
      ))}
    </div>
  );
}
