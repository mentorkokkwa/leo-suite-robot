"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCampusSimulation } from "@/hooks/useCampusSimulation";
import { CampusNav } from "./CampusNav";
import { MetricsBar } from "./MetricsBar";
import { MapFloorPlanView } from "./MapFloorPlanView";
import { ControlPanel } from "./ControlPanel";
import { DecisionLogPanel } from "./DecisionLogPanel";
import { MissionBriefingPanel } from "./MissionBriefingPanel";
import { AStarExplainPanel } from "./AStarExplainPanel";
import { RobotSensorPanel } from "./RobotSensorPanel";
import { NarrativeTimeline } from "./NarrativeTimeline";
import { getScenarioById } from "@/lib/campusbot/scenarios";

/**
 * Full robotics control dashboard: map, controls, metrics, decision log.
 */
export function SimulatorDashboard() {
  const searchParams = useSearchParams();
  const sim = useCampusSimulation();
  const [addObstacleMode, setAddObstacleMode] = useState(false);
  const scenario = getScenarioById(sim.controls.scenarioId);
  const sensorActive =
    sim.controls.running &&
    !sim.controls.planningPhase &&
    sim.robot.status !== "idle" &&
    (sim.presentationAct === "navigate" || sim.presentationAct === "off");

  useEffect(() => {
    const scenarioParam = searchParams.get("scenario");
    if (scenarioParam) {
      sim.setControls((c) => ({ ...c, scenarioId: scenarioParam }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply URL scenario once on mount
  }, [searchParams]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-950 text-slate-100 md:h-screen md:overflow-hidden">
      <CampusNav />
      <MetricsBar robot={sim.robot} metrics={sim.metrics} />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:overflow-hidden lg:flex-row">
        <div className="flex min-h-[min(58vh,560px)] min-w-0 flex-1 flex-col lg:min-h-0">
        <MapFloorPlanView
          map={sim.map}
          robot={sim.robot}
          taskId={sim.controls.taskId}
          dynamicAgents={sim.dynamicAgents}
          robotTrail={sim.robotTrail ?? []}
          exploredCells={sim.exploredCells ?? []}
          replacedPath={sim.replacedPath ?? []}
          planningPhase={sim.controls.planningPhase ?? false}
          running={sim.controls.running ?? false}
          presentationAct={sim.presentationAct}
          moveDurationMs={sim.moveDurationMs}
          addObstacleMode={addObstacleMode}
          onAdvanceFromIntro={sim.controls.stagedDemo ? sim.advanceFromIntro : undefined}
          onCellClick={(point) => {
            if (addObstacleMode) {
              sim.addObstacle(point);
            }
          }}
        />
        </div>

        <aside className="flex w-full min-h-0 shrink-0 flex-col gap-2 overflow-y-auto border-t border-cyan-900/40 bg-slate-900/40 p-3 text-sm lg:w-72 lg:border-l lg:border-t-0">
          {!sim.controls.running && (
            <MissionBriefingPanel
              scenario={sim.scenario}
              taskId={sim.controls.taskId}
              running={sim.controls.running}
            />
          )}
          {sim.controls.running && sim.controls.planningPhase && (
            <AStarExplainPanel
              exploredCount={sim.exploredCells?.length ?? 0}
              pathCells={sim.robot.currentPath.length}
              planningPhase={sim.controls.planningPhase}
              safetyMode={sim.controls.safetyMode}
            />
          )}
          <ControlPanel
            controls={sim.controls}
            waitingForStep={sim.waitingForStep}
            onChange={(patch) =>
              sim.setControls((c) => ({ ...c, ...patch }))
            }
            onStart={sim.start}
            onStartStagedDemo={sim.startStagedDemo}
            onPause={sim.pause}
            onReset={sim.reset}
            onStepForward={sim.stepForward}
            addObstacleMode={addObstacleMode}
            onToggleAddObstacle={() => setAddObstacleMode((v) => !v)}
            onRunExperiment={() => {
              sim.reset();
              setTimeout(() => sim.start(), 50);
            }}
          />
          <RobotSensorPanel
            map={sim.map}
            robotPosition={sim.robot.position}
            dynamicAgents={sim.dynamicAgents}
            safetyMode={sim.controls.safetyMode}
            crowdedCells={scenario?.crowdedCorridor ?? []}
            active={sensorActive}
          />
          <NarrativeTimeline events={sim.narrativeEvents} />
        </aside>
      </div>

      <DecisionLogPanel
        entries={sim.decisionLog}
        showReportLink={
          sim.robot.status === "completed" ||
          sim.robot.status === "failed" ||
          sim.robot.status === "blocked"
        }
      />
    </div>
  );
}
