import { Suspense } from "react";
import { SimulatorDashboard } from "@/components/campusbot/SimulatorDashboard";
import { SimulatorLoading } from "@/components/campusbot/SimulatorLoading";

export default function SimulatorPage() {
  return (
    <Suspense fallback={<SimulatorLoading />}>
      <SimulatorDashboard />
    </Suspense>
  );
}
