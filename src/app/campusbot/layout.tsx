import type { Metadata } from "next";
import { LocaleProvider } from "@/contexts/LocaleContext";

export const metadata: Metadata = {
  title: "CampusBot AI | School Service Robot Simulator",
  description:
    "Campus service robot navigation and task execution simulator for school scenarios.",
};

export default function CampusBotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
