"use client";

import type { MapRegion } from "@/lib/campusbot/mapRegions";
import type { MapViewBounds } from "@/lib/campusbot/floorPlanGeometry";
import { gridToPercent } from "@/lib/campusbot/floorPlanGeometry";
import type { Point } from "@/lib/campusbot/types";

type MapRoomLabelsProps = {
  regions: MapRegion[];
  bounds: MapViewBounds;
  start?: Point;
  goal?: Point;
  showStartGoal: boolean;
};

/**
 * Minimal room labels for the floor plan — named locations only.
 */
export function MapRoomLabels({
  regions,
  bounds,
  start,
  goal,
  showStartGoal,
}: MapRoomLabelsProps) {
  const labeledRegions = regions.filter((region) => region.isNamed);

  return (
    <div className="pointer-events-none absolute inset-0">
      {labeledRegions.map((region) => {
        const cx = (region.minX + region.maxX + 1) / 2;
        const cy = (region.minY + region.maxY + 1) / 2;
        const pos = gridToPercent(cx, cy, bounds);

        return (
          <div
            key={region.id}
            className="absolute max-w-[80%] -translate-x-1/2 -translate-y-1/2 text-center text-[11px] font-medium leading-tight text-slate-600"
            style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
          >
            {region.label}
          </div>
        );
      })}

      {showStartGoal && start && (
        <PinBadge bounds={bounds} point={start} tone="start" label="S" />
      )}
      {showStartGoal && goal && (
        <PinBadge bounds={bounds} point={goal} tone="goal" label="G" />
      )}
    </div>
  );
}

type PinBadgeProps = {
  bounds: MapViewBounds;
  point: Point;
  tone: "start" | "goal";
  label: string;
};

/**
 * Compact start / goal marker.
 */
function PinBadge({ bounds, point, tone, label }: PinBadgeProps) {
  const pos = gridToPercent(point.x + 0.5, point.y + 0.5, bounds);
  const colors =
    tone === "start"
      ? "bg-emerald-600 text-white"
      : "bg-amber-500 text-white";

  return (
    <div
      className={`absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ${colors}`}
      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
    >
      {label}
    </div>
  );
}
