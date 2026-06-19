/** Core data models for CampusBot AI simulation. */

import type { Locale } from "@/lib/i18n/types";

export type Point = { x: number; y: number };

export type CellType =
  | "empty"
  | "wall"
  | "obstacle"
  | "restricted"
  | "corridor"
  | "classroom"
  | "staff_room"
  | "library"
  | "office"
  | "auditorium"
  | "gate";

export type MapCell = {
  x: number;
  y: number;
  type: CellType;
  /** i18n key under cellLabel.* */
  labelId?: string;
  label?: string;
};

export type CampusLocation = {
  id: string;
  name: string;
  x: number;
  y: number;
  type: CellType;
};

export type CampusMap = {
  id: string;
  name: string;
  width: number;
  height: number;
  cells: MapCell[][];
  locations: CampusLocation[];
};

export type TaskPriority = "low" | "medium" | "high";

export type RobotTask = {
  id: string;
  startLocationId: string;
  targetLocationId: string;
  priority: TaskPriority;
  scenarioId?: string;
};

export type RobotStatus =
  | "idle"
  | "planning"
  | "moving"
  | "replanning"
  | "blocked"
  | "completed"
  | "failed";

export type RobotState = {
  position: Point;
  status: RobotStatus;
  currentPath: Point[];
  completedSteps: number;
};

export type SimulationMetrics = {
  pathLength: number;
  timeSteps: number;
  collisionCount: number;
  replanningCount: number;
  restrictedZoneViolations: number;
  success: boolean;
};

export type DecisionLogEntry = {
  timestamp: string;
  robotPosition: Point;
  action: string;
  reasonKey: string;
  reasonParams?: Record<string, string | number | boolean>;
};

export type DynamicAgent = {
  id: string;
  /** i18n key under agent.* */
  labelKey: string;
  position: Point;
  path: Point[];
  pathIndex: number;
};

export type PathAlgorithm = "astar";

export type SimulationScenario = {
  id: string;
  mapId: string;
  taskId: string;
  dynamicAgents: DynamicAgent[];
  extraObstacles?: Point[];
  crowdedCorridor?: Point[];
  /** Optional narrative keys under scenario.{id}.watch.* */
  watchKeys?: string[];
};

/** Plain-language milestone shown during live demo. */
export type SimulationNarrativeEvent = {
  id: string;
  titleKey: string;
  detailKey: string;
  params?: Record<string, string | number | boolean>;
  timestamp: string;
  tone: "info" | "warning" | "success" | "danger";
};

export type SimulationReport = {
  locale: Locale;
  taskId: string;
  startLocationId: string;
  targetLocationId: string;
  algorithmKey: string;
  success: boolean;
  metrics: SimulationMetrics;
  decisionLog: DecisionLogEntry[];
  generatedAt: string;
};

export type SimulationConfig = {
  map: CampusMap;
  task: RobotTask;
  algorithm: PathAlgorithm;
  safetyMode: boolean;
  dynamicObstaclesEnabled: boolean;
  dynamicAgents: DynamicAgent[];
  userObstacles: Point[];
};
