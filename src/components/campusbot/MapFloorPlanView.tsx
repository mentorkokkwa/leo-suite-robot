"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { locationName, formatDecisionEntry, t as translate } from "@/lib/i18n";
import { computeMapRegions } from "@/lib/campusbot/mapRegions";
import {
  cellCenter,
  FLOOR_PLAN_BACKDROP,
  FLOOR_PLAN_PALETTE,
  getFeatureMarkers,
  isPerimeterWall,
  mapViewBox,
  MAP_VIEW_INSET,
  pathToPolyline,
  regionRect,
  ROOM_ZONE_STYLES,
} from "@/lib/campusbot/floorPlanGeometry";
import type { PresentationAct } from "@/lib/campusbot/presentationActs";
import { getMapLayerVisibility } from "@/lib/campusbot/presentationActs";
import type {
  CampusMap,
  DecisionLogEntry,
  DynamicAgent,
  Point,
  RobotState,
} from "@/lib/campusbot/types";
import { getLocationById } from "@/lib/campusbot/maps";
import { getTaskById } from "@/lib/campusbot/tasks";
import { PresentationActBanner } from "./PresentationActBanner";
import { FloorPlanLegend } from "./FloorPlanLegend";

const AGENT_LABEL: Record<string, string> = {
  student: "🧑‍🎓",
  crowd: "👥",
  teacher: "👩‍🏫",
  patron: "📖",
};

type MapFloorPlanViewProps = {
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
  moveDurationMs?: number;
  onCellClick: (point: Point) => void;
};

/**
 * Smoothly animates robot display position between grid cells.
 */
function useSmoothRobotPosition(
  target: Point,
  active: boolean,
  durationMs: number
): { x: number; y: number } {
  const [pos, setPos] = useState(() => cellCenter(target));
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const goal = cellCenter(target);
    if (!active) {
      setPos(goal);
      return;
    }

    const start = pos;
    const startTime = performance.now();
    const duration = durationMs;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setPos({
        x: start.x + (goal.x - start.x) * ease,
        y: start.y + (goal.y - start.y) * ease,
      });
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate toward new grid cell
  }, [target.x, target.y, active, durationMs]);

  return pos;
}

/**
 * SVG floor-plan map with continuous paths (no visible grid blocks).
 */
