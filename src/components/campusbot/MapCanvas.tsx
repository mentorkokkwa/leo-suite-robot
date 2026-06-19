"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { locationName, formatDecisionEntry, t as translate } from "@/lib/i18n";
import {
  getCellFillColor,
  shouldShowCellIcon,
  computeMapRegions,
} from "@/lib/campusbot/mapRegions";
import { getCellVisual } from "@/lib/campusbot/mapCellVisuals";
import type { MapLayerVisibility } from "@/lib/campusbot/presentationActs";
import type {
  CampusMap,
  DecisionLogEntry,
  DynamicAgent,
  Point,
  RobotState,
} from "@/lib/campusbot/types";
import { getLocationById } from "@/lib/campusbot/maps";
import { getTaskById } from "@/lib/campusbot/tasks";
import { MapLegend } from "./MapLegend";
import { PresentationActBanner } from "./PresentationActBanner";
import type { PresentationAct } from "@/lib/campusbot/presentationActs";
import { getMapLayerVisibility } from "@/lib/campusbot/presentationActs";

type MapCanvasProps = {
  map: CampusMap;
  robot: RobotState;
  taskId: string;
  dynamicAgents: DynamicAgent[];
  robotTrail?: Point[];
  exploredCells?: Point[];
  replacedPath?: Point[];
  planningPhase?: boolean;
  running?: boolean;
  lastLogEntry?: DecisionLogEntry;
  addObstacleMode: boolean;
  presentationAct?: PresentationAct;
  onCellClick: (point: Point) => void;
};

const AGENT_EMOJI: Record<string, string> = {
  student: "🧑‍🎓",
  crowd: "👥",
  teacher: "👩‍🏫",
  patron: "📖",
};

/**
 * Builds the status banner text shown above the map during simulation.
 */
function getStatusBannerText(
  locale: Parameters<typeof translate>[0],
  robot: RobotState,
  planningPhase: boolean,
  running: boolean,
  destName: string,
  totalSteps: number
): string {
  if (!running && robot.status === "idle") {
    return translate(locale, "simulator.statusIdleHint");
  }
  if (planningPhase || robot.status === "planning") {
    return translate(locale, "simulator.statusPlanning");
  }
  if (robot.status === "replanning") {
    return translate(locale, "simulator.statusReplanning");
  }
  if (robot.status === "completed") {
    return translate(locale, "simulator.statusCompleted");
  }
  if (robot.status === "blocked") {
    return translate(locale, "simulator.statusBlocked");
  }
  if (robot.status === "failed") {
    return translate(locale, "simulator.statusFailed");
  }
  if (robot.status === "moving") {
    return translate(locale, "simulator.statusMoving", {
      dest: destName,
      step: robot.completedSteps,
      total: totalSteps,
    });
  }
  return "";
}

/**
 * 2D grid canvas with pictorial tiles for school map visualization.
 */
