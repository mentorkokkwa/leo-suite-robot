import type { Locale } from "@/lib/i18n/types";
import { locationName, t } from "@/lib/i18n";
import type { CampusMap, CellType, MapCell, Point } from "./types";

const REGION_TYPES = new Set<CellType>([
  "classroom",
  "staff_room",
  "library",
  "office",
  "auditorium",
  "gate",
]);

export type MapRegion = {
  id: string;
  type: CellType;
  cells: Point[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  label: string;
};

function pointKey(x: number, y: number): string {
  return `${x},${y}`;
}

/**
 * Finds connected room regions for floor-plan style labels.
 */
export function computeMapRegions(map: CampusMap, locale: Locale): MapRegion[] {
  const visited = new Set<string>();
  const regions: MapRegion[] = [];
  let regionIndex = 0;

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const cell = map.cells[y][x];
      const key = pointKey(x, y);
      if (visited.has(key) || !REGION_TYPES.has(cell.type)) continue;

      const stack: Point[] = [{ x, y }];
      const cells: Point[] = [];
      visited.add(key);

      while (stack.length > 0) {
        const current = stack.pop()!;
        cells.push(current);

        const neighbors = [
          { x: current.x + 1, y: current.y },
          { x: current.x - 1, y: current.y },
          { x: current.x, y: current.y + 1 },
          { x: current.x, y: current.y - 1 },
        ];

        for (const n of neighbors) {
          const nKey = pointKey(n.x, n.y);
          if (visited.has(nKey)) continue;
          const neighbor = map.cells[n.y]?.[n.x];
          if (!neighbor || neighbor.type !== cell.type) continue;
          visited.add(nKey);
          stack.push(n);
        }
      }

      if (cells.length < 2) continue;

      const xs = cells.map((c) => c.x);
      const ys = cells.map((c) => c.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const locationInRegion = map.locations.find((loc) =>
        cells.some((c) => c.x === loc.x && c.y === loc.y)
      );

      const label = locationInRegion
        ? locationName(locale, locationInRegion.id)
        : t(locale, `cellType.${cell.type}`);

      regions.push({
        id: `region-${regionIndex++}`,
        type: cell.type,
        cells,
        minX,
        minY,
        maxX,
        maxY,
        label,
      });
    }
  }

  return regions;
}

/** Room tint colors — flat fill without per-cell icons. */
export const REGION_TINT: Record<CellType, string> = {
  classroom: "#1a3352",
  staff_room: "#2a2768",
  library: "#0f3d24",
  office: "#3b1d6e",
  auditorium: "#5c1838",
  gate: "#064e3b",
  corridor: "#3d4f63",
  empty: "#1e293b",
  wall: "#020617",
  obstacle: "#78350f",
  restricted: "#450a0a",
};

/**
 * Whether a cell should render a pictorial icon (sparse placement).
 */
export function shouldShowCellIcon(cell: MapCell): boolean {
  if (cell.type === "obstacle" || cell.type === "restricted") return true;
  if (cell.labelId === "desk") return true;
  if (cell.type === "gate") return true;
  return false;
}

/**
 * Background fill for a cell — rooms and corridors use flat tints.
 */
export function getCellFillColor(cell: MapCell): string {
  return REGION_TINT[cell.type] ?? REGION_TINT.empty;
}
