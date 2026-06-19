"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { MAIN_SCHOOL_MAP, getLocationById, localizeMap } from "@/lib/campusbot/maps";
import { buildNarrativeTimeline } from "@/lib/campusbot/narrativeEvents";
import { getScenarioById } from "@/lib/campusbot/scenarios";
import { saveReport } from "@/lib/campusbot/reportStorage";
import { buildSimulationReport } from "@/lib/campusbot/reportBuilder";
import {
  createInitialMetrics,
  createInitialRobotState,
  planInitialPath,
  prepareMapForScenario,
  runSimulationStep,
  type SimulationContext,
} from "@/lib/campusbot/simulation";
import { getTaskById } from "@/lib/campusbot/tasks";
import type { PresentationAct } from "@/lib/campusbot/presentationActs";
import { INTRO_ACT_MS } from "@/lib/campusbot/presentationActs";
import type {
  CampusMap,
  DecisionLogEntry,
  DynamicAgent,
  PathAlgorithm,
  Point,
  RobotState,
  SimulationMetrics,
  SimulationNarrativeEvent,
} from "@/lib/campusbot/types";

export type SimulationSpeed = "slow" | "normal" | "fast";
export type PlaybackMode = "step" | "auto";

/** Milliseconds between each robot move step in auto mode. */
const SPEED_TICK_MS: Record<SimulationSpeed, number> = {
  slow: 1800,
  normal: 1000,
  fast: 500,
};

/** Slower ticks during staged demo so the audience can follow. */
const STAGED_NAV_TICK_MS = 2200;

/** Pause after path planning so users can see A* exploration and the route. */
const PLANNING_DELAY_MS = 5000;

/** Interval for revealing A* explored cells during planning animation. */
const EXPLORE_REVEAL_MS = 45;

export type SimulationControls = {
  taskId: string;
  scenarioId: string;
  algorithm: PathAlgorithm;
  safetyMode: boolean;
  dynamicObstaclesEnabled: boolean;
  userObstacles: Point[];
  running: boolean;
  paused: boolean;
  planningPhase: boolean;
  speed: SimulationSpeed;
  playbackMode: PlaybackMode;
  stagedDemo: boolean;
};

function buildContext(
  locale: SimulationContext["locale"],
  controls: SimulationControls,
  robot: RobotState,
  metrics: SimulationMetrics,
  log: DecisionLogEntry[],
  dynamicAgents: DynamicAgent[],
  map: CampusMap
): SimulationContext | null {
  const task = getTaskById(controls.taskId);
  if (!task) return null;
  const scenario = getScenarioById(controls.scenarioId);
  const target = getLocationById(map, task.targetLocationId);
  if (!target) return null;

  return {
    locale,
    map,
    task,
    goal: { x: target.x, y: target.y },
    safetyMode: controls.safetyMode,
    dynamicObstaclesEnabled: controls.dynamicObstaclesEnabled,
    dynamicAgents,
    userObstacles: controls.userObstacles,
    crowdedCells: scenario?.crowdedCorridor ?? [],
    robot,
    metrics,
    decisionLog: log,
    algorithm: controls.algorithm,
    paused: controls.paused,
  };
}

/**
 * Client hook driving step-by-step CampusBot simulation.
 */
