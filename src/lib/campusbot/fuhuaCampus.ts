import type { MapCell } from "./types";

/** Horizontal padding (grid cells) added on each side of the indoor schematic. */
export const FUHUA_CAMPUS_PAD_X = 12;

/** Bundled satellite backdrop around Fuhua Secondary School, Jurong West. */
export const FUHUA_AERIAL_IMAGE_PATH = "/campusbot/fuhua-campus-aerial.jpg";

/** Approximate campus center used for the satellite export (OpenStreetMap). */
export const FUHUA_CAMPUS_CENTER = {
  lat: 1.347278,
  lng: 103.726564,
};

/** Grid bounds of the illustrative indoor block inside the wide campus map. */
export const FUHUA_INDOOR_BOUNDS = {
  minX: FUHUA_CAMPUS_PAD_X,
  minY: 1,
  maxX: FUHUA_CAMPUS_PAD_X + 23,
  maxY: 21,
};

/** Exterior POI labels rendered on the satellite backdrop. */
export const FUHUA_EXTERIOR_LABELS = [
  { id: "sports-field", x: 6, y: 11 },
  { id: "car-park", x: 41, y: 11 },
] as const;

/**
 * Returns true when a cell lies inside the schematic indoor building block.
 */
export function isIndoorCell(x: number, y: number): boolean {
  return (
    x >= FUHUA_INDOOR_BOUNDS.minX &&
    x <= FUHUA_INDOOR_BOUNDS.maxX &&
    y >= FUHUA_INDOOR_BOUNDS.minY &&
    y <= FUHUA_INDOOR_BOUNDS.maxY
  );
}

/**
 * Returns true for outdoor ground cells on the satellite backdrop.
 */
export function isExteriorGround(cell: MapCell): boolean {
  return (
    (cell.type === "empty" || cell.type === "corridor") &&
    !isIndoorCell(cell.x, cell.y)
  );
}

/**
 * Shifts a grid point horizontally when expanding the indoor layout.
 */
export function shiftPointX(point: { x: number; y: number }, dx: number): {
  x: number;
  y: number;
} {
  return { x: point.x + dx, y: point.y };
}
