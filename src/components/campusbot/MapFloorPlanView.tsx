"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { locationName, t as translate } from "@/lib/i18n";
import { useMapViewportSize } from "@/hooks/useMapViewportSize";
import { mapAspectRatio } from "@/lib/campusbot/mapViewport";
import {
  FUHUA_AERIAL_IMAGE_PATH,
  FUHUA_EXTERIOR_LABELS,
  FUHUA_INDOOR_BOUNDS,
  isExteriorGround,
  isIndoorCell,
} from "@/lib/campusbot/fuhuaCampus";
import { computeMapRegions } from "@/lib/campusbot/mapRegions";
import {
  cellCenter,
  FLOOR_PLAN_PALETTE,
  getFeatureMarkers,
  isPerimeterWall,
  mapViewBox,
  MAP_STAGE_BACKDROP,
  MAP_VIEW_INSET,
  pathToPolyline,
  regionRect,
  roomLabelFontSize,
  ROOM_ZONE_STYLES,
} from "@/lib/campusbot/floorPlanGeometry";
import type { PresentationAct } from "@/lib/campusbot/presentationActs";
import { getMapLayerVisibility } from "@/lib/campusbot/presentationActs";
import type {
  CampusMap,
  DynamicAgent,
  Point,
  RobotState,
} from "@/lib/campusbot/types";
import { getLocationById } from "@/lib/campusbot/maps";
import { getTaskById } from "@/lib/campusbot/tasks";
import { PresentationActBanner } from "./PresentationActBanner";
import { FloorPlanLegend } from "./FloorPlanLegend";

