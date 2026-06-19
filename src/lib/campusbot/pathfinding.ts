import type { CampusMap, CellType, MapCell, Point } from "./types";

const WALKABLE_TYPES = new Set<CellType>([
  "empty",
  "corridor",
  "classroom",
  "staff_room",
  "library",
  "office",
  "auditorium",
  "gate",
]);

/**
 * Manhattan distance heuristic for grid A*.
 */
export function calculateHeuristic(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Returns true when a cell can be entered by the robot.
 */
export function isWalkable(
  cell: MapCell | undefined,
  safetyMode: boolean,
  blockedCells: Set<string> = new Set()
): boolean {
  if (!cell) return false;
  const key = `${cell.x},${cell.y}`;
  if (blockedCells.has(key)) return false;
  if (cell.type === "wall" || cell.type === "obstacle") return false;
  if (safetyMode && cell.type === "restricted") return false;
  return WALKABLE_TYPES.has(cell.type);
}

/**
 * Four-directional neighbors for grid navigation.
 */
export function getNeighbors(
  map: CampusMap,
  point: Point,
  safetyMode: boolean,
  blockedCells: Set<string>
): Point[] {
  const dirs = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];
  const neighbors: Point[] = [];
  for (const d of dirs) {
    const nx = point.x + d.x;
    const ny = point.y + d.y;
    if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue;
    const cell = map.cells[ny]?.[nx];
    if (isWalkable(cell, safetyMode, blockedCells)) {
      neighbors.push({ x: nx, y: ny });
    }
  }
  return neighbors;
}

type AStarNode = {
  point: Point;
  g: number;
  f: number;
  parent: Point | null;
};

function pointKey(p: Point): string {
  return `${p.x},${p.y}`;
}

export type AStarSearchResult = {
  path: Point[];
  /** Cells expanded by A* in order — used for planning visualization. */
  explored: Point[];
};

/**
 * A* path planning with exploration trace for demo visualization.
 */
export function findPathAStarDetailed(
  map: CampusMap,
  start: Point,
  goal: Point,
  safetyMode: boolean,
  blockedCells: Set<string> = new Set()
): AStarSearchResult {
  const startCell = map.cells[start.y]?.[start.x];
  const goalCell = map.cells[goal.y]?.[goal.x];
  if (!isWalkable(startCell, safetyMode, blockedCells)) {
    return { path: [], explored: [] };
  }
  if (!isWalkable(goalCell, safetyMode, blockedCells)) {
    return { path: [], explored: [] };
  }

  const open: AStarNode[] = [
    {
      point: start,
      g: 0,
      f: calculateHeuristic(start, goal),
      parent: null,
    },
  ];
  const openSet = new Set([pointKey(start)]);
  const closed = new Set<string>();
  const cameFrom = new Map<string, Point | null>();
  const gScore = new Map<string, number>();
  const explored: Point[] = [];
  gScore.set(pointKey(start), 0);

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
    const cKey = pointKey(current.point);
    openSet.delete(cKey);

    if (current.point.x === goal.x && current.point.y === goal.y) {
      const path: Point[] = [];
      let cur: Point | null = current.point;
      while (cur) {
        path.unshift(cur);
        cur = cameFrom.get(pointKey(cur)) ?? null;
      }
      return { path, explored };
    }

    if (closed.has(cKey)) continue;
    closed.add(cKey);
    explored.push({ ...current.point });

    for (const neighbor of getNeighbors(
      map,
      current.point,
      safetyMode,
      blockedCells
    )) {
      const nKey = pointKey(neighbor);
      if (closed.has(nKey)) continue;
      const tentativeG = (gScore.get(cKey) ?? Infinity) + 1;
      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        cameFrom.set(nKey, current.point);
        gScore.set(nKey, tentativeG);
        const f = tentativeG + calculateHeuristic(neighbor, goal);
        if (!openSet.has(nKey)) {
          open.push({
            point: neighbor,
            g: tentativeG,
            f,
            parent: current.point,
          });
          openSet.add(nKey);
        }
      }
    }
  }

  return { path: [], explored };
}

/**
 * A* path planning on the school grid map.
 */
export function findPathAStar(
  map: CampusMap,
  start: Point,
  goal: Point,
  safetyMode: boolean,
  blockedCells: Set<string> = new Set()
): Point[] {
  return findPathAStarDetailed(
    map,
    start,
    goal,
    safetyMode,
    blockedCells
  ).path;
}

/**
 * Checks if the next step on the path is blocked by a dynamic or static obstacle.
 */
export function detectObstacleAhead(
  robotPosition: Point,
  path: Point[],
  map: CampusMap,
  safetyMode: boolean,
  blockedCells: Set<string>
): boolean {
  if (path.length < 2) return false;
  const next = path[1];
  const cell = map.cells[next.y]?.[next.x];
  return !isWalkable(cell, safetyMode, blockedCells);
}

/**
 * Re-plans path from current robot position to goal.
 */
export function replanPath(
  robotPosition: Point,
  map: CampusMap,
  goal: Point,
  safetyMode: boolean,
  blockedCells: Set<string>
): Point[] {
  return findPathAStar(map, robotPosition, goal, safetyMode, blockedCells);
}
