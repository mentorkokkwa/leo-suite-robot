"use client";

import { useLocale } from "@/contexts/LocaleContext";

/**
 * Compact legend for the SVG floor-plan map view.
 */
export function FloorPlanLegend() {
  const { t } = useLocale();

  const items = [
    { color: "#e8e4dc", label: t("simulator.legendCorridorFloor") },
    { color: "#d4e8ff", label: t("cellType.classroom") },
    { color: "#d0f0dc", label: t("cellType.library") },
    { color: "#b8b2a6", label: t("cellType.wall") },
    { color: "#0891b2", label: t("simulator.legendRouteLine") },
    { color: "#f87171", label: t("simulator.legendOldPath") },
    { emoji: "🤖", label: t("simulator.legendRobot") },
    { emoji: "🧑‍🎓", label: t("simulator.legendAgent") },
  ];

  return (
    <section className="rounded-md border border-stone-400/50 bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
          {t("simulator.floorPlanLegend")}
        </span>
        {items.map((item) => (
          <span
            key={item.label}
            className="flex items-center gap-1 text-xs text-slate-700"
          >
            {item.color ? (
              <span
                className="inline-block h-2.5 w-4 rounded-sm border border-stone-400/50"
                style={{ backgroundColor: item.color }}
              />
            ) : (
              <span className="text-sm leading-none">{item.emoji}</span>
            )}
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}