const AGENT_LABEL: Record<string, string> = {
  student: "S",
  crowd: "C",
  teacher: "T",
  patron: "P",
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
  addObstacleMode: boolean;
  presentationAct?: PresentationAct;
  moveDurationMs?: number;
  /** Called when presenter clicks "advance" in the intro act banner. */
  onAdvanceFromIntro?: () => void;
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
  addObstacleMode,
  presentationAct = "off",
  moveDurationMs = 1800,
  onAdvanceFromIntro,
  onCellClick,
}: MapFloorPlanViewProps) {
  const { locale, t } = useLocale();
  const stageRef = useRef<HTMLDivElement>(null);
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

  const goalName = goal ? locationName(locale, goal.id) : "—";
  const startName = start ? locationName(locale, start.id) : "—";
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
  const aspect = useMemo(
    () => mapAspectRatio(map.width, map.height, viewInset),
    [map.width, map.height, viewInset]
  );
  const frameSize = useMapViewportSize(stageRef, aspect);

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: MAP_STAGE_BACKDROP }}
    >
      {presentationAct !== "off" && (
        <div className="shrink-0 px-2 pt-1">
          <PresentationActBanner
            act={presentationAct}
            onAdvance={onAdvanceFromIntro}
          />
        </div>
      )}

      <div
        className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-1.5"
        role="status"
        aria-live="polite"
      >
        <p className="min-w-0 flex-1 truncate text-xs text-slate-600">
          {statusText}
          {planningPhase && layers.explored && (
            <span className="ml-2 text-slate-400">
              {t("simulator.planningExplored", { count: exploredCells.length })}
            </span>
          )}
        </p>
        <FloorPlanLegend />
      </div>

      <div
        ref={stageRef}
        className="flex min-h-0 flex-1 items-center justify-center p-3"
      >
        <div
          className="relative shrink-0 overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm"
          style={{
            width: frameSize.width > 0 ? frameSize.width : "100%",
            height: frameSize.height > 0 ? frameSize.height : "100%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
        <svg
          ref={svgRef}
          viewBox={mapViewBox(map)}
          className={`block h-full w-full select-none ${
            addObstacleMode ? "cursor-crosshair" : "cursor-default"
          }`}
          preserveAspectRatio="xMidYMid meet"
          onClick={handleSvgClick}
          role="img"
          aria-label={t("simulator.floorPlanAria")}
        >
          <defs>
            <pattern
              id="corridorTile"
              width="1"
              height="1"
              patternUnits="userSpaceOnUse"
            >
              <rect width="1" height="1" fill="#ffffff" />
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
              <feDropShadow dx="0" dy="0.04" stdDeviation="0.05" floodOpacity="0.2" />
            </filter>
            {/* Drop shadow for location pin badges */}
            <filter id="labelShadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0.05" dy="0.08" stdDeviation="0.09" floodOpacity="0.38" />
            </filter>
            {/* Path-end arrow — sized to match marker circles (r ≈ 0.22) */}
            <marker
              id="arrowPath"
              markerUnits="userSpaceOnUse"
              markerWidth="0.44"
              markerHeight="0.44"
              refX="0.4"
              refY="0.22"
              orient="auto"
            >
              <polygon points="0 0, 0.44 0.22, 0 0.44" fill="#2563eb" />
            </marker>
          </defs>

          {/* Satellite backdrop (Fuhua Secondary School, Jurong West) */}
          <image
            href={FUHUA_AERIAL_IMAGE_PATH}
            x={viewInset}
            y={viewInset}
            width={innerW}
            height={innerH}
            preserveAspectRatio="xMidYMid slice"
            opacity={0.94}
          />

          {/* Outdoor grounds tint */}
          {map.cells.flatMap((row) =>
            row
              .filter((c) => isExteriorGround(c))
              .map((cell) => (
                <rect
                  key={`ext-${cell.x}-${cell.y}`}
                  x={cell.x}
                  y={cell.y}
                  width={1}
                  height={1}
                  fill="#16a34a"
                  opacity={0.12}
                />
              ))
          )}

          {/* Illustrative indoor schematic panel */}
          <rect
            x={FUHUA_INDOOR_BOUNDS.minX - 0.08}
            y={FUHUA_INDOOR_BOUNDS.minY - 0.08}
            width={
              FUHUA_INDOOR_BOUNDS.maxX -
              FUHUA_INDOOR_BOUNDS.minX +
              1.16
            }
            height={
              FUHUA_INDOOR_BOUNDS.maxY -
              FUHUA_INDOOR_BOUNDS.minY +
              1.16
            }
            fill="#ffffff"
            opacity={0.84}
            rx={0.18}
            stroke="#cbd5e1"
            strokeWidth={0.06}
          />

          {/* Corridor / open floor (indoor only) */}
          {map.cells.flatMap((row) =>
            row
              .filter(
                (c) =>
                  (c.type === "corridor" || c.type === "empty") &&
                  isIndoorCell(c.x, c.y)
              )
              .map((cell) => (
                <rect
                  key={`floor-${cell.x}-${cell.y}`}
                  x={cell.x}
                  y={cell.y}
                  width={1}
                  height={1}
                  fill="url(#corridorTile)"
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
                  opacity={0.96}
                />
                {region.isNamed && (
                  <text
                    x={rect.x + rect.width / 2}
                    y={rect.y + rect.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={roomLabelFontSize(rect, region.label.length)}
                    fontWeight={500}
                    fill="#334155"
                    pointerEvents="none"
                  >
                    {region.label}
                  </text>
                )}
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
                  <text x={cx} y={cy} textAnchor="middle" fontSize={0.28} dominantBaseline="middle" fill="#dc2626" fontWeight={700}>
                    ×
                  </text>
                </g>
              );
            }
            if (f.kind === "obstacle") {
              return (
                <g key={`o-${f.point.x}-${f.point.y}`}>
                  <rect
                    x={f.point.x + 0.2}
                    y={f.point.y + 0.25}
                    width={0.6}
                    height={0.5}
                    fill="#d6d3d1"
                    stroke="#78716c"
                    strokeWidth={0.03}
                    rx={0.04}
                  />
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

          {/* Abandoned route (red dashed — clearly marks old discarded path) */}
          {layers.oldPath && replacedPath.length > 1 && (
            <polyline
              points={pathToPolyline(replacedPath)}
              fill="none"
              stroke="#f87171"
              strokeWidth={0.18}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0.18 0.13"
              opacity={0.9}
            />
          )}

          {/* Trail (path already walked) */}
          {trailLine.length > 1 && (
            <polyline
              points={pathToPolyline(trailLine)}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={0.18}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.5}
            />
          )}

          {/* Planned / active route */}
          {fullPath.length > 1 && (
            <polyline
              points={pathToPolyline(fullPath)}
              fill="none"
              stroke="#2563eb"
              strokeWidth={0.18}
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#arrowPath)"
              opacity={planningPhase ? 0.75 : 0.97}
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

          {/* Dynamic agents — orange circles with readable name labels */}
          {layers.agents &&
            dynamicAgents.map((agent) => (
              <g
                key={agent.id}
                transform={`translate(${agent.position.x + 0.5}, ${agent.position.y + 0.5})`}
              >
                {/* Agent name label — larger font with dark outline for legibility */}
                <text
                  y={-0.48}
                  textAnchor="middle"
                  fontSize={0.44}
                  fontWeight={700}
                  fill="#fed7aa"
                  stroke="#431407"
                  strokeWidth={0.068}
                  paintOrder="stroke"
                >
                  {translate(locale, `agent.${agent.labelKey}`)}
                </text>
                {/* Larger agent circle for better visibility */}
                <circle r={0.24} fill="#f97316" stroke="#c2410c" strokeWidth={0.04} />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={0.2}
                  fill="white"
                  fontWeight={700}
                  y={0.01}
                >
                  {AGENT_LABEL[agent.labelKey] ?? "?"}
                </text>
              </g>
            ))}

          {/* Start pin — professional map-pin badge with triangle pointer */}
          {layers.startGoal && start && (
            <g transform={`translate(${start.x + 0.5}, ${start.y + 0.12})`} filter="url(#labelShadow)">
              {/* Badge body: 3.0 wide × 0.9 tall — readable at all scales */}
              <rect x={-1.5} y={-1.15} width={3.0} height={0.9} rx={0.14}
                fill="#166534" stroke="#ffffff" strokeWidth={0.05} />
              <text x={0} y={-0.70} textAnchor="middle" dominantBaseline="middle"
                fontSize={0.60} fontWeight={800} fill="white">
                {t("simulator.legendStart")}
              </text>
              {/* Downward-pointing triangle connector */}
              <polygon points="0,0 -0.26,-0.25 0.26,-0.25" fill="#166534" />
            </g>
          )}
          {/* Goal pin — professional map-pin badge with triangle pointer */}
          {layers.startGoal && goal && (
            <g transform={`translate(${goal.x + 0.5}, ${goal.y + 0.12})`} filter="url(#labelShadow)">
              <rect x={-1.5} y={-1.15} width={3.0} height={0.9} rx={0.14}
                fill="#b45309" stroke="#ffffff" strokeWidth={0.05} />
              <text x={0} y={-0.70} textAnchor="middle" dominantBaseline="middle"
                fontSize={0.60} fontWeight={800} fill="white">
                {t("simulator.legendDest")}
              </text>
              <polygon points="0,0 -0.26,-0.25 0.26,-0.25" fill="#b45309" />
            </g>
          )}
          {/* Goal beacon — subtle pulse, same scale as robot/agent circles */}
          {goal && running && !planningPhase && (
            <g transform={`translate(${goal.x + 0.5}, ${goal.y + 0.5})`}>
              <circle r={0.22} fill="none" stroke="#fbbf24" strokeWidth={0.05} opacity={0.85}>
                <animate attributeName="r"
                  values="0.2;0.28;0.2" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity"
                  values="0.85;0.35;0.85" dur="2.4s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* CampusBot */}
          {layers.robot && (
            <g transform={`translate(${robotPos.x}, ${robotPos.y})`}>
              {/* Robot identity — dark pill badge for high contrast readability */}
              <g transform="translate(0, -0.66)">
                <rect x={-1.0} y={-0.3} width={2.0} height={0.56} rx={0.12}
                  fill="rgba(15,23,42,0.88)" stroke="rgba(147,197,253,0.45)" strokeWidth={0.032} />
                <text textAnchor="middle" dominantBaseline="middle"
                  fontSize={0.52} fontWeight={700} fill="#93c5fd">
                  {t("simulator.markerRobot")}
                </text>
              </g>
              <circle r={0.22} fill="#2563eb" stroke="#1d4ed8" strokeWidth={0.04} />
              <circle r={0.08} fill="#ffffff" />
              {running && !planningPhase && (
                <circle
                  r={0.36}
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth={0.04}
                  opacity={0.8}
                >
                  <animate
                    attributeName="r"
                    values="0.28;0.38;0.28"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          )}

          {/* Exterior POI labels on satellite backdrop */}
          {FUHUA_EXTERIOR_LABELS.map((spot) => (
            <text
              key={spot.id}
              x={spot.x + 0.5}
              y={spot.y + 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={0.3}
              fontWeight={600}
              fill="#f8fafc"
              stroke="#0f172a"
              strokeWidth={0.04}
              paintOrder="stroke"
              pointerEvents="none"
            >
              {locationName(locale, spot.id)}
            </text>
          ))}
        </svg>

        {/* Mission context card — persistent during simulation */}
        {running && task && (
          <div className="pointer-events-none absolute left-2 top-2 z-10 max-w-[55%] rounded-lg border border-cyan-700/60 bg-slate-900/90 px-3 py-2 text-xs backdrop-blur-sm">
            <p className="font-bold text-cyan-300">{goalName}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              {startName} → {goalName}
            </p>
            {robot.status === "replanning" && (
              <p className="mt-1 animate-pulse font-semibold text-orange-400">
                ⚠ Re-planning route…
              </p>
            )}
          </div>
        )}

        {running && (
          <div className="pointer-events-none absolute bottom-1 right-2">
            <div className="rounded bg-slate-800/85 px-2 py-0.5 text-[11px] font-medium text-white">
              {translate(locale, "simulator.missionStep", {
                step: robot.completedSteps,
                total: totalSteps,
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
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