export function MapFloorPlanView({
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
  moveDurationMs = 1800,
  onCellClick,
}: MapFloorPlanViewProps) {
  const { locale, t } = useLocale();
  const svgRef = useRef<SVGSVGElement>(null);
  const task = getTaskById(taskId);
  const start = task ? getLocationById(map, task.startLocationId) : undefined;
  const goal = task ? getLocationById(map, task.targetLocationId) : undefined;
  const regions = useMemo(
    () => computeMapRegions(map, locale),
    [map, locale]
  );
  const features = useMemo(() => getFeatureMarkers(map), [map]);
  const layers = getMapLayerVisibility(presentationAct, {
    running,
    planningPhase,
  });
  const robotPos = useSmoothRobotPosition(
    robot.position,
    running && !planningPhase,
    moveDurationMs
  );

  const startName = start ? locationName(locale, start.id) : "—";
  const goalName = goal ? locationName(locale, goal.id) : "—";
  const taskLabel = task ? translate(locale, `task.${task.id}.name`) : "";
  const totalSteps =
    robot.completedSteps + Math.max(0, robot.currentPath.length - 1);

  const statusText = getStatusText(
    locale,
    robot,
    planningPhase,
    running,
    goalName,
    totalSteps
  );

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!addObstacleMode || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const loc = pt.matrixTransform(ctm.inverse());
    const gx = Math.floor(loc.x);
    const gy = Math.floor(loc.y);
    if (gx < 0 || gy < 0 || gx >= map.width || gy >= map.height) return;
    onCellClick({ x: gx, y: gy });
  };

  const fullPath =
    layers.path && robot.currentPath.length > 0
      ? robot.currentPath
      : [];
  const trailLine =
    layers.trail && robotTrail.length > 1 ? robotTrail : [];

  const viewInset = MAP_VIEW_INSET;
  const innerW = map.width - viewInset * 2;
  const innerH = map.height - viewInset * 2;

  return (
    <div className="flex min-h-[52vh] min-w-0 flex-1 flex-col overflow-hidden bg-[#f7f4ee] xl:min-h-0">
      {presentationAct !== "off" && (
        <div className="shrink-0 px-2 pt-1">
          <PresentationActBanner act={presentationAct} />
        </div>
      )}

      <div
        className={`mx-2 mb-1 shrink-0 rounded-lg border px-3 py-2 text-sm font-medium ${statusTone(robot, planningPhase, running)}`}
        role="status"
        aria-live="polite"
      >
        {statusText}
        {planningPhase && layers.explored && (
          <span className="mt-0.5 block text-xs opacity-90">
            {t("simulator.planningExplored", { count: exploredCells.length })}
          </span>
        )}
        {lastLogEntry && running && robot.status === "moving" && (
          <span className="mt-0.5 block text-xs opacity-90">
            {formatDecisionEntry(locale, lastLogEntry).reason}
          </span>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <svg
          ref={svgRef}
          viewBox={mapViewBox(map)}
          className={`absolute inset-0 h-full w-full select-none ${
            addObstacleMode ? "cursor-crosshair" : "cursor-default"
          }`}
          preserveAspectRatio="xMidYMid meet"
          onClick={handleSvgClick}
          role="img"
          aria-label={t("simulator.floorPlanAria")}
        >
          <defs>
            <pattern
              id="floorGrid"
              width="0.25"
              height="0.25"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="0.125" cy="0.125" r="0.02" fill="#c4bfb4" opacity="0.35" />
            </pattern>
            <pattern
              id="restrictedHatch"
              width="0.2"
              height="0.2"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="0.2" stroke="#ef4444" strokeWidth="0.04" />
            </pattern>
            <filter id="robotShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0.06" stdDeviation="0.08" floodOpacity="0.35" />
            </filter>
            <marker
              id="arrowPath"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 6 3, 0 6" fill="#0891b2" />
            </marker>
          </defs>

          {/* Full-stage floor (no outer wall frame) */}
          <rect
            x={viewInset}
            y={viewInset}
            width={innerW}
            height={innerH}
            fill={FLOOR_PLAN_BACKDROP}
          />

          {/* Corridor / open floor */}
          {map.cells.flatMap((row) =>
            row
              .filter((c) => c.type === "corridor" || c.type === "empty")
              .map((cell) => (
                <rect
                  key={`floor-${cell.x}-${cell.y}`}
                  x={cell.x}
                  y={cell.y}
                  width={1}
                  height={1}
                  fill="url(#floorGrid)"
                  stroke="none"
                />
              ))
          )}

          {/* Room zones */}
          {regions.map((region) => {
            const style = ROOM_ZONE_STYLES[region.type];
            const rect = regionRect(
              region.minX,
              region.minY,
              region.maxX,
              region.maxY
            );
            const isStart =
              start &&
              region.cells.some((c) => c.x === start.x && c.y === start.y);
            const isGoal =
              goal && region.cells.some((c) => c.x === goal.x && c.y === goal.y);

            return (
              <g key={region.id}>
                <rect
                  {...rect}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={isStart || isGoal ? 0.1 : 0.06}
                  opacity={0.95}
                />
                <text
                  x={rect.x + rect.width / 2}
                  y={rect.y + rect.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.max(0.36, Math.min(0.52, rect.width * 0.24))}
                  fontWeight={600}
                  fill="#0f172a"
                  pointerEvents="none"
                >
                  {style.icon ? `${style.icon} ` : ""}
                  {region.label}
                </text>
              </g>
            );
          })}

          {/* Interior walls only (perimeter ring hidden) */}
          {map.cells.flatMap((row) =>
            row
              .filter((c) => c.type === "wall" && !isPerimeterWall(c, map))
              .map((cell) => (
                <rect
                  key={`wall-${cell.x}-${cell.y}`}
                  x={cell.x}
                  y={cell.y}
                  width={1}
                  height={1}
                  fill={FLOOR_PLAN_PALETTE.wall.fill}
                  stroke="none"
                />
              ))
          )}

          {/* Hazards & furniture */}
          {features.map((f) => {
            const cx = f.point.x + 0.5;
            const cy = f.point.y + 0.5;
            if (f.kind === "restricted") {
              return (
                <g key={`r-${f.point.x}-${f.point.y}`}>
                  <rect
                    x={f.point.x + 0.1}
                    y={f.point.y + 0.1}
                    width={0.8}
                    height={0.8}
                    fill="url(#restrictedHatch)"
                    stroke="#ef4444"
                    strokeWidth={0.04}
                    rx={0.08}
                  />
                  <text x={cx} y={cy} textAnchor="middle" fontSize={0.35} dominantBaseline="middle">
                    ⛔
                  </text>
                </g>
              );
            }
            if (f.kind === "obstacle") {
              return (
                <g key={`o-${f.point.x}-${f.point.y}`}>
                  <rect
                    x={f.point.x + 0.15}
                    y={f.point.y + 0.2}
                    width={0.7}
                    height={0.55}
                    fill="#c4a574"
                    stroke="#8b6914"
                    strokeWidth={0.04}
                    rx={0.06}
                  />
                  <text x={cx} y={cy + 0.05} textAnchor="middle" fontSize={0.3} dominantBaseline="middle">
                    📦
                  </text>
                </g>
              );
            }
            return (
              <g key={`d-${f.point.x}-${f.point.y}`}>
                <rect
                  x={f.point.x + 0.2}
                  y={f.point.y + 0.35}
                  width={0.6}
                  height={0.35}
                  fill="#b8c0cc"
                  stroke="#64748b"
                  strokeWidth={0.03}
                  rx={0.04}
                />
              </g>
            );
          })}

          {/* A* explored cells */}
          {layers.explored &&
            exploredCells.map((p, i) => (
              <circle
                key={`exp-${p.x}-${p.y}-${i}`}
                cx={p.x + 0.5}
                cy={p.y + 0.5}
                r={0.22}
                fill="#fbbf24"
                opacity={0.35 + (i / exploredCells.length) * 0.4}
              />
            ))}

          {/* Abandoned route */}
          {layers.oldPath && replacedPath.length > 1 && (
            <polyline
              points={pathToPolyline(replacedPath)}
              fill="none"
              stroke="#f87171"
              strokeWidth={0.1}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0.15 0.12"
              opacity={0.85}
            />
          )}

          {/* Trail */}
          {trailLine.length > 1 && (
            <polyline
              points={pathToPolyline(trailLine)}
              fill="none"
              stroke="#67e8f9"
              strokeWidth={0.14}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.45}
            />
          )}

          {/* Planned / active route */}
          {fullPath.length > 1 && (
            <polyline
              points={pathToPolyline(fullPath)}
              fill="none"
              stroke="#0891b2"
              strokeWidth={0.12}
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#arrowPath)"
              opacity={planningPhase ? 0.7 : 0.95}
            />
          )}

          {/* Next step highlight */}
          {layers.nextStep && robot.currentPath[1] && !planningPhase && (
            <circle
              cx={robot.currentPath[1].x + 0.5}
              cy={robot.currentPath[1].y + 0.5}
              r={0.28}
              fill="none"
              stroke="#eab308"
              strokeWidth={0.08}
            />
          )}

          {/* Dynamic agents */}
          {layers.agents &&
            dynamicAgents.map((agent) => (
              <g
                key={agent.id}
                transform={`translate(${agent.position.x + 0.5}, ${agent.position.y + 0.5})`}
              >
                <circle r={0.3} fill="#fed7aa" stroke="#ea580c" strokeWidth={0.04} />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={0.34}
                  y={0.02}
                >
                  {AGENT_LABEL[agent.labelKey] ?? "🧑"}
                </text>
              </g>
            ))}

          {/* Start / goal pins */}
          {layers.startGoal && start && (
            <g transform={`translate(${start.x + 0.5}, ${start.y + 0.5})`}>
              <line x1={0} y1={0.35} x2={0} y2={-0.15} stroke="#16a34a" strokeWidth={0.04} />
              <polygon points="0,-0.35 -0.18,-0.1 0.18,-0.1" fill="#22c55e" />
              <text y={0.55} textAnchor="middle" fontSize={0.28} fill="#166534" fontWeight={700}>
                START
              </text>
            </g>
          )}
          {layers.startGoal && goal && (
            <g transform={`translate(${goal.x + 0.5}, ${goal.y + 0.5})`}>
              <circle r={0.2} fill="#f59e0b" stroke="#b45309" strokeWidth={0.04} />
              <circle r={0.08} fill="#fef3c7" />
              <text y={0.5} textAnchor="middle" fontSize={0.28} fill="#92400e" fontWeight={700}>
                GOAL
              </text>
            </g>
          )}

          {/* CampusBot */}
          {layers.robot && (
            <g
              transform={`translate(${robotPos.x}, ${robotPos.y})`}
              filter="url(#robotShadow)"
            >
              <circle r={0.38} fill="#0891b2" stroke="#0e7490" strokeWidth={0.05} />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={0.44}
                y={0.02}
              >
                🤖
              </text>
              {running && !planningPhase && (
                <circle
                  r={0.48}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth={0.04}
                  opacity={0.7}
                >
                  <animate
                    attributeName="r"
                    values="0.38;0.52;0.38"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.7;0.2;0.7"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          )}
        </svg>

        {running && (
          <div className="pointer-events-none absolute left-2 top-2 z-10 max-w-xs rounded-lg border border-cyan-500/40 bg-slate-950/90 px-3 py-2 shadow-lg backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              {taskLabel}
            </p>
            <p className="mt-0.5 text-sm font-medium text-white">
              {translate(locale, "simulator.missionRoute", {
                from: startName,
                to: goalName,
              })}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-cyan-600 px-2.5 py-1 text-sm font-bold text-white">
                {translate(locale, "simulator.missionStep", {
                  step: robot.completedSteps,
                  total: totalSteps,
                })}
              </span>
              <span className="text-sm text-cyan-100/90">
                {translate(locale, `robotStatus.${robot.status}`)}
              </span>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-2 left-2 right-2 z-10 max-h-[4.5rem] overflow-hidden">
          <FloorPlanLegend />
        </div>
      </div>
    </div>
  );
}

function statusTone(
  robot: RobotState,
  planningPhase: boolean,
  running: boolean
): string {
  if (robot.status === "completed")
    return "border-lime-500/60 bg-lime-950/50 text-lime-200";
  if (robot.status === "failed" || robot.status === "blocked")
    return "border-red-500/60 bg-red-950/50 text-red-200";
  if (planningPhase || robot.status === "planning")
    return "border-amber-500/60 bg-amber-950/50 text-amber-200";
  if (robot.status === "replanning")
    return "border-orange-500/60 bg-orange-950/50 text-orange-200";
  if (running) return "border-cyan-500/60 bg-cyan-950/50 text-cyan-100";
  return "border-slate-700 bg-slate-900/80 text-slate-400";
}

function getStatusText(
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
