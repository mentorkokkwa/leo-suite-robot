"use client";

import { useLocale } from "@/contexts/LocaleContext";
import type { PresentationAct } from "@/lib/campusbot/presentationActs";
import {
  getActDescKey,
  getActTitleKey,
  PRESENTATION_ACT_ORDER,
} from "@/lib/campusbot/presentationActs";

type PresentationActBannerProps = {
  act: PresentationAct;
};

const ACT_INDEX: Record<PresentationAct, number> = {
  off: -1,
  intro: 0,
  planning: 1,
  navigate: 2,
  complete: 3,
};

/**
 * Shows current staged-demo act title and progress dots.
 */
export function PresentationActBanner({ act }: PresentationActBannerProps) {
  const { t } = useLocale();
  if (act === "off") return null;

  const titleKey = getActTitleKey(act);
  const descKey = getActDescKey(act);
  const current = ACT_INDEX[act];

  return (
    <div className="rounded-lg border border-violet-500/40 bg-gradient-to-r from-violet-950/80 to-indigo-950/60 px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300">
            {t("simulator.stagedDemo")} · {t("simulator.actProgress", {
              current: current + 1,
              total: PRESENTATION_ACT_ORDER.length,
            })}
          </p>
          {titleKey && (
            <p className="mt-0.5 text-sm font-semibold text-white">
              {t(titleKey)}
            </p>
          )}
          {descKey && (
            <p className="mt-1 text-xs text-violet-200/80">{t(descKey)}</p>
          )}
        </div>
        <div className="flex gap-1.5">
          {PRESENTATION_ACT_ORDER.map((step, index) => (
            <span
              key={step}
              className={`h-2 w-8 rounded-full transition-colors ${
                index < current
                  ? "bg-violet-400"
                  : index === current
                    ? "bg-violet-300 ring-2 ring-violet-400/50"
                    : "bg-slate-700"
              }`}
              title={t(getActTitleKey(step) ?? "")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
