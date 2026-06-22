"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CampusNav } from "@/components/campusbot/CampusNav";
import { useLocale } from "@/contexts/LocaleContext";
import { loadReport } from "@/lib/campusbot/reportStorage";
import { getLocalizedReportSections } from "@/lib/campusbot/reportBuilder";
import type { SimulationReport } from "@/lib/campusbot/types";

export default function ReportPage() {
  const { locale, t } = useLocale();
  const [report, setReport] = useState<SimulationReport | null>(null);

  useEffect(() => {
    setReport(loadReport());
  }, []);

  const sections = useMemo(
    () => (report ? getLocalizedReportSections(report, locale) : null),
    [report, locale]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <CampusNav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-cyan-400">{t("report.title")}</h1>

        {!report || !sections ? (
          <p className="mt-6 text-slate-400">
            {t("report.noReport")}{" "}
            <Link href="/campusbot/simulator" className="text-cyan-400 underline">
              {t("report.simulatorLink")}
            </Link>{" "}
            {t("report.first")}
          </p>
        ) : (
          <article className="mt-8 space-y-6">
            <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-lg font-semibold">{sections.taskName}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {sections.start} → {sections.destination}
              </p>
              <p className="mt-1 font-mono text-xs text-slate-500">
                {t("report.algorithm")}: {sections.algorithm} ·{" "}
                {report.success ? (
                  <span className="text-lime-400">{t("report.success")}</span>
                ) : (
                  <span className="text-red-400">{t("report.failure")}</span>
                )}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500">{t("report.pathLength")}</dt>
                  <dd className="font-mono text-cyan-300">
                    {report.metrics.pathLength}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("report.timeSteps")}</dt>
                  <dd className="font-mono text-cyan-300">
                    {report.metrics.timeSteps}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("report.collisions")}</dt>
                  <dd className="font-mono text-cyan-300">
                    {report.metrics.collisionCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("report.replanning")}</dt>
                  <dd className="font-mono text-cyan-300">
                    {report.metrics.replanningCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">
                    {t("report.restrictedViolations")}
                  </dt>
                  <dd className="font-mono text-cyan-300">
                    {report.metrics.restrictedZoneViolations}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg border border-slate-800 p-5">
              <h3 className="font-semibold text-cyan-300">
                {t("report.decisionSummary")}
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                {sections.decisionSummary.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-lime-900/50 bg-lime-950/20 p-4">
                <h3 className="text-sm font-semibold text-lime-400">
                  {t("report.whatWorked")}
                </h3>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-400">
                  {sections.whatWorked.length
                    ? sections.whatWorked.map((w) => <li key={w}>{w}</li>)
                    : <li>{t("report.none")}</li>}
                </ul>
              </div>
              <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
                <h3 className="text-sm font-semibold text-red-400">
                  {t("report.whatFailed")}
                </h3>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-400">
                  {sections.whatFailed.length
                    ? sections.whatFailed.map((f) => <li key={f}>{f}</li>)
                    : <li>{t("report.none")}</li>}
                </ul>
              </div>
            </section>

            <section className="rounded-lg border border-cyan-900/40 bg-cyan-950/20 p-5">
              <h3 className="font-semibold text-cyan-300">
                {t("report.futureHardware")}
              </h3>
              <p className="mt-2 text-xs text-slate-500">{t("report.futureNote")}</p>
              <ul className="mt-3 list-inside list-disc text-sm text-slate-400">
                {sections.futureImprovements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Demo value callout */}
            <section className="rounded-lg border border-violet-800/50 bg-violet-950/20 p-5">
              <h3 className="font-semibold text-violet-300">
                💡 {t("report.demoValue")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {t("report.demoValueDesc")}
              </p>
            </section>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">
                {t("report.generated")}:{" "}
                {new Date(report.generatedAt).toLocaleString(
                  locale === "zh" ? "zh-CN" : "en-SG"
                )}
              </p>
              <Link
                href="/campusbot/simulator"
                className="rounded bg-cyan-700 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-600"
              >
                {t("report.backToSimulator")}
              </Link>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
