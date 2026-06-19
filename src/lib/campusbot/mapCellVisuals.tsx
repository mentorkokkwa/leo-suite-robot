import type { FC } from "react";
import type { MapCell } from "./types";

type IconProps = { size: number; className?: string };

/**
 * Brick wall tile for building exterior / room boundaries.
 */
export function WallIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect width="24" height="24" fill="#1e293b" />
      <rect x="1" y="1" width="10" height="5" fill="#475569" rx="0.5" />
      <rect x="13" y="1" width="10" height="5" fill="#64748b" rx="0.5" />
      <rect x="1" y="8" width="10" height="5" fill="#64748b" rx="0.5" />
      <rect x="13" y="8" width="10" height="5" fill="#475569" rx="0.5" />
      <rect x="1" y="15" width="10" height="5" fill="#475569" rx="0.5" />
      <rect x="13" y="15" width="10" height="5" fill="#64748b" rx="0.5" />
    </svg>
  );
}

/**
 * Corridor floor tile with walkway marking.
 */
export function CorridorIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect width="24" height="24" fill="#334155" />
      <path
        d="M4 12h16"
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        opacity="0.6"
      />
      <circle cx="12" cy="12" r="1.5" fill="#64748b" />
    </svg>
  );
}

/**
 * Classroom desk and chair.
 */
export function ClassroomIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect width="24" height="24" fill="#1e3a5f" rx="1" />
      <rect x="5" y="9" width="14" height="6" fill="#60a5fa" rx="1" />
      <rect x="7" y="15" width="3" height="4" fill="#3b82f6" />
      <rect x="14" y="15" width="3" height="4" fill="#3b82f6" />
      <rect x="9" y="5" width="6" height="4" fill="#93c5fd" rx="0.5" />
    </svg>
  );
}

/**
 * Staff room lounge desk with mug.
 */
export function StaffRoomIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect width="24" height="24" fill="#312e81" rx="1" />
      <rect x="4" y="12" width="16" height="5" fill="#818cf8" rx="1" />
      <rect x="6" y="17" width="2" height="3" fill="#6366f1" />
      <rect x="16" y="17" width="2" height="3" fill="#6366f1" />
      <rect x="9" y="6" width="6" height="6" fill="#c4b5fd" rx="1" />
      <path d="M15 7h3v4h-1" stroke="#a78bfa" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

/**
 * Library bookshelf stack.
 */
export function LibraryIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect width="24" height="24" fill="#14532d" rx="1" />
      <rect x="3" y="4" width="18" height="16" fill="#166534" rx="1" />
      <rect x="5" y="6" width="3" height="12" fill="#ef4444" />
      <rect x="9" y="6" width="3" height="12" fill="#3b82f6" />
      <rect x="13" y="6" width="3" height="12" fill="#eab308" />
      <rect x="17" y="6" width="2" height="12" fill="#a855f7" />
    </svg>
  );
}

/**
 * Office desk with monitor.
 */
export function OfficeIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect width="24" height="24" fill="#4c1d95" rx="1" />
      <rect x="5" y="13" width="14" height="4" fill="#a78bfa" rx="0.5" />
      <rect x="8" y="5" width="8" height="7" fill="#1e1b4b" rx="0.5" />
      <rect x="9" y="6" width="6" height="4" fill="#38bdf8" />
      <rect x="11" y="17" width="2" height="3" fill="#7c3aed" />
    </svg>
  );
}

/**
 * Auditorium stage with seats.
 */
export function AuditoriumIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect width="24" height="24" fill="#831843" rx="1" />
      <rect x="2" y="3" width="20" height="5" fill="#be185d" rx="0.5" />
      <rect x="4" y="11" width="4" height="3" fill="#f472b6" rx="0.5" />
      <rect x="10" y="11" width="4" height="3" fill="#f472b6" rx="0.5" />
      <rect x="16" y="11" width="4" height="3" fill="#f472b6" rx="0.5" />
      <rect x="4" y="16" width="4" height="3" fill="#ec4899" rx="0.5" />
      <rect x="10" y="16" width="4" height="3" fill="#ec4899" rx="0.5" />
      <rect x="16" y="16" width="4" height="3" fill="#ec4899" rx="0.5" />
    </svg>
  );
}

/**
 * School gate arch.
 */
export function GateIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect width="24" height="24" fill="#065f46" rx="1" />
      <rect x="2" y="14" width="20" height="8" fill="#10b981" />
      <path
        d="M4 14 V8 Q12 0 20 8 V14"
        fill="none"
        stroke="#34d399"
        strokeWidth="2.5"
      />
      <rect x="11" y="10" width="2" height="12" fill="#6ee7b7" />
    </svg>
  );
}

