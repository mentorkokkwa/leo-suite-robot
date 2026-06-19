import type { CampusMap, DynamicAgent, MapCell, Point } from "./types";
import { getBlockedCells } from "./simulation";

export type SensorCell = {
  x: number;
  y: number;
  type: MapCell["type"] | "agent" | "unknown";
  blocked: boolean;
  inRange: boolean;
};

const SENSOR_RADIUS = 2;

/**
 * Builds a local obstacle view around the robot (simulated LIDAR / proximity grid).
 */
export function buildRobotSensorView(
  map: CampusMap,
  robotPosition: Point,
  dynamicAgents: DynamicAgent[],
  safetyMode: boolean,
  crowdedCells: Point[] = []
): SensorCell[] {
  const blocked = getBlockedCells(dynamicAgents, [], crowdedCells);
  const cells: SensorCell[] = [];

  for (let dy = -SENSOR_RADIUS; dy <= SENSOR_RADIUS; dy++) {
    for (let dx = -SENSOR_RADIUS; dx <= SENSOR_RADIUS; dx++) {
      const x = robotPosition.x + dx;
      const y = robotPosition.y + dy;
      const inBounds = x >= 0 && y >= 0 && x < map.width && y < map.height;
      if (!inBounds) {
        cells.push({
          x,
          y,
          type: "unknown",
          blocked: true,
          inRange: false,
        });
        continue;
      }
      const cell = map.cells[y][x];
      const key = `${x},${y}`;
      const agentHere = dynamicAgents.some(
        (a) => a.position.x === x && a.position.y === y
      );
      const isRestricted =
        safetyMode && cell.type === "restricted";
      const isBlocked =
        cell.type === "wall" ||
        cell.type === "obstacle" ||
        blocked.has(key) ||
        agentHere ||
        isRestricted;

      cells.push({
        x,
        y,
        type: agentHere ? "agent" : cell.type,
        blocked: isBlocked,
        inRange: true,
      });
    }
  }

  return cells;
}

export const ROBOT_SENSOR_RADIUS = SENSOR_RADIUS;
