import type { SimulationScenario } from "./types";

/** Three demo scenarios with distinct navigation challenges. */
export const DEMO_SCENARIOS: SimulationScenario[] = [
  {
    id: "worksheet-delivery",
    mapId: "school-main",
    taskId: "deliver-worksheet",
    watchKeys: ["astar", "studentBlock", "replan"],
    dynamicAgents: [
      {
        id: "student-1",
        labelKey: "student",
        position: { x: 11, y: 7 },
        path: [
          { x: 11, y: 7 },
          { x: 11, y: 8 },
          { x: 11, y: 9 },
          { x: 11, y: 8 },
          { x: 11, y: 7 },
        ],
        pathIndex: 0,
      },
      {
        id: "student-2",
        labelKey: "student",
        position: { x: 9, y: 9 },
        path: [
          { x: 9, y: 9 },
          { x: 10, y: 9 },
          { x: 11, y: 9 },
          { x: 10, y: 9 },
          { x: 9, y: 9 },
        ],
        pathIndex: 0,
      },
    ],
  },
  {
    id: "visitor-guide",
    mapId: "school-main",
    taskId: "guide-visitor",
    watchKeys: ["restricted", "crowd", "replan"],
    dynamicAgents: [
      {
        id: "visitor-group",
        labelKey: "crowd",
        position: { x: 11, y: 16 },
        path: [
          { x: 11, y: 16 },
          { x: 10, y: 16 },
          { x: 9, y: 16 },
          { x: 10, y: 16 },
          { x: 11, y: 16 },
        ],
        pathIndex: 0,
      },
      {
        id: "student-2",
        labelKey: "student",
        position: { x: 8, y: 14 },
        path: [
          { x: 8, y: 14 },
          { x: 9, y: 14 },
          { x: 10, y: 14 },
          { x: 9, y: 14 },
          { x: 8, y: 14 },
        ],
        pathIndex: 0,
      },
      {
        id: "teacher-1",
        labelKey: "teacher",
        position: { x: 11, y: 12 },
        path: [
          { x: 11, y: 12 },
          { x: 11, y: 13 },
          { x: 11, y: 12 },
        ],
        pathIndex: 0,
      },
    ],
    crowdedCorridor: [
      { x: 11, y: 15 },
      { x: 11, y: 16 },
      { x: 10, y: 16 },
      { x: 9, y: 16 },
    ],
  },
  {
    id: "library-return",
    mapId: "school-main",
    taskId: "return-book",
    watchKeys: ["narrow", "staticObstacle", "sensor"],
    dynamicAgents: [
      {
        id: "library-patron",
        labelKey: "patron",
        position: { x: 19, y: 4 },
        path: [
          { x: 19, y: 4 },
          { x: 18, y: 4 },
          { x: 19, y: 4 },
        ],
        pathIndex: 0,
      },
    ],
    extraObstacles: [
      { x: 19, y: 3 },
      { x: 18, y: 4 },
      { x: 19, y: 4 },
      { x: 20, y: 4 },
      { x: 19, y: 5 },
    ],
  },
];

export function getScenarioById(id: string): SimulationScenario | undefined {
  return DEMO_SCENARIOS.find((s) => s.id === id);
}
