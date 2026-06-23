"use client";

import { useLocale } from "@/contexts/LocaleContext";

/**
 * SVG flowchart of the CampusBot navigation algorithm (portfolio evidence).
 */
export function AlgorithmFlowDiagram() {
  const { t } = useLocale();

  const steps = [
    { id: "task", x: 20, color: "#22d3ee" },
    { id: "map", x: 120, color: "#818cf8" },
    { id: "astar", x: 220, color: "#34d399" },
    { id: "sim", x: 320, color: "#fbbf24" },
    { id: "replan", x: 420, color: "#fb7185" },
    { id: "metrics", x: 520, color: "#a78bfa" },
  ] as const;

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
      <h2 className="text-lg font-bold text-white">{t("home.algorithmFlow.title")}</h2>
      <p className="mt-1 text-sm text-slate-400">{t("home.algorithmFlow.subtitle")}</p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-4">
        <svg
          viewBox="0 0 620 120"
          className="mx-auto min-w-[560px] max-w-full"
          role="img"
          aria-label={t("home.algorithmFlow.title")}
        >
          {steps.map((step, i) => (
            <g key={step.id}>
              <rect
                x={step.x}
                y={36}
                width={88}
                height={48}
                rx={8}
                fill={step.color}
                fillOpacity={0.15}
                stroke={step.color}
                strokeWidth={1.5}
              />
              <text
                x={step.x + 44}
                y={64}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize={10}
                fontWeight={600}
              >
                {t(`home.algorithmFlow.steps.${step.id}`)}
              </text>
              {i < steps.length - 1 ? (
                <path
                  d={`M ${step.x + 88} 60 L ${steps[i + 1].x} 60`}
                  stroke="#475569"
                  strokeWidth={2}
                  markerEnd="url(#arrow)"
                />
              ) : null}
            </g>
          ))}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#64748b" />
            </marker>
          </defs>
          <path
            d="M 464 84 Q 380 108 276 84"
            fill="none"
            stroke="#fb7185"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            markerEnd="url(#arrow)"
          />
          <text x={370} y={108} fill="#94a3b8" fontSize={9} textAnchor="middle">
            {t("home.algorithmFlow.replanLoop")}
          </text>
        </svg>
      </div>
    </section>
  );
}