export function useCampusSimulation() {
  const { locale } = useLocale();
  const [controls, setControls] = useState<SimulationControls>({
    taskId: "guide-visitor",
    scenarioId: "visitor-guide",
    algorithm: "astar",
    safetyMode: true,
    dynamicObstaclesEnabled: true,
    userObstacles: [],
    running: false,
    paused: false,
    planningPhase: false,
    speed: "slow",
    playbackMode: "step",
    stagedDemo: false,
  });

  const [presentationAct, setPresentationAct] = useState<PresentationAct>("off");

  const [robotTrail, setRobotTrail] = useState<Point[]>([]);
  const [exploredCells, setExploredCells] = useState<Point[]>([]);
  const [exploredRevealCount, setExploredRevealCount] = useState(0);
  const [replacedPath, setReplacedPath] = useState<Point[]>([]);
  const [narrativeEvents, setNarrativeEvents] = useState<
    SimulationNarrativeEvent[]
  >([]);

  const [robot, setRobot] = useState<RobotState>(() => {
    const start = getLocationById(MAIN_SCHOOL_MAP, "staff-room");
    return createInitialRobotState(start ?? { x: 2, y: 2 });
  });

  const [metrics, setMetrics] = useState<SimulationMetrics>(createInitialMetrics);
  const [decisionLog, setDecisionLog] = useState<DecisionLogEntry[]>([]);
  const [dynamicAgents, setDynamicAgents] = useState<DynamicAgent[]>([]);
  const [rawMap, setRawMap] = useState(MAIN_SCHOOL_MAP);

  const map = useMemo(() => localizeMap(rawMap, locale), [rawMap, locale]);
  const scenario = useMemo(
    () => getScenarioById(controls.scenarioId),
    [controls.scenarioId]
  );

  const stateRef = useRef({
    locale,
    controls,
    robot,
    metrics,
    decisionLog,
    dynamicAgents,
    rawMap,
  });
  stateRef.current = {
    locale,
    controls,
    robot,
    metrics,
    decisionLog,
    dynamicAgents,
    rawMap,
  };

  const syncNarrative = useCallback((log: DecisionLogEntry[]) => {
    setNarrativeEvents(buildNarrativeTimeline(log));
  }, []);

  const syncScenario = useCallback((scenarioId: string, taskId: string) => {
    const sc = getScenarioById(scenarioId);
    const task = getTaskById(taskId);
    const prepared = prepareMapForScenario(
      MAIN_SCHOOL_MAP,
      sc?.extraObstacles ?? []
    );
    setRawMap(prepared);
    setDynamicAgents(
      sc?.dynamicAgents.map((a) => ({
        ...a,
        pathIndex: 0,
        position: a.path[0],
      })) ?? []
    );
    const start = task
      ? getLocationById(prepared, task.startLocationId)
      : undefined;
    if (start) {
      setRobot(createInitialRobotState(start));
    }
    setRobotTrail([]);
    setExploredCells([]);
    setExploredRevealCount(0);
    setReplacedPath([]);
    setNarrativeEvents([]);
    setPresentationAct("off");
  }, []);

  useEffect(() => {
    syncScenario(controls.scenarioId, controls.taskId);
  }, [controls.scenarioId, controls.taskId, syncScenario]);

  const reset = useCallback(() => {
    setControls((c) => ({
      ...c,
      running: false,
      paused: false,
      planningPhase: false,
      stagedDemo: false,
      userObstacles: [],
    }));
    setPresentationAct("off");
    setMetrics(createInitialMetrics());
    setDecisionLog([]);
    syncScenario(controls.scenarioId, controls.taskId);
  }, [controls.scenarioId, controls.taskId, syncScenario]);

  const applyPlannedMission = useCallback(
    (
      planned: ReturnType<typeof planInitialPath>,
      startLoc: Point,
      locale: SimulationContext["locale"]
    ) => {
      setRobot({
        ...planned.robot,
        status:
          planned.robot.status === "moving" ? "planning" : planned.robot.status,
      });
      setMetrics(planned.metrics);
      setDecisionLog(planned.decisionLog);
      syncNarrative(planned.decisionLog);
      setRobotTrail([{ x: startLoc.x, y: startLoc.y }]);
      setExploredCells(planned.exploredCells);
      setExploredRevealCount(0);
      setReplacedPath([]);

      if (
        planned.robot.status === "failed" ||
        planned.robot.status === "blocked"
      ) {
        setControls((prev) => ({
          ...prev,
          running: false,
          paused: false,
          planningPhase: false,
          stagedDemo: false,
        }));
        setPresentationAct("off");
        saveReport(buildSimulationReport(planned, locale));
        return false;
      }
      return true;
    },
    [syncNarrative]
  );

  const beginPlanning = useCallback(() => {
    const s = stateRef.current;
    const task = getTaskById(s.controls.taskId);
    if (!task) return;
    const startLoc = getLocationById(s.rawMap, task.startLocationId);
    if (!startLoc) return;

    const baseCtx = buildContext(
      s.locale,
      s.controls,
      createInitialRobotState(startLoc),
      createInitialMetrics(),
      [],
      s.dynamicAgents,
      s.rawMap
    );
    if (!baseCtx) return;

    const planned = planInitialPath({
      ...baseCtx,
      robot: { ...createInitialRobotState(startLoc), status: "planning" },
    });

    if (!applyPlannedMission(planned, startLoc, s.locale)) return;

    setPresentationAct("planning");
    setControls((prev) => ({
      ...prev,
      planningPhase: true,
    }));
  }, [applyPlannedMission]);

  const start = useCallback(() => {
    const s = stateRef.current;
    const task = getTaskById(s.controls.taskId);
    if (!task) return;
    const sc = getScenarioById(s.controls.scenarioId);
    const prepared = prepareMapForScenario(
      MAIN_SCHOOL_MAP,
      sc?.extraObstacles ?? []
    );
    const agents =
      sc?.dynamicAgents.map((a) => ({
        ...a,
        pathIndex: 0,
        position: a.path[0],
      })) ?? [];
    const startLoc = getLocationById(prepared, task.startLocationId);
    if (!startLoc) return;

    const initialRobot = createInitialRobotState(startLoc);
    const initialMetrics = createInitialMetrics();
    setRawMap(prepared);
    setDynamicAgents(agents);
    setPresentationAct("off");

    const baseCtx = buildContext(
      s.locale,
      { ...s.controls, running: true, paused: false },
      initialRobot,
      initialMetrics,
      [],
      agents,
      prepared
    );
    if (!baseCtx) return;

    const planned = planInitialPath({
      ...baseCtx,
      robot: { ...initialRobot, status: "planning" },
    });

    if (!applyPlannedMission(planned, startLoc, s.locale)) return;

    setControls((prev) => ({
      ...prev,
      running: true,
      paused: false,
      planningPhase: true,
      stagedDemo: false,
    }));
  }, [applyPlannedMission]);

  const startStagedDemo = useCallback(() => {
    const s = stateRef.current;
    const task = getTaskById(s.controls.taskId);
    if (!task) return;
    const sc = getScenarioById(s.controls.scenarioId);
    const prepared = prepareMapForScenario(
      MAIN_SCHOOL_MAP,
      sc?.extraObstacles ?? []
    );
    const agents =
      sc?.dynamicAgents.map((a) => ({
        ...a,
        pathIndex: 0,
        position: a.path[0],
      })) ?? [];
    const startLoc = getLocationById(prepared, task.startLocationId);
    if (!startLoc) return;

    setRawMap(prepared);
    setDynamicAgents(agents);
    setRobot(createInitialRobotState(startLoc));
    setMetrics(createInitialMetrics());
    setDecisionLog([]);
    setNarrativeEvents([]);
    setRobotTrail([{ x: startLoc.x, y: startLoc.y }]);
    setExploredCells([]);
    setExploredRevealCount(0);
    setReplacedPath([]);

    setPresentationAct("intro");
    setControls((prev) => ({
      ...prev,
      running: true,
      paused: false,
      planningPhase: false,
      stagedDemo: true,
      playbackMode: "auto",
      speed: "slow",
    }));
  }, []);

  const pause = useCallback(() => {
    setControls((c) => ({ ...c, paused: !c.paused }));
  }, []);

  const addObstacle = useCallback((point: Point) => {
    setControls((c) => ({
      ...c,
      userObstacles: [...c.userObstacles, point],
    }));
    setRawMap((m) => {
      const cells = m.cells.map((row) => row.map((cell) => ({ ...cell })));
      if (cells[point.y]?.[point.x]) {
        cells[point.y][point.x] = {
          ...cells[point.y][point.x],
          type: "obstacle",
        };
      }
      return { ...m, cells };
    });
  }, []);

  const applyStepResult = useCallback(
    (next: ReturnType<typeof runSimulationStep>) => {
      setRobot(next.robot);
      setMetrics(next.metrics);
      setDecisionLog(next.decisionLog);
      syncNarrative(next.decisionLog);
      setDynamicAgents(next.dynamicAgents);
      if (next.replacedPath) {
        setReplacedPath(next.replacedPath);
      }
      setRobotTrail((trail) => {
        const last = trail[trail.length - 1];
        const pos = next.robot.position;
        if (last && last.x === pos.x && last.y === pos.y) return trail;
        return [...trail, { x: pos.x, y: pos.y }];
      });
      return next;
    },
    [syncNarrative]
  );

  const tickSimulation = useCallback(() => {
    const s = stateRef.current;
    if (!s.controls.running || s.controls.paused) return null;
    if (
      s.robot.status === "completed" ||
      s.robot.status === "failed" ||
      s.robot.status === "blocked"
    ) {
      setControls((c) => ({ ...c, running: false, planningPhase: false }));
      return null;
    }

    const ctx = buildContext(
      s.locale,
      s.controls,
      s.robot,
      s.metrics,
      s.decisionLog,
      s.dynamicAgents,
      s.rawMap
    );
    if (!ctx) return null;

    const next = runSimulationStep({ ...ctx, paused: false });
    applyStepResult(next);

    if (
      next.robot.status === "completed" ||
      next.robot.status === "failed" ||
      next.robot.status === "blocked"
    ) {
      setControls((c) => ({
        ...c,
        running: false,
        planningPhase: false,
      }));
      if (s.controls.stagedDemo && next.robot.status === "completed") {
        setPresentationAct("complete");
      } else if (s.controls.stagedDemo) {
        setPresentationAct("off");
      }
      saveReport(buildSimulationReport(next, s.locale));
    }

    return next;
  }, [applyStepResult]);

  const stepForward = useCallback(() => {
    tickSimulation();
  }, [tickSimulation]);

  /** Animate A* explored cells during planning phase. */
  useEffect(() => {
    if (!controls.planningPhase || exploredCells.length === 0) return;

    if (exploredRevealCount >= exploredCells.length) return;

    const id = window.setInterval(() => {
      setExploredRevealCount((count) =>
        Math.min(count + 3, exploredCells.length)
      );
    }, EXPLORE_REVEAL_MS);

    return () => window.clearInterval(id);
  }, [controls.planningPhase, exploredCells.length, exploredRevealCount]);

  /** End planning phase after delay, then start movement ticks in auto mode. */
  useEffect(() => {
    if (!controls.running || controls.paused || !controls.planningPhase) return;

    const planningTimer = window.setTimeout(() => {
      setExploredRevealCount(exploredCells.length);
      setRobot((current) =>
        current.status === "planning"
          ? { ...current, status: "moving" }
          : current
      );
      setControls((c) => {
        if (c.stagedDemo) {
          setPresentationAct("navigate");
        }
        return { ...c, planningPhase: false };
      });
    }, PLANNING_DELAY_MS);

    return () => window.clearTimeout(planningTimer);
  }, [
    controls.running,
    controls.paused,
    controls.planningPhase,
    exploredCells.length,
  ]);

  /** Staged demo act 1 → act 2: begin A* planning after campus intro. */
  useEffect(() => {
    if (presentationAct !== "intro" || !controls.running || !controls.stagedDemo) {
      return;
    }

    const introTimer = window.setTimeout(() => {
      beginPlanning();
    }, INTRO_ACT_MS);

    return () => window.clearTimeout(introTimer);
  }, [presentationAct, controls.running, controls.stagedDemo, beginPlanning]);

  /** Auto-play movement ticks when not in step mode. */
  useEffect(() => {
    if (!controls.running || controls.paused || controls.planningPhase) return;
    if (controls.playbackMode === "step") return;

    const tickMs = controls.stagedDemo
      ? STAGED_NAV_TICK_MS
      : SPEED_TICK_MS[controls.speed];
    const id = window.setInterval(tickSimulation, tickMs);
    return () => window.clearInterval(id);
  }, [
    controls.running,
    controls.paused,
    controls.planningPhase,
    controls.speed,
    controls.playbackMode,
    controls.stagedDemo,
    tickSimulation,
  ]);

  const waitingForStep =
    controls.running &&
    !controls.paused &&
    !controls.planningPhase &&
    controls.playbackMode === "step" &&
    !controls.stagedDemo &&
    robot.status !== "completed" &&
    robot.status !== "failed" &&
    robot.status !== "blocked";

  const visibleExplored = exploredCells.slice(0, exploredRevealCount);

  const moveDurationMs = controls.stagedDemo
    ? STAGED_NAV_TICK_MS
    : SPEED_TICK_MS[controls.speed];

  return {
    controls,
    setControls,
    robot,
    metrics,
    decisionLog,
    dynamicAgents,
    robotTrail,
    exploredCells: visibleExplored,
    replacedPath,
    narrativeEvents,
    waitingForStep,
    scenario,
    map,
    presentationAct,
    moveDurationMs,
    reset,
    start,
    startStagedDemo,
    pause,
    stepForward,
    addObstacle,
    syncScenario,
  };
}
