"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { TopBar } from "@/components/TopBar";
import { formatCurrency, formatNumber } from "@/lib/format";

interface VehicleRoi {
  id: string;
  name: string;
  region: string;
  roi: number;
  operationalCost: number;
}

interface AnalyticsResponse {
  activeFleet: number;
  maintenanceAlerts: number;
  utilizationRate: number;
  pendingCargo: number;
  fuelEfficiency: number;
  vehicleRoi: VehicleRoi[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const response = await fetch("/api/analytics");
      const data = await response.json();
      setAnalytics(data);
    };

    loadAnalytics();
  }, []);

  const csvData = useMemo(() => {
    if (!analytics) {
      return "";
    }
    const rows = ["Vehicle,Region,ROI,OperationalCost"];
    analytics.vehicleRoi.forEach((vehicle) => {
      rows.push(`${vehicle.name},${vehicle.region},${vehicle.roi},${vehicle.operationalCost}`);
    });
    return rows.join("\n");
  }, [analytics]);

  const downloadCsv = () => {
    if (!csvData) {
      return;
    }
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fleetflow-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8">
      <TopBar title="Operational Analytics" subtitle="Fuel efficiency, utilization, and ROI signals." />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fuel Efficiency" value={analytics ? `${analytics.fuelEfficiency} km/L` : "--"} />
        <StatCard
          label="Utilization"
          value={analytics ? `${analytics.utilizationRate}%` : "--"}
          hint="Active fleet share"
        />
        <StatCard label="Active Fleet" value={analytics ? formatNumber(analytics.activeFleet) : "--"} />
        <StatCard label="Maintenance Alerts" value={analytics ? formatNumber(analytics.maintenanceAlerts) : "--"} />
      </section>

      <section className="card rounded-[28px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionHeader title="Vehicle ROI" description="Compare operational cost vs revenue." />
          <button
            className="rounded-full border border-[color:var(--border)] px-4 py-2 text-xs uppercase tracking-[0.2em]"
            onClick={downloadCsv}
          >
            Export CSV
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {analytics?.vehicleRoi.map((vehicle) => (
            <div key={vehicle.id} className="rounded-2xl border border-[color:var(--border)] p-4">
              <p className="text-sm font-semibold text-[color:var(--ink)]">{vehicle.name}</p>
              <p className="text-xs text-[color:var(--muted)]">{vehicle.region} region</p>
              <div className="mt-3">
                <p className="text-sm text-[color:var(--muted)]">ROI</p>
                <p className="text-2xl font-semibold text-[color:var(--ink)]">{vehicle.roi}</p>
              </div>
              <p className="mt-2 text-xs text-[color:var(--muted)]">
                Operational cost: {formatCurrency(vehicle.operationalCost)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
