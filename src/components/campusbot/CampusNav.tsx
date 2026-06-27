"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/contexts/LocaleContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

const LINKS = [
  { href: "/campusbot", labelKey: "nav.home" },
  { href: "/campusbot/simulator", labelKey: "nav.simulator" },
  { href: "/campusbot/maps", labelKey: "nav.maps" },
  { href: "/campusbot/tasks", labelKey: "nav.tasks" },
  { href: "/campusbot/experiments", labelKey: "nav.experiments" },
  { href: "/campusbot/report", labelKey: "nav.report" },
] as const;

/**
 * Top navigation for CampusBot AI dashboard pages.
 */
export function CampusNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-cyan-900/50 bg-slate-950 px-3 py-2 sm:px-4">
      <span className="mr-2 w-full font-mono text-sm font-bold tracking-wider text-cyan-400 sm:mr-4 sm:w-auto">
        {t("brand")}
      </span>
      {LINKS.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/campusbot" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
            }`}
          >
            {t(link.labelKey)}
          </Link>
        );
      })}
      <LanguageSwitcher />
    </nav>
  );
}
