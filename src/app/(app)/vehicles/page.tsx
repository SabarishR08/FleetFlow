"use client";

import { useCallback, useEffect, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import { TopBar } from "@/components/TopBar";
import { formatNumber } from "@/lib/format";
import { useRole } from "@/lib/role-context";

interface Vehicle {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
  maxLoad: number;
  odometer: number;
  status: string;
  region: string;
  type: string;
}

const statusTone: Record<string, "green" | "amber" | "red" | "slate" | "blue"> = {
  AVAILABLE: "green",
  ON_TRIP: "blue",
  IN_SHOP: "amber",
  OUT_OF_SERVICE: "red",
};

export default function VehicleRegistry() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { role } = useRole();

  const [form, setForm] = useState({
    name: "",
    model: "",
    licensePlate: "",
    maxLoad: "",
    odometer: "",
    acquisitionCost: "",
    region: "East",
    type: "VAN",
  });

  const loadVehicles = useCallback(async () => {
    const response = await fetch("/api/vehicles");
    const data = await response.json();
    setVehicles(data);
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        maxLoad: Number(form.maxLoad),
        odometer: Number(form.odometer),
        acquisitionCost: Number(form.acquisitionCost),
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Unable to create vehicle.");
      return;
    }

    setForm({
      name: "",
      model: "",
      licensePlate: "",
      maxLoad: "",
      odometer: "",
      acquisitionCost: "",
      region: "East",
      type: "VAN",
    });
    loadVehicles();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch("/api/vehicles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadVehicles();
  };

  return (
    <div className="flex flex-col gap-8">
      <TopBar 
        title={role === "Financial Analyst" ? "Fleet Assets" : "Vehicle Registry"} 
        subtitle={role === "Financial Analyst" ? "Monitor vehicle acquisition cost and depreciation." : "Manage assets, availability, and capacity."} 
        actionLabel="View Dispatch" 
        actionHref="/trips" 
      />

      {(role === "Fleet Manager" || role === "Dispatcher") && (
        <section className="card rounded-[28px] p-6">
          <SectionHeader title="Add Vehicle" description="Register new fleet assets and track lifecycle data." />
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Vehicle name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Model"
            value={form.model}
            onChange={(event) => setForm((prev) => ({ ...prev, model: event.target.value }))}
            required
          />
          <input
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="License Plate"
            value={form.licensePlate}
            onChange={(event) => setForm((prev) => ({ ...prev, licensePlate: event.target.value }))}
            required
          />
          <input
            type="number"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Max Load (kg)"
            value={form.maxLoad}
            onChange={(event) => setForm((prev) => ({ ...prev, maxLoad: event.target.value }))}
            required
          />
          <input
            type="number"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Odometer"
            value={form.odometer}
            onChange={(event) => setForm((prev) => ({ ...prev, odometer: event.target.value }))}
          />
          <input
            type="number"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Acquisition Cost"
            value={form.acquisitionCost}
            onChange={(event) => setForm((prev) => ({ ...prev, acquisitionCost: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Region"
            value={form.region}
            onChange={(event) => setForm((prev) => ({ ...prev, region: event.target.value }))}
          />
          <select
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="BIKE">Bike</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--glow)]"
          >
            Register Vehicle
          </button>
        </form>
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </section>
      )}

      <section className="card rounded-[28px] p-6">
        <SectionHeader title="Fleet Inventory" description="Toggle status and watch availability changes in real time." />
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              <tr>
                <th className="pb-4">Vehicle</th>
                <th className="pb-4">Plate</th>
                <th className="pb-4">Capacity</th>
                <th className="pb-4">Odometer</th>
                <th className="pb-4">Region</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--ink)]">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-t border-[color:var(--border)]">
                  <td className="py-4">
                    <p className="font-semibold">{vehicle.name}</p>
                    <p className="text-xs text-[color:var(--muted)]">{vehicle.model}</p>
                  </td>
                  <td className="py-4 text-xs text-[color:var(--muted)]">{vehicle.licensePlate}</td>
                  <td className="py-4">{formatNumber(vehicle.maxLoad)} kg</td>
                  <td className="py-4">{formatNumber(vehicle.odometer)} km</td>
                  <td className="py-4">{vehicle.region}</td>
                  <td className="py-4">
                    <StatusPill tone={statusTone[vehicle.status] || "slate"} label={vehicle.status.replaceAll("_", " ")} />
                  </td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        className="rounded-full border border-[color:var(--border)] px-3 py-2"
                        onClick={() => handleStatusChange(vehicle.id, "AVAILABLE")}
                      >
                        Mark Available
                      </button>
                      <button
                        className="rounded-full border border-[color:var(--border)] px-3 py-2"
                        onClick={() => handleStatusChange(vehicle.id, "OUT_OF_SERVICE")}
                      >
                        Out of Service
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
