"use client";

import Link from "next/link";
import { CampusNav } from "@/components/campusbot/CampusNav";
import { useLocale } from "@/contexts/LocaleContext";
import { DEMO_SCENARIOS } from "@/lib/campusbot/scenarios";

/** Icon mapping for each core module. */
const MODULE_ICONS = ["🗺️", "📋", "🧭", "📊"] as const;

/** Value proposition icons. */
const WHY_ICONS = ["🤖", "🎓", "🏫"] as const;

/** Scenario accent colors indexed by position. */
const SCENARIO_COLORS = [
  "border-cyan-700/60 hover:border-cyan-400",
  "border-violet-700/60 hover:border-violet-400",
  "border-emerald-700/60 hover:border-emerald-400",
] as const;

const SCENARIO_BADGE_COLORS = [
  "text-cyan-400",
  "text-violet-400",
  "text-emerald-400",
] as const;

/**
 * CampusBot AI landing page.
 * Targets three audiences: tech demo, school educators, and commercial clients.
 */
export default function CampusBotHomePage() {
  const { t } = useLocale();

  const modules = [
    { icon: MODULE_ICONS[0], title: t("home.moduleMap"), desc: t("home.moduleMapDesc") },
    { icon: MODULE_ICONS[1], title: t("home.moduleTask"), desc: t("home.moduleTaskDesc") },
    { icon: MODULE_ICONS[2], title: t("home.moduleNav"), desc: t("home.moduleNavDesc") },
    { icon: MODULE_ICONS[3], title: t("home.moduleMetrics"), desc: t("home.moduleMetricsDesc") },
  ];

  const whyCards = [
    { icon: WHY_ICONS[0], title: t("home.why1Title"), desc: t("home.why1Desc") },
    { icon: WHY_ICONS[1], title: t("home.why2Title"), desc: t("home.why2Desc") },
    { icon: WHY_ICONS[2], title: t("home.why3Title"), desc: t("home.why3Desc") },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <CampusNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-800 bg-cyan-950/50 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400">
          {t("home.badge")}
        </span>

        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            {t("home.heroTitle")}
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
          {t("home.heroSubtitle")}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/campusbot/simulator"
            className="rounded-lg bg-cyan-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-900/50 transition hover:bg-cyan-500 active:scale-95"
          >
            {t("home.ctaDemo")}
          </Link>
          <Link
            href="/campusbot/experiments"
            className="rounded-lg border border-cyan-700 px-7 py-3 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400 hover:text-white"
          >
            {t("home.ctaTeacher")}
          </Link>
        </div>
      </section>

      {/* ── Why CampusBot AI ──────────────────────────────────────── */}
      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-xl font-bold text-white">{t("home.whyTitle")}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {whyCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-slate-700/60 bg-slate-900 p-6 transition hover:border-cyan-800"
              >
                <span className="text-3xl leading-none">{card.icon}</span>
                <h3 className="mt-4 font-semibold text-cyan-300">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo Scenarios (primary CTA grid) ─────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-xl font-bold text-white">{t("home.scenariosTitle")}</h2>
        <p className="mt-2 text-sm text-slate-400">{t("home.demoScenariosDesc")}</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {DEMO_SCENARIOS.map((s, i) => (
            <Link
              key={s.id}
              href={`/campusbot/simulator?scenario=${s.id}`}
              className={`group flex flex-col justify-between rounded-xl border bg-slate-900/70 p-6 transition ${SCENARIO_COLORS[i]}`}
            >
              <div>
                <span className="font-mono text-xs text-slate-500">
                  Scenario {i + 1}
                </span>
                <h3 className={`mt-1 font-semibold ${SCENARIO_BADGE_COLORS[i]}`}>
                  {t(`scenario.${s.id}.name`).replace(/^场景 \d+：|^Scenario \d+: /, "")}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {t(`scenario.${s.id}.description`)}
                </p>
              </div>
              <p className="mt-5 text-xs font-medium text-amber-400">
                ⚡ {t(`scenario.${s.id}.challenge`)}
              </p>
              <p className="mt-3 text-xs text-slate-500 transition group-hover:text-cyan-400">
                {t("home.openScenario")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Core Modules ──────────────────────────────────────────── */}
      <section className="border-t border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-xl font-bold text-white">{t("home.coreModules")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {modules.map((mod) => (
              <div
                key={mod.title}
                className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <span className="text-2xl leading-none">{mod.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-200">{mod.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