/**
 * Obstacle crate / shelf box.
 */
export function ObstacleIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect width="24" height="24" fill="#78350f" rx="1" />
      <rect x="4" y="6" width="16" height="14" fill="#b45309" rx="1" />
      <path d="M4 12h16M12 6v14" stroke="#92400e" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Restricted zone — no entry sign.
 */
export function RestrictedIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect width="24" height="24" fill="#7f1d1d" rx="1" />
      <circle cx="12" cy="12" r="8" fill="#ef4444" />
      <rect x="6" y="10.5" width="12" height="3" fill="#fff" rx="0.5" />
    </svg>
  );
}

/**
 * Single student desk in corridor / classroom.
 */
export function DeskIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect width="24" height="24" fill="#334155" rx="1" />
      <rect x="5" y="10" width="14" height="5" fill="#94a3b8" rx="0.5" />
      <rect x="7" y="15" width="2" height="4" fill="#64748b" />
      <rect x="15" y="15" width="2" height="4" fill="#64748b" />
    </svg>
  );
}

/**
 * Open courtyard / empty floor.
 */
export function EmptyIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <rect width="24" height="24" fill="#1e293b" />
      <circle cx="6" cy="6" r="1" fill="#334155" />
      <circle cx="18" cy="6" r="1" fill="#334155" />
      <circle cx="6" cy="18" r="1" fill="#334155" />
      <circle cx="18" cy="18" r="1" fill="#334155" />
    </svg>
  );
}

export type CellVisualSpec = {
  Icon: FC<IconProps>;
  bgColor: string;
  /** Short emoji fallback for very small cells */
  emoji: string;
};

const TYPE_VISUALS: Record<MapCell["type"], CellVisualSpec> = {
  wall: { Icon: WallIcon, bgColor: "#0f172a", emoji: "🧱" },
  corridor: { Icon: CorridorIcon, bgColor: "#334155", emoji: "🚶" },
  classroom: { Icon: ClassroomIcon, bgColor: "#1e3a5f", emoji: "🏫" },
  staff_room: { Icon: StaffRoomIcon, bgColor: "#312e81", emoji: "👩‍🏫" },
  library: { Icon: LibraryIcon, bgColor: "#14532d", emoji: "📚" },
  office: { Icon: OfficeIcon, bgColor: "#4c1d95", emoji: "🏢" },
  auditorium: { Icon: AuditoriumIcon, bgColor: "#831843", emoji: "🎭" },
  gate: { Icon: GateIcon, bgColor: "#065f46", emoji: "🚪" },
  obstacle: { Icon: ObstacleIcon, bgColor: "#b45309", emoji: "📦" },
  restricted: { Icon: RestrictedIcon, bgColor: "#7f1d1d", emoji: "⛔" },
  empty: { Icon: EmptyIcon, bgColor: "#1e293b", emoji: "⬜" },
};

const LABEL_VISUALS: Record<string, CellVisualSpec> = {
  desk: { Icon: DeskIcon, bgColor: "#475569", emoji: "🪑" },
};

/**
 * Resolves icon and background for a map cell.
 */
export function getCellVisual(cell: MapCell): CellVisualSpec {
  if (cell.labelId && LABEL_VISUALS[cell.labelId]) {
    return LABEL_VISUALS[cell.labelId];
  }
  return TYPE_VISUALS[cell.type] ?? TYPE_VISUALS.empty;
}

/** Legend entries for the visual map key. */
export const MAP_LEGEND_ITEMS: {
  type: MapCell["type"] | "desk";
  labelKey: string;
}[] = [
  { type: "wall", labelKey: "cellType.wall" },
  { type: "corridor", labelKey: "cellType.corridor" },
  { type: "classroom", labelKey: "cellType.classroom" },
  { type: "staff_room", labelKey: "cellType.staff_room" },
  { type: "library", labelKey: "cellType.library" },
  { type: "office", labelKey: "cellType.office" },
  { type: "auditorium", labelKey: "cellType.auditorium" },
  { type: "gate", labelKey: "cellType.gate" },
  { type: "obstacle", labelKey: "cellType.obstacle" },
  { type: "restricted", labelKey: "cellType.restricted" },
  { type: "desk", labelKey: "cellLabel.desk" },
];

/**
 * Returns visual spec for legend item type.
 */
export function getLegendVisual(
  type: MapCell["type"] | "desk"
): CellVisualSpec {
  if (type === "desk") return LABEL_VISUALS.desk;
  return TYPE_VISUALS[type];
}
