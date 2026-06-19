import type { RobotTask } from "./types";

export const ROBOT_TASKS: RobotTask[] = [
  {
    id: "deliver-worksheet",
    startLocationId: "staff-room",
    targetLocationId: "classroom-4a",
    priority: "high",
    scenarioId: "worksheet-delivery",
  },
  {
    id: "guide-visitor",
    startLocationId: "school-gate",
    targetLocationId: "auditorium",
    priority: "medium",
    scenarioId: "visitor-guide",
  },
  {
    id: "return-book",
    startLocationId: "library-counter",
    targetLocationId: "library-shelf",
    priority: "low",
    scenarioId: "library-return",
  },
  {
    id: "deliver-document",
    startLocationId: "general-office",
    targetLocationId: "staff-room",
    priority: "medium",
  },
];

export function getTaskById(id: string): RobotTask | undefined {
  return ROBOT_TASKS.find((task) => task.id === id);
}
