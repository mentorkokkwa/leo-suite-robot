import { applyObstaclesToMap } from "./mapBuilder";
import { getLocationById } from "./maps";
import {
  detectObstacleAhead,
  findPathAStarDetailed,
  replanPath,
} from "./pathfinding";
import type { Locale } from "@/lib/i18n/types";
import type {
  CampusMap,
  DecisionLogEntry,
  DynamicAgent,
  Point,
  RobotState,
  RobotTask,
  SimulationMetrics,
} from "./types";

export function pointKey(p: Point): string {
  return `${p.x},${p.y}`;
}

/**
 * Builds blocked cell set from dynamic agents and user-placed obstacles.
 */
export function getBlockedCells(
  dynamicAgents: DynamicAgent[],
  userObstacles: Point[],
  crowdedCells: Point[] = []
): Set<string> {
  const blocked = new Set<string>();
  for (const agent of dynamicAgents) {
    blocked.add(pointKey(agent.position));
  }
  for (const o of userObstacles) {
    blocked.add(pointKey(o));
  }
  for (const c of crowdedCells) {
    blocked.add(pointKey(c));
  }
  return blocked;
}

/**
 * Advances dynamic agents along their patrol paths.
 */
export function advanceDynamicAgents(
  agents: DynamicAgent[]
): DynamicAgent[] {
  return agents.map((agent) => {
    const nextIndex = (agent.pathIndex + 1) % agent.path.length;
    return {
      ...agent,
      pathIndex: nextIndex,
      position: agent.path[nextIndex],
    };
  });
}

export function createInitialRobotState(start: Point): RobotState {
  return {
    position: { ...start },
    status: "idle",
    currentPath: [],
    completedSteps: 0,
  };
}

export type SimulationContext = {
  locale: Locale;
  map: CampusMap;
  task: RobotTask;
  goal: Point;
  safetyMode: boolean;
  dynamicObstaclesEnabled: boolean;
  dynamicAgents: DynamicAgent[];
  userObstacles: Point[];
  crowdedCells: Point[];
  robot: RobotState;
  metrics: SimulationMetrics;
  decisionLog: DecisionLogEntry[];
  algorithm: string;
  paused: boolean;
};

export function createInitialMetrics(): SimulationMetrics {
  return {
    pathLength: 0,
    timeSteps: 0,
    collisionCount: 0,
    replanningCount: 0,
    restrictedZoneViolations: 0,
    success: false,
  };
}

function logDecision(
  log: DecisionLogEntry[],
  position: Point,
  action: string,
  reasonKey: string,
  reasonParams?: Record<string, string | number | boolean>
): DecisionLogEntry[] {
  return [
    ...log,
    {
      timestamp: new Date().toISOString(),
      robotPosition: { ...position },
      action,
      reasonKey,
      reasonParams,
    },
  ];
}

export type PlanPathResult = SimulationContext & {
  exploredCells: Point[];
};

/**
 * Plans initial path from start to goal.
 */
export function planInitialPath(ctx: SimulationContext): PlanPathResult {
  const startLoc = getLocationById(ctx.map, ctx.task.startLocationId);
  const targetLoc = getLocationById(ctx.map, ctx.task.targetLocationId);
  if (!startLoc || !targetLoc) {
    return {
      ...ctx,
      exploredCells: [],
      robot: { ...ctx.robot, status: "failed" },
      decisionLog: logDecision(
        ctx.decisionLog,
        ctx.robot.position,
        "PLAN_FAILED",
        "invalidLocation"
      ),
    };
  }

  const blocked = getBlockedCells(
    ctx.dynamicObstaclesEnabled ? ctx.dynamicAgents : [],
    ctx.userObstacles,
    ctx.safetyMode ? ctx.crowdedCells : []
  );

  const search = findPathAStarDetailed(
    ctx.map,
    startLoc,
    targetLoc,
    ctx.safetyMode,
    blocked
  );
  const path = search.path;

  if (path.length === 0) {
    return {
      ...ctx,
      exploredCells: search.explored,
      robot: {
        position: { x: startLoc.x, y: startLoc.y },
        status: "failed",
        currentPath: [],
        completedSteps: 0,
      },
      decisionLog: logDecision(
        ctx.decisionLog,
        { x: startLoc.x, y: startLoc.y },
        "NO_PATH",
        "noPathToTarget"
      ),
    };
  }

  return {
    ...ctx,
    exploredCells: search.explored,
    robot: {
      position: path[0],
      status: "moving",
      currentPath: path,
      completedSteps: 0,
    },
    metrics: {
      ...ctx.metrics,
      pathLength: path.length - 1,
    },
    decisionLog: logDecision(
      ctx.decisionLog,
      path[0],
      "PATH_PLANNED",
      "pathPlanned",
      {
        steps: path.length - 1,
        safetyMode: ctx.safetyMode,
      }
    ),
  };
}

export type StepResult = SimulationContext & {
  replacedPath?: Point[];
};

/**
 * Executes one simulation tick: move robot, check collisions, re-plan if needed.
 */
