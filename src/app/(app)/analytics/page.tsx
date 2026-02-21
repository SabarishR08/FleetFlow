"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { ExportButton } from "@/components/ExportButton";
import { TopBar } from "@/components/TopBar";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useRole } from "@/lib/role-context";
import { useRealTime } from "@/hooks/useRealTime";
import { useOfflineSync, cacheAPIResponse, getCachedData } from "@/hooks/useOfflineSync";

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
  const { role } = useRole();
  const { isOnline } = useOfflineSync();

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      const data = await response.json();
      
      // Cache for offline use
      await cacheAPIResponse("analytics", [data]);
      setAnalytics(data);
    } catch (error) {
      // Fall back to cached data
      console.log("Network error, using cached analytics...");
      const cachedData = await getCachedData("analytics");
      if (cachedData.length > 0) {
        setAnalytics(cachedData[0]);
      }
    }
  };

  // Listen for real-time events affecting analytics
  useRealTime((event) => {
    if (["trip:completed", "expense:recorded", "maintenance:logged"].includes(event.type)) {
      loadAnalytics();
    }
  });

  useEffect(() => {
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
      <TopBar 
        title={
          role === "Financial Analyst"
            ? "Financial Analytics"
            : role === "Dispatcher"
            ? "Operational Metrics"
            : role === "Safety Officer"
            ? "Compliance Metrics"
            : "Operational Analytics"
        } 
        subtitle={
          role === "Financial Analyst"
            ? "Vehicle ROI, operational costs, and revenue signals."
            : role === "Dispatcher"
            ? "Fuel efficiency, utilization, and trip metrics."
            : role === "Safety Officer"
            ? "Fleet health, maintenance alerts, and compliance status."
            : "Fuel efficiency, utilization, and ROI signals."
        } 
      />

      <section className="card rounded-[28px] p-6">
        <SectionHeader 
          title={role === "Financial Analyst" ? "Financial Exports" : "Export Reports"} 
          description={role === "Financial Analyst" ? "Download operational costs and ROI reports." : "Download trips, expenses, and maintenance logs."} 
        />
        <div className="mt-6 flex flex-wrap gap-3">
          {(role === "Financial Analyst" || role === "Fleet Manager") && (
            <>
              <ExportButton label="Expenses" type="expenses" format="pdf" />
              <ExportButton label="Expenses" type="expenses" format="excel" />
            </>
          )}
          {(role === "Dispatcher" || role === "Fleet Manager") && (
            <>
              <ExportButton label="Trips" type="trips" format="pdf" />
              <ExportButton label="Trips" type="trips" format="excel" />
            </>
          )}
          {(role === "Safety Officer" || role === "Fleet Manager") && (
            <>
              <ExportButton label="Maintenance" type="maintenance" format="pdf" />
              <ExportButton label="Maintenance" type="maintenance" format="excel" />
            </>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {role === "Financial Analyst" && (
          <>
            <StatCard label="Utilization Rate" value={analytics ? `${analytics.utilizationRate}%` : "--"} hint="Asset productivity" />
            <StatCard label="Total Expense" value={analytics ? formatCurrency(analytics.vehicleRoi.reduce((sum, v) => sum + v.operationalCost, 0)) : "--"} hint="Operational costs" />
            <StatCard label="Active Fleet" value={analytics ? formatNumber(analytics.activeFleet) : "--"} hint="Revenue generators" />
            <StatCard label="Fuel Efficiency" value={analytics ? `${analytics.fuelEfficiency} km/L` : "--"} hint="Cost optimization" />
          </>
        )}
        {role === "Dispatcher" && (
          <>
            <StatCard label="Fuel Efficiency" value={analytics ? `${analytics.fuelEfficiency} km/L` : "--"} hint="Route optimization" />
            <StatCard label="Utilization Rate" value={analytics ? `${analytics.utilizationRate}%` : "--"} hint="Fleet usage" />
            <StatCard label="Active Fleet" value={analytics ? formatNumber(analytics.activeFleet) : "--"} hint="On the road" />
            <StatCard label="Pending Cargo" value={analytics ? formatNumber(analytics.pendingCargo) : "--"} hint="Queued trips" />
          </>
        )}
        {role === "Safety Officer" && (
          <>
            <StatCard label="Maintenance Alerts" value={analytics ? formatNumber(analytics.maintenanceAlerts) : "--"} hint="Service queue" />
            <StatCard label="Active Fleet" value={analytics ? formatNumber(analytics.activeFleet) : "--"} hint="Operational vehicles" />
            <StatCard label="Utilization Rate" value={analytics ? `${analytics.utilizationRate}%` : "--"} hint="Safety margin" />
            <StatCard label="Fuel Efficiency" value={analytics ? `${analytics.fuelEfficiency} km/L` : "--"} hint="Engine health" />
          </>
        )}
        {role === "Fleet Manager" && (
          <>
            <StatCard label="Fuel Efficiency" value={analytics ? `${analytics.fuelEfficiency} km/L` : "--"} />
            <StatCard label="Utilization Rate" value={analytics ? `${analytics.utilizationRate}%` : "--"} hint="Active fleet share" />
            <StatCard label="Active Fleet" value={analytics ? formatNumber(analytics.activeFleet) : "--"} />
            <StatCard label="Maintenance Alerts" value={analytics ? formatNumber(analytics.maintenanceAlerts) : "--"} />
          </>
        )}
      </section>

      {(role === "Financial Analyst" || role === "Fleet Manager") && (
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
      )}
    </div>
  );
}
