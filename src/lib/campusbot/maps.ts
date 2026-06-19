import { buildMapFromLayout } from "./mapBuilder";
import type { CampusLocation, CampusMap } from "./types";
import type { Locale } from "@/lib/i18n/types";
import { locationName, t } from "@/lib/i18n";

const SCHOOL_LAYOUT = [
  "########################",
  "#SS..####....####..LL..#",
  "#SS...CC#...#CC#...LL..#",
  "#.....CC#...#CC#......#",
  "#....####..RR..####....#",
  "#..............RR......#",
  "#....####......####....#",
  "#.....CC#.....#CC#....#",
  "#.....CC#..OOOO.#CC#...#",
  "#....####......####....#",
  "#..............FF......#",
  "#....####......####....#",
  "#.....AA#.....#AA#....#",
  "#.....AA#.....#AA#....#",
  "#....####......####....#",
  "#......................#",
  "#....####......####....#",
  "#.....CC#.....#CC#....#",
  "#.....CC#.....#CC#....#",
  "#....####......####....#",
  "#......................#",
  "#.........GG...........#",
  "########################",
];

const base = buildMapFromLayout("school-main", "school-main", SCHOOL_LAYOUT, {
  "2,1": { labelId: "staff-room" },
  "7,1": { labelId: "class-4a" },
  "15,1": { labelId: "class-4b" },
  "20,1": { labelId: "library" },
  "10,5": { labelId: "restricted-admin" },
  "11,5": { labelId: "restricted-admin" },
  "10,6": { labelId: "restricted-zone" },
  "11,6": { labelId: "restricted-zone" },
  "9,8": { labelId: "desk" },
  "10,8": { labelId: "desk" },
  "11,8": { labelId: "desk" },
  "12,8": { labelId: "desk" },
  "10,10": { labelId: "general-office" },
  "11,10": { labelId: "general-office" },
  "6,12": { labelId: "auditorium" },
  "7,12": { labelId: "auditorium" },
  "11,21": { labelId: "school-gate" },
});

const locations: CampusLocation[] = [
  { id: "staff-room", name: "staff-room", x: 2, y: 2, type: "staff_room" },
  { id: "classroom-4a", name: "classroom-4a", x: 7, y: 2, type: "classroom" },
  { id: "classroom-4b", name: "classroom-4b", x: 15, y: 2, type: "classroom" },
  { id: "library-counter", name: "library-counter", x: 20, y: 2, type: "library" },
  { id: "library-shelf", name: "library-shelf", x: 20, y: 6, type: "library" },
  { id: "general-office", name: "general-office", x: 15, y: 10, type: "office" },
  { id: "auditorium", name: "auditorium", x: 7, y: 12, type: "auditorium" },
  { id: "school-gate", name: "school-gate", x: 11, y: 21, type: "gate" },
  { id: "corridor-mid", name: "corridor-mid", x: 11, y: 9, type: "corridor" },
];

export const MAIN_SCHOOL_MAP: CampusMap = {
  ...base,
  locations,
};

export const CAMPUS_MAPS: CampusMap[] = [MAIN_SCHOOL_MAP];

/**
 * Applies locale-specific labels to map cells and locations.
 */
export function localizeMap(map: CampusMap, locale: Locale): CampusMap {
  return {
    ...map,
    name: t(locale, `map.${map.id}`),
    locations: map.locations.map((loc) => ({
      ...loc,
      name: locationName(locale, loc.id),
    })),
    cells: map.cells.map((row) =>
      row.map((cell) => ({
        ...cell,
        label: cell.labelId
          ? t(locale, `cellLabel.${cell.labelId}`)
          : cell.label,
      }))
    ),
  };
}

export function getMapById(id: string): CampusMap | undefined {
  return CAMPUS_MAPS.find((m) => m.id === id);
}

export function getLocationById(
  map: CampusMap,
  locationId: string
): CampusLocation | undefined {
  return map.locations.find((l) => l.id === locationId);
}