export function MapCanvas({
  map,
  robot,
  taskId,
  dynamicAgents,
  robotTrail = [],
  exploredCells = [],
  replacedPath = [],
  planningPhase = false,
  running = false,
  lastLogEntry,
  addObstacleMode,
  presentationAct = "off",
  onCellClick,
}: MapCanvasProps) {
  const { locale, t } = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const robotCellRef = useRef<HTMLButtonElement | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const task = getTaskById(taskId);
  const start = task ? getLocationById(map, task.startLocationId) : undefined;
  const goal = task ? getLocationById(map, task.targetLocationId) : undefined;
  const cellSize = Math.min(44, Math.max(36, Math.floor(940 / map.width)));
  const gap = 2;
  const iconSize = Math.max(18, cellSize - 8);
  const regions = useMemo(
    () => computeMapRegions(map, locale),
    [map, locale]
  );
  const layers: MapLayerVisibility = getMapLayerVisibility(presentationAct, {
    running,
    planningPhase,
  });
  const totalSteps = Math.max(
    robot.completedSteps,
    metricsPathLength(robot.currentPath)
  );
  const destName = goal ? locationName(locale, goal.id) : "—";
  const nextStep = robot.currentPath[1];
  const trailKeys = new Set(robotTrail.map((p) => `${p.x},${p.y}`));
  const exploredKeys = new Set(exploredCells.map((p) => `${p.x},${p.y}`));
  const replacedKeys = new Set(replacedPath.map((p) => `${p.x},${p.y}`));
  const gridWidth = map.width * cellSize + (map.width - 1) * gap;
  const gridHeight = map.height * cellSize + (map.height - 1) * gap;

  const statusText = getStatusBannerText(
    locale,
    robot,
    planningPhase,
    running,
    destName,
    totalSteps
  );

  const bannerTone =
    robot.status === "completed"
      ? "border-lime-500/60 bg-lime-950/50 text-lime-200"
      : robot.status === "failed" || robot.status === "blocked"
        ? "border-red-500/60 bg-red-950/50 text-red-200"
        : planningPhase || robot.status === "planning"
          ? "border-amber-500/60 bg-amber-950/50 text-amber-200"
          : robot.status === "replanning"
            ? "border-orange-500/60 bg-orange-950/50 text-orange-200"
            : running
              ? "border-cyan-500/60 bg-cyan-950/50 text-cyan-100"
              : "border-slate-700 bg-slate-900/80 text-slate-400";

  useEffect(() => {
    if (!running || planningPhase) return;
    robotCellRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }, [robot.position.x, robot.position.y, running, planningPhase]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4">
      {presentationAct !== "off" && (
        <PresentationActBanner act={presentationAct} />
      )}

      <div
        className={`mb-3 shrink-0 rounded-lg border px-4 py-3 text-sm font-medium ${bannerTone}`}
        role="status"
        aria-live="polite"
      >
        {statusText}
        {planningPhase && layers.explored && (
          <span className="mt-1 block text-xs font-normal opacity-80">
            {t("simulator.planningExplored", {
              count: exploredCells.length,
            })}
          </span>
        )}
        {replacedPath.length > 0 && !planningPhase && layers.oldPath && (
          <span className="mt-1 block text-xs font-normal text-orange-200/90">
            {t("simulator.replanHint")}
          </span>
        )}
        {lastLogEntry && running && robot.status === "moving" && (
          <span className="mt-1 block text-xs font-normal opacity-80">
            {formatDecisionEntry(locale, lastLogEntry).reason}
          </span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div
          ref={gridRef}
          className="relative inline-block rounded-xl border-2 border-slate-600 bg-[#0a0f1a] p-2 shadow-2xl shadow-black/50"
        >
          <div
            className="relative z-10"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${map.width}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${map.height}, ${cellSize}px)`,
              gap: `${gap}px`,
              width: gridWidth,
              height: gridHeight,
            }}
          >
            {map.cells.flatMap((row) =>
              row.map((cell) => {
                const visual = getCellVisual(cell);
                const CellIcon = visual.Icon;
                const fillColor = getCellFillColor(cell);
                const showIcon = shouldShowCellIcon(cell);
                const isWall = cell.type === "wall";
                const isRobot =
                  layers.robot &&
                  robot.position.x === cell.x &&
                  robot.position.y === cell.y;
                const isStart =
                  layers.startGoal &&
                  start &&
                  start.x === cell.x &&
                  start.y === cell.y;
                const isGoal =
                  layers.startGoal &&
                  goal &&
                  goal.x === cell.x &&
                  goal.y === cell.y;
                const onPath =
                  layers.path &&
                  robot.currentPath.some(
                    (p) => p.x === cell.x && p.y === cell.y
                  );
                const pathIndex = robot.currentPath.findIndex(
                  (p) => p.x === cell.x && p.y === cell.y
                );
                const onTrail =
                  layers.trail &&
                  trailKeys.has(`${cell.x},${cell.y}`) &&
                  !isRobot;
                const isExplored =
                  layers.explored &&
                  exploredKeys.has(`${cell.x},${cell.y}`);
                const onOldPath =
                  layers.oldPath &&
                  replacedKeys.has(`${cell.x},${cell.y}`) &&
                  !onPath;
                const isNextStep =
                  layers.nextStep &&
                  nextStep &&
                  nextStep.x === cell.x &&
                  nextStep.y === cell.y &&
                  !planningPhase;
                const agent =
                  layers.agents &&
                  dynamicAgents.find(
                    (a) => a.position.x === cell.x && a.position.y === cell.y
                  );
                const cellTitle =
                  cell.label ??
                  translate(locale, `cellType.${cell.type}`);

                return (
                  <button
                    key={`${cell.x}-${cell.y}`}
                    ref={isRobot ? robotCellRef : undefined}
                    type="button"
                    title={cellTitle}
                    onClick={() => onCellClick({ x: cell.x, y: cell.y })}
                    className={`relative overflow-hidden transition-all duration-200 ${
                      addObstacleMode
                        ? "cursor-crosshair hover:brightness-110"
                        : "cursor-default"
                    } ${isWall ? "z-10" : ""}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: isWall ? "#020617" : fillColor,
                      boxShadow: isWall
                        ? "inset 0 0 0 1px #334155, 0 0 0 1px #000"
                        : isNextStep
                          ? "inset 0 0 0 3px #facc15"
                          : onPath
                            ? "inset 0 0 0 2px #22d3ee"
                            : onOldPath
                              ? "inset 0 0 0 2px #f87171"
                              : undefined,
                    }}
                  >
                    {isWall && (
                      <span
                        className="pointer-events-none absolute inset-0 opacity-40"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(90deg, #1e293b 0 4px, #0f172a 4px 8px)",
                        }}
                      />
                    )}

                    {!isWall && cell.type === "corridor" && (
                      <span
                        className="pointer-events-none absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle, #64748b 1px, transparent 1px)",
                          backgroundSize: "8px 8px",
                        }}
                      />
                    )}

                    {showIcon && !isRobot && !agent && (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <CellIcon size={iconSize} />
                      </span>
                    )}

                    {isExplored && (
                      <span className="pointer-events-none absolute inset-0 bg-amber-400/35" />
                    )}
                    {onTrail && (
                      <span className="pointer-events-none absolute inset-0 bg-cyan-400/20" />
                    )}

                    {isStart && (
                      <span className="absolute -left-0.5 -top-0.5 z-20 text-sm drop-shadow-lg">
                        🚩
                      </span>
                    )}
                    {isGoal && !isStart && (
                      <span className="absolute -right-0.5 -top-0.5 z-20 text-sm drop-shadow-lg">
                        🎯
                      </span>
                    )}

                    {agent && (
                      <span
                        className="absolute inset-0 z-10 flex items-center justify-center bg-orange-950/60"
                        title={translate(locale, `agent.${agent.labelKey}`)}
                      >
                        <span style={{ fontSize: iconSize * 0.8 }}>
                          {AGENT_EMOJI[agent.labelKey] ?? "🧑"}
                        </span>
                      </span>
                    )}

                    {isRobot && (
                      <span
                        className={`absolute inset-0 z-20 flex items-center justify-center rounded-md bg-cyan-500/25 ring-2 ring-cyan-400 ${
                          running && !planningPhase ? "animate-pulse" : ""
                        }`}
                      >
                        <span
                          className="drop-shadow-lg"
                          style={{ fontSize: Math.min(iconSize + 4, 28) }}
                        >
                          🤖
                        </span>
                      </span>
                    )}

                    {layers.pathNumbers &&
                      onPath &&
                      pathIndex > 0 &&
                      cellSize >= 28 &&
                      !isRobot &&
                      !agent && (
                        <span className="absolute bottom-0 right-0 z-10 rounded-tl bg-cyan-900/90 px-0.5 text-[8px] font-bold text-cyan-100">
                          {pathIndex}
                        </span>
                      )}
                  </button>
                );
              })
            )}
          </div>

          {layers.regionLabels &&
            regions.map((region) => {
              const width =
                (region.maxX - region.minX + 1) * (cellSize + gap) - gap;
              const height =
                (region.maxY - region.minY + 1) * (cellSize + gap) - gap;
              const left = region.minX * (cellSize + gap);
              const top = region.minY * (cellSize + gap);
              const isStartRegion =
                start &&
                region.cells.some((c) => c.x === start.x && c.y === start.y);
              const isGoalRegion =
                goal &&
                region.cells.some((c) => c.x === goal.x && c.y === goal.y);
              const isNavigateAct =
                presentationAct === "navigate" || presentationAct === "complete";
              const useCornerBadge = isNavigateAct && !isStartRegion && !isGoalRegion;

              return (
                <div
                  key={region.id}
                  className={`pointer-events-none absolute z-[5] ${
                    useCornerBadge
                      ? "left-0 top-0 rounded-br border border-white/20 bg-black/70 px-1.5 py-0.5 text-[9px] font-medium text-white/90"
                      : `flex items-center justify-center rounded-md border px-1 text-center font-semibold leading-tight shadow-lg ${
                          isStartRegion
                            ? "border-lime-400/60 bg-lime-950/75 text-lime-100"
                            : isGoalRegion
                              ? "border-amber-400/60 bg-amber-950/75 text-amber-100"
                              : "border-white/15 bg-black/55 text-white/95"
                        } ${
                          presentationAct === "intro" &&
                          (isStartRegion || isGoalRegion)
                            ? "animate-pulse"
                            : ""
                        }`
                  }`}
                  style={
                    useCornerBadge
                      ? { left, top, maxWidth: width }
                      : {
                          left,
                          top,
                          width,
                          height,
                          fontSize: Math.min(13, cellSize * 0.38),
                        }
                  }
                >
                  <span className="px-1">{region.label}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="mt-3 shrink-0 space-y-2">
        <MapLegend />
        <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
          <span className="text-lime-400">🚩 {t("simulator.legendStart")}</span>
          <span className="text-amber-400">🎯 {t("simulator.legendDest")}</span>
          <span className="text-cyan-400">{t("simulator.legendPath")}</span>
          <span className="text-yellow-400">{t("simulator.legendNext")}</span>
          <span className="text-red-400">{t("simulator.legendOldPath")}</span>
          <span className="text-amber-500">{t("simulator.legendExplored")}</span>
        </div>
      </div>
    </div>
  );
}

/** Returns remaining steps on the current path. */
function metricsPathLength(path: Point[]): number {
  return Math.max(0, path.length - 1);
}
