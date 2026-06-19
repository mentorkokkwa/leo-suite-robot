"use client";

import { useMemo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { t as translate } from "@/lib/i18n";
import {
  buildRobotSensorView,
  ROBOT_SENSOR_RADIUS,
} from "@/lib/campusbot/sensorView";
import { getCellVisual } from "@/lib/campusbot/mapCellVisuals";
import type { CampusMap, DynamicAgent, Point } from "@/lib/campusbot/types";

type RobotSensorPanelProps = {
  map: CampusMap;
  robotPosition: Point;
  dynamicAgents: DynamicAgent[];
  safetyMode: boolean;
  crowdedCells?: Point[];
  active: boolean;
};

const SENSOR_COLORS: Record<string, string> = {
  unknown: "#020617",
};

/**
 * Local proximity grid simulating on-board obstacle detection.
 */
export function RobotSensorPanel({
  map,
  robotPosition,
  dynamicAgents,
  safetyMode,
  crowdedCells = [],
  active,
}: RobotSensorPanelProps) {
  const { locale, t } = useLocale();
  const sensorCells = useMemo(
    () =>
      buildRobotSensorView(
        map,
        robotPosition,
        dynamicAgents,
        safetyMode,
        crowdedCells
      ),
    [map, robotPosition, dynamicAgents, safetyMode, crowdedCells]
  );

  const blockedCount = sensorCells.filter((c) => c.inRange && c.blocked).length;

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-500">
          {t("simulator.sensorTitle")}
        </h3>
        <span className="font-mono text-xs text-slate-400">
          {ROBOT_SENSOR_RADIUS * 2 + 1}×{ROBOT_SENSOR_RADIUS * 2 + 1}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">{t("simulator.sensorDesc")}</p>

      <div
        className="mx-auto mt-3 grid gap-0.5"
        style={{
          width: "fit-content",
          gridTemplateColumns: `repeat(${ROBOT_SENSOR_RADIUS * 2 + 1}, 22px)`,
        }}
      >
        {sensorCells.map((cell) => {
          const isCenter =
            cell.x === robotPosition.x && cell.y === robotPosition.y;
          const mapCell = map.cells[cell.y]?.[cell.x];
          const visual = mapCell
            ? getCellVisual(mapCell)
            : null;
          const SensorIcon = visual?.Icon;
          const bgColor = cell.inRange
            ? visual?.bgColor ?? SENSOR_COLORS.unknown
            : SENSOR_COLORS.unknown;

          return (
            <div
              key={`${cell.x}-${cell.y}`}
              className={`relative h-[22px] w-[22px] overflow-hidden rounded-sm border ${
                cell.blocked && cell.inRange
                  ? "border-red-500/70"
                  : "border-slate-800/80"
              } ${!active ? "opacity-40" : ""}`}
              style={{ backgroundColor: bgColor }}
              title={
                cell.inRange && mapCell
                  ? translate(locale, `cellType.${cell.type === "agent" ? "obstacle" : mapCell.type}`)
                  : t("simulator.sensorOutOfRange")
              }
            >
              {SensorIcon && cell.inRange && !isCenter && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <SensorIcon size={16} />
                </span>
              )}
              {isCenter && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px]">
                  🤖
                </span>
              )}
              {cell.blocked && cell.inRange && !isCenter && (
                <span className="absolute inset-0 flex items-center justify-center bg-red-950/50 text-[8px] text-red-300">
                  !
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-center text-xs text-slate-300">
        {active
          ? t("simulator.sensorActive", { count: blockedCount })
          : t("simulator.sensorIdle")}
      </p>
    </section>
  );
}
