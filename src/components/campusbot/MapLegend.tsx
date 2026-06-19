"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { t as translate } from "@/lib/i18n";
import {
  getLegendVisual,
  MAP_LEGEND_ITEMS,
} from "@/lib/campusbot/mapCellVisuals";

/**
 * Visual legend explaining each map tile icon.
 */
export function MapLegend() {
  const { locale, t } = useLocale();

  return (
    <section className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
        {t("simulator.mapLegendTitle")}
      </h3>
      <p className="mt-1 text-[10px] text-slate-500">{t("simulator.mapLegendDesc")}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        <div className="flex items-center gap-2 rounded border border-slate-800 bg-slate-950/50 px-2 py-1.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
            style={{
              backgroundColor: "#3d4f63",
              backgroundImage:
                "radial-gradient(circle, #64748b 1px, transparent 1px)",
              backgroundSize: "6px 6px",
            }}
          />
          <span className="text-[10px] leading-tight text-slate-300">
            {translate(locale, "cellType.corridor")}
          </span>
        </div>
        {MAP_LEGEND_ITEMS.filter((item) => item.type !== "corridor").map((item) => {
          const visual = getLegendVisual(item.type);
          const Icon = visual.Icon;
          return (
            <div
              key={item.type}
              className="flex items-center gap-2 rounded border border-slate-800 bg-slate-950/50 px-2 py-1.5"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: visual.bgColor }}
              >
                <Icon size={22} />
              </div>
              <span className="text-[10px] leading-tight text-slate-300">
                {translate(locale, item.labelKey)}
              </span>
            </div>
          );
        })}
        <div className="flex items-center gap-2 rounded border border-slate-800 bg-slate-950/50 px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-800 text-lg">
            🤖
          </div>
          <span className="text-[10px] leading-tight text-slate-300">
            {t("simulator.legendRobot")}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded border border-slate-800 bg-slate-950/50 px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-orange-900/60 text-lg">
            🧑‍🎓
          </div>
          <span className="text-[10px] leading-tight text-slate-300">
            {t("simulator.legendAgent")}
          </span>
        </div>
      </div>
    </section>
  );
}
