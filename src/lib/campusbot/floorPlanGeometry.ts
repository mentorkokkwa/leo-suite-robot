import type { CampusMap, CellType, MapCell, Point } from "./types";

/** SVG user-units per grid cell (viewBox uses grid coordinates). */
export const GRID_UNIT = 1;

/** Grid cells to crop from each edge (outer wall ring). */
export const MAP_VIEW_INSET = 1;

/** Extra breathing room inside the SVG viewBox (grid units). */
export const MAP_VIEW_PADDING = 0.25;

/** Cream backdrop shared with the simulator stage. */
export const FLOOR_PLAN_BACKDROP = "#f7f4ee";

/**
 * SVG viewBox string that excludes the outer wall border with soft padding.
 */
export function mapViewBox(map: CampusMap): string {
  const inset = MAP_VIEW_INSET;
  const pad = MAP_VIEW_PADDING;
  const x = inset - pad;
  const y = inset - pad;
  const w = map.width - inset * 2 + pad * 2;
  const h = map.height - inset * 2 + pad * 2;
  return `${x} ${y} ${w} ${h}`;
}

/**
 * Outer ring of wall cells that form the dark building frame (hidden in floor-plan view).
 */
export function isPerimeterWall(cell: MapCell, map: CampusMap): boolean {
  if (cell.type !== "wall") return false;
  return (
    cell.x <= MAP_VIEW_INSET - 1 ||
    cell.y <= MAP_VIEW_INSET - 1 ||
    cell.x >= map.width - MAP_VIEW_INSET ||
    cell.y >= map.height - MAP_VIEW_INSET
  );
}

/**
 * Center point of a grid cell in floor-plan coordinates.
 */
export function cellCenter(p: Point): { x: number; y: number } {
  return { x: p.x + 0.5, y: p.y + 0.5 };
}

/**
 * Converts a path of grid points to an SVG polyline string.
 */
export function pathToPolyline(points: Point[]): string {
  return points.map((p) => {
    const c = cellCenter(p);
    return `${c.x},${c.y}`;
  }).join(" ");
}

/** Architectural floor-plan palette (light map style). */
export const FLOOR_PLAN_PALETTE: Record<CellType, { fill: string; stroke: string }> = {
  wall: { fill: "#b8b2a6", stroke: "#9a9488" },
  corridor: { fill: "#e8e4dc", stroke: "#d4cfc4" },
  empty: { fill: "#ebe7df", stroke: "#d4cfc4" },
  classroom: { fill: "#bdd4f5", stroke: "#7ba3d4" },
  staff_room: { fill: "#ccc9f0", stroke: "#8b85c9" },
  library: { fill: "#b8e0c8", stroke: "#5fa87a" },
  office: { fill: "#d4c4f0", stroke: "#9b7fd4" },
  auditorium: { fill: "#f0b8d4", stroke: "#c97ba0" },
  gate: { fill: "#a8e6c8", stroke: "#4fa87a" },
  obstacle: { fill: "#c4a574", stroke: "#8b6914" },
  restricted: { fill: "#fecaca", stroke: "#dc2626" },
};

export type RoomStyle = {
  fill: string;
  stroke: string;
  icon: string;
};

/** Room zone styling for floor-plan regions. */
export const ROOM_ZONE_STYLES: Record<CellType, RoomStyle> = {
  classroom: { fill: "#d4e8ff", stroke: "#5b8fd4", icon: "🏫" },
  staff_room: { fill: "#e0dcff", stroke: "#7b74c9", icon: "👩‍🏫" },
  library: { fill: "#d0f0dc", stroke: "#4a9e6a", icon: "📚" },
  office: { fill: "#e8dcff", stroke: "#8b6fc9", icon: "🏢" },
  auditorium: { fill: "#ffd4e8", stroke: "#c96a9e", icon: "🎭" },
  gate: { fill: "#c0f0d8", stroke: "#3d9e6a", icon: "🚪" },
  corridor: { fill: "#e8e4dc", stroke: "#c4bfb4", icon: "" },
  empty: { fill: "#ebe7df", stroke: "#c4bfb4", icon: "" },
  wall: { fill: "#3d4f63", stroke: "#2d3748", icon: "" },
  obstacle: { fill: "#c4a574", stroke: "#8b6914", icon: "📦" },
  restricted: { fill: "#fee2e2", stroke: "#ef4444", icon: "⛔" },
};

/**
 * Returns whether a cell is walkable floor (not wall).
 */
export function isFloorCell(cell: MapCell | undefined): boolean {
  return !!cell && cell.type !== "wall";
}

/**
 * Builds a rounded-rect descriptor for a grid region.
 */
export function regionRect(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  padding = 0.08
): { x: number; y: number; width: number; height: number; rx: number } {
  return {
    x: minX + padding,
    y: minY + padding,
    width: maxX - minX + 1 - padding * 2,
    height: maxY - minY + 1 - padding * 2,
    rx: 0.18,
  };
}

/**
 * Point markers that need furniture / hazard icons on the floor plan.
 */
export function getFeatureMarkers(map: CampusMap): {
  point: Point;
  kind: "obstacle" | "restricted" | "desk";
  label?: string;
}[] {
  const markers: {
    point: Point;
    kind: "obstacle" | "restricted" | "desk";
    label?: string;
  }[] = [];

  for (const row of map.cells) {
    for (const cell of row) {
      if (cell.type === "obstacle") {
        markers.push({ point: { x: cell.x, y: cell.y }, kind: "obstacle" });
      } else if (cell.type === "restricted") {
        markers.push({ point: { x: cell.x, y: cell.y }, kind: "restricted" });
      } else if (cell.labelId === "desk") {
        markers.push({
          point: { x: cell.x, y: cell.y },
          kind: "desk",
          label: cell.label,
        });
      }
    }
  }

  return markers;
}
