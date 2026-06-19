"use client";

import Link from "next/link";
import { CampusNav } from "@/components/campusbot/CampusNav";
import { useLocale } from "@/contexts/LocaleContext";
import { DEMO_SCENARIOS } from "@/lib/campusbot/scenarios";

export default function CampusBotHomePage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <CampusNav />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold text-cyan-400">{t("brand")}</h1>
        <p className="mt-3 text-slate-300">{t("home.tagline")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/campusbot/simulator"
            className="rounded-lg border border-cyan-800 bg-cyan-950/40 p-6 transition hover:border-cyan-500"
          >
            <h2 className="font-semibold text-cyan-300">
              {t("home.launchSimulator")}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {t("home.launchSimulatorDesc")}
            </p>
          </Link>
          <Link
            href="/campusbot/experiments"
            className="rounded-lg border border-slate-700 bg-slate-900/60 p-6 transition hover:border-cyan-700"
          >
            <h2 className="font-semibold text-cyan-300">
              {t("home.demoScenarios")}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {t("home.demoScenariosDesc")}
            </p>
          </Link>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">
            {t("home.coreModules")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <strong className="text-slate-200">{t("home.moduleMap")}</strong>{" "}
              — {t("home.moduleMapDesc")}
            </li>
            <li>
              <strong className="text-slate-200">{t("home.moduleTask")}</strong>{" "}
              — {t("home.moduleTaskDesc")}
            </li>
            <li>
              <strong className="text-slate-200">{t("home.moduleNav")}</strong>{" "}
              — {t("home.moduleNavDesc")}
            </li>
            <li>
              <strong className="text-slate-200">
                {t("home.moduleMetrics")}
              </strong>{" "}
              — {t("home.moduleMetricsDesc")}
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">
            {t("home.scenariosTitle")}
          </h2>
          <ul className="mt-3 space-y-3">
            {DEMO_SCENARIOS.map((s) => (
              <li
                key={s.id}
                className="rounded border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm"
              >
                <span className="font-medium text-cyan-300">
                  {t(`scenario.${s.id}.name`)}
                </span>
                <p className="text-slate-400">
                  {t("home.challenge")}: {t(`scenario.${s.id}.challenge`)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
