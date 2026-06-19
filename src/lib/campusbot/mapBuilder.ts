import type { CampusMap, CellType, MapCell, Point } from "./types";

const WALL: CellType = "wall";
const CORRIDOR: CellType = "corridor";

/**
 * Builds a 2D cell grid from a compact layout string.
 * Legend: # wall, . corridor, _ empty, O obstacle, R restricted
 */
export function buildMapFromLayout(
  id: string,
  name: string,
  layout: string[],
  cellOverrides: Record<string, Partial<MapCell>> = {}
): Omit<CampusMap, "locations"> {
  const height = layout.length;
  const width = layout[0]?.length ?? 0;
  const cells: MapCell[][] = [];

  const charToType: Record<string, CellType> = {
    "#": WALL,
    ".": CORRIDOR,
    "_": "empty",
    O: "obstacle",
    R: "restricted",
    S: "staff_room",
    C: "classroom",
    L: "library",
    F: "office",
    A: "auditorium",
    G: "gate",
  };

  for (let y = 0; y < height; y++) {
    const row: MapCell[] = [];
    for (let x = 0; x < width; x++) {
      const ch = layout[y][x] ?? "#";
      const type = charToType[ch] ?? WALL;
      const key = `${x},${y}`;
      const base: MapCell = { x, y, type };
      row.push({ ...base, ...cellOverrides[key] });
    }
    cells.push(row);
  }

  return { id, name, width, height, cells };
}

/**
 * Merges obstacle points into an existing map clone.
 */
export function applyObstaclesToMap(
  map: CampusMap,
  obstacles: Point[]
): CampusMap {
  const cells = map.cells.map((row) =>
    row.map((c) => ({ ...c }))
  );
  for (const o of obstacles) {
    if (cells[o.y]?.[o.x] && cells[o.y][o.x].type !== WALL) {
      cells[o.y][o.x] = { ...cells[o.y][o.x], type: "obstacle" };
    }
  }
  return { ...map, cells };
}
