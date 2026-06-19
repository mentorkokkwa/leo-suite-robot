export type PresentationAct =
  | "off"
  | "intro"
  | "planning"
  | "navigate"
  | "complete";

export type MapLayerVisibility = {
  regionLabels: boolean;
  startGoal: boolean;
  explored: boolean;
  path: boolean;
  oldPath: boolean;
  trail: boolean;
  nextStep: boolean;
  pathNumbers: boolean;
  agents: boolean;
  robot: boolean;
};

/** Duration of act 1 — campus overview before planning. */
export const INTRO_ACT_MS = 4000;

/**
 * Resolves which map overlays are visible for the current presentation act.
 */
export function getMapLayerVisibility(
  act: PresentationAct,
  options: {
    running: boolean;
    planningPhase: boolean;
  }
): MapLayerVisibility {
  if (act === "off") {
    return {
      regionLabels: true,
      startGoal: true,
      explored: options.planningPhase,
      path: true,
      oldPath: true,
      trail: true,
      nextStep: true,
      pathNumbers: true,
      agents: true,
      robot: true,
    };
  }

  if (act === "intro") {
    return {
      regionLabels: true,
      startGoal: true,
      explored: false,
      path: false,
      oldPath: false,
      trail: false,
      nextStep: false,
      pathNumbers: false,
      agents: false,
      robot: true,
    };
  }

  if (act === "planning") {
    return {
      regionLabels: true,
      startGoal: true,
      explored: true,
      path: true,
      oldPath: false,
      trail: false,
      nextStep: false,
      pathNumbers: false,
      agents: false,
      robot: true,
    };
  }

  if (act === "navigate") {
    return {
      regionLabels: true,
      startGoal: false,
      explored: false,
      path: true,
      oldPath: true,
      trail: true,
      nextStep: true,
      pathNumbers: false,
      agents: true,
      robot: true,
    };
  }

  // complete
  return {
    regionLabels: true,
    startGoal: true,
    explored: false,
    path: false,
    oldPath: false,
    trail: true,
    nextStep: false,
    pathNumbers: false,
    agents: false,
    robot: true,
  };
}

export const PRESENTATION_ACT_ORDER: PresentationAct[] = [
  "intro",
  "planning",
  "navigate",
  "complete",
];

/**
 * Returns i18n key for act title.
 */
export function getActTitleKey(act: PresentationAct): string | null {
  if (act === "off") return null;
  return `simulator.act.${act}.title`;
}

/**
 * Returns i18n key for act description.
 */
export function getActDescKey(act: PresentationAct): string | null {
  if (act === "off") return null;
  return `simulator.act.${act}.desc`;
}