export function runSimulationStep(ctx: SimulationContext): StepResult {
  if (ctx.paused || ctx.robot.status === "completed" || ctx.robot.status === "failed") {
    return ctx;
  }

  const map = ctx.map;
  let agents = ctx.dynamicAgents;
  const metrics = { ...ctx.metrics, timeSteps: ctx.metrics.timeSteps + 1 };
  let log = ctx.decisionLog;
  const robot = { ...ctx.robot };

  if (ctx.dynamicObstaclesEnabled) {
    agents = advanceDynamicAgents(agents);
  }

  const blocked = getBlockedCells(
    ctx.dynamicObstaclesEnabled ? agents : [],
    ctx.userObstacles,
    ctx.safetyMode ? ctx.crowdedCells : []
  );

  if (robot.status === "idle" || robot.currentPath.length === 0) {
    return { ...ctx, dynamicAgents: agents, metrics, decisionLog: log, robot };
  }

  const goal = ctx.goal;
  const atGoal =
    robot.position.x === goal.x && robot.position.y === goal.y;

  if (atGoal) {
    return {
      ...ctx,
      dynamicAgents: agents,
      robot: { ...robot, status: "completed", currentPath: [] },
      metrics: { ...metrics, success: true },
      decisionLog: logDecision(
        log,
        robot.position,
        "TASK_COMPLETE",
        "reachedDestination",
        { taskId: ctx.task.id }
      ),
    };
  }

  const nextCell = robot.currentPath[1];
  if (!nextCell) {
    return {
      ...ctx,
      dynamicAgents: agents,
      robot: { ...robot, status: "failed" },
      decisionLog: logDecision(log, robot.position, "STUCK", "stuckEmptyPath"),
    };
  }

  const restrictedHit =
    ctx.map.cells[nextCell.y]?.[nextCell.x]?.type === "restricted";
  if (restrictedHit && ctx.safetyMode) {
    metrics.restrictedZoneViolations += 1;
    log = logDecision(
      log,
      robot.position,
      "SAFETY_WARNING",
      "restrictedReplan"
    );
  }

  const obstacleBlocked = detectObstacleAhead(
    robot.position,
    robot.currentPath,
    map,
    ctx.safetyMode,
    blocked
  );

  if (obstacleBlocked || blocked.has(pointKey(nextCell))) {
    metrics.replanningCount += 1;
    robot.status = "replanning";
    const oldPath = [...robot.currentPath];
    const newPath = replanPath(
      robot.position,
      map,
      goal,
      ctx.safetyMode,
      blocked
    );

    if (newPath.length === 0) {
      return {
        ...ctx,
        dynamicAgents: agents,
        robot: { ...robot, status: "blocked" },
        metrics,
        decisionLog: logDecision(
          log,
          robot.position,
          "BLOCKED",
          "blockedNoRoute"
        ),
      };
    }

    log = logDecision(
      log,
      robot.position,
      "REPLAN",
      "replanAt",
      {
        x: nextCell.x,
        y: nextCell.y,
        length: newPath.length - 1,
      }
    );
    robot.status = "moving";
    robot.currentPath = newPath;
    metrics.pathLength += Math.max(0, newPath.length - 1);

    return {
      ...ctx,
      map,
      dynamicAgents: agents,
      robot,
      metrics,
      decisionLog: log,
      replacedPath: oldPath,
    };
  }

  const moveTarget = robot.currentPath[1];
  if (!moveTarget) {
    return { ...ctx, dynamicAgents: agents, robot, metrics, decisionLog: log };
  }
  if (blocked.has(pointKey(moveTarget))) {
    metrics.collisionCount += 1;
    log = logDecision(
      log,
      robot.position,
      "COLLISION_AVOIDED",
      "waitingAt",
      { x: moveTarget.x, y: moveTarget.y }
    );
    return {
      ...ctx,
      dynamicAgents: agents,
      robot: { ...robot, status: "replanning" },
      metrics,
      decisionLog: log,
    };
  }

  robot.position = { ...moveTarget };
  robot.currentPath = robot.currentPath.slice(1);
  robot.completedSteps += 1;
  robot.status = "moving";

  log = logDecision(
    log,
    robot.position,
    "MOVE",
    "moveStep",
    {
      step: robot.completedSteps,
      x: robot.position.x,
      y: robot.position.y,
    }
  );

  const reached =
    robot.position.x === goal.x && robot.position.y === goal.y;

  if (reached) {
    metrics.success = true;
    robot.status = "completed";
    log = logDecision(
      log,
      robot.position,
      "TASK_COMPLETE",
      "taskCompleted",
      { taskId: ctx.task.id }
    );
  }

  return {
    ...ctx,
    map,
    dynamicAgents: agents,
    robot,
    metrics,
    decisionLog: log,
  };
}

/**
 * Computes final metrics from simulation state.
 */
export function calculateMetrics(ctx: SimulationContext): SimulationMetrics {
  const success =
    ctx.robot.status === "completed" &&
    ctx.robot.position.x === ctx.goal.x &&
    ctx.robot.position.y === ctx.goal.y;
  return {
    ...ctx.metrics,
    success,
    pathLength: ctx.robot.completedSteps || ctx.metrics.pathLength,
  };
}

/**
 * Prepares map with scenario-specific static obstacles.
 */
export function prepareMapForScenario(
  baseMap: CampusMap,
  extraObstacles: Point[] = []
): CampusMap {
  if (extraObstacles.length === 0) return baseMap;
  return applyObstaclesToMap(baseMap, extraObstacles);
}
