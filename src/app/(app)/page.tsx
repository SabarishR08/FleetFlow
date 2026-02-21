"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { StatusPill } from "@/components/StatusPill";
import { TopBar } from "@/components/TopBar";
import { formatNumber } from "@/lib/format";

interface AnalyticsResponse {
  activeFleet: number;
  maintenanceAlerts: number;
  utilizationRate: number;
  pendingCargo: number;
  fuelEfficiency: number;
}

interface TripItem {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  status: string;
  vehicle?: { name: string } | null;
  driver?: { name: string } | null;
}

interface VehicleItem {
  id: string;
  name: string;
  status: string;
  region: string;
  type: string;
}

export default function CommandCenter() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);

  const loadData = useCallback(async () => {
    const [analyticsRes, tripsRes, vehiclesRes] = await Promise.all([
      fetch("/api/analytics"),
      fetch("/api/trips"),
      fetch("/api/vehicles"),
    ]);

    const analyticsData = await analyticsRes.json();
    const tripsData = await tripsRes.json();
    const vehiclesData = await vehiclesRes.json();
    setAnalytics(analyticsData);
    setTrips(tripsData);
    setVehicles(vehiclesData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeTrips = useMemo(() => trips.filter((trip) => trip.status === "DISPATCHED"), [trips]);
  const inShop = useMemo(() => vehicles.filter((vehicle) => vehicle.status === "IN_SHOP"), [vehicles]);

  return (
    <div className="flex flex-col gap-8">
      <TopBar title="Command Center" subtitle="Live fleet posture and compliance signals." actionLabel="Open Dispatch" actionHref="/trips" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Fleet" value={analytics ? formatNumber(analytics.activeFleet) : "--"} hint="Vehicles on trip" />
        <StatCard
          label="Maintenance Alerts"
          value={analytics ? formatNumber(analytics.maintenanceAlerts) : "--"}
          hint="Vehicles in shop"
        />
        <StatCard
          label="Utilization Rate"
          value={analytics ? `${analytics.utilizationRate}%` : "--"}
          hint="Assigned vs idle"
        />
        <StatCard label="Pending Cargo" value={analytics ? formatNumber(analytics.pendingCargo) : "--"} hint="Draft dispatches" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="card rounded-[28px] p-6">
          <SectionHeader title="Active Trips" description="Dispatches currently moving freight." />
          <div className="mt-6 space-y-4">
            {activeTrips.length === 0 ? (
              <p className="text-sm text-[color:var(--muted)]">No active trips yet.</p>
            ) : (
              activeTrips.slice(0, 4).map((trip) => (
                <div key={trip.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] p-4">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--ink)]">{trip.reference}</p>
                    <p className="text-xs text-[color:var(--muted)]">
                      {trip.origin} to {trip.destination}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">
                      {trip.vehicle?.name || "Unassigned"} - {trip.driver?.name || "No driver"}
                    </p>
                  </div>
                  <StatusPill tone="blue" label="On Trip" />
                </div>
              ))
            )}
          </div>
        </div>
        <div className="card rounded-[28px] p-6">
          <SectionHeader title="Maintenance Radar" description="Vehicles removed from dispatching." />
          <div className="mt-6 space-y-4">
            {inShop.length === 0 ? (
              <p className="text-sm text-[color:var(--muted)]">No vehicles in shop.</p>
            ) : (
              inShop.slice(0, 4).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] p-4">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--ink)]">{vehicle.name}</p>
                    <p className="text-xs text-[color:var(--muted)]">{vehicle.region} region</p>
                  </div>
                  <StatusPill tone="amber" label="In Shop" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="card rounded-[28px] p-6">
        <SectionHeader title="Vehicle Snapshot" description="Availability by asset type." />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.slice(0, 6).map((vehicle) => (
            <div key={vehicle.id} className="rounded-2xl border border-[color:var(--border)] p-4">
              <p className="text-sm font-semibold text-[color:var(--ink)]">{vehicle.name}</p>
              <p className="text-xs text-[color:var(--muted)]">{vehicle.type} - {vehicle.region}</p>
              <div className="mt-3">
                <StatusPill
                  tone={
                    vehicle.status === "AVAILABLE"
                      ? "green"
                      : vehicle.status === "ON_TRIP"
                        ? "blue"
                        : vehicle.status === "IN_SHOP"
                          ? "amber"
                          : "slate"
                  }
                  label={vehicle.status.replaceAll("_", " ")}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
