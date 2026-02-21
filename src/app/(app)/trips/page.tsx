"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import { TopBar } from "@/components/TopBar";
import { formatDate, formatNumber, isExpired } from "@/lib/format";
import { useRole } from "@/lib/role-context";

interface Vehicle {
  id: string;
  name: string;
  maxLoad: number;
  status: string;
}

interface Driver {
  id: string;
  name: string;
  status: string;
  licenseExpiry: string;
  licenseClass: string;
}

interface Trip {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  cargoWeight: number;
  status: string;
  distanceKm: number;
  revenue: number;
  completedAt?: string | null;
  vehicle?: { name: string } | null;
  driver?: { name: string } | null;
}

export default function TripDispatcher() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { role } = useRole();

  const [form, setForm] = useState({
    reference: "",
    origin: "",
    destination: "",
    cargoWeight: "",
    distanceKm: "",
    revenue: "",
    vehicleId: "",
    driverId: "",
  });

  const loadData = useCallback(async () => {
    const [vehiclesRes, driversRes, tripsRes] = await Promise.all([
      fetch("/api/vehicles"),
      fetch("/api/drivers"),
      fetch("/api/trips"),
    ]);
    setVehicles(await vehiclesRes.json());
    setDrivers(await driversRes.json());
    setTrips(await tripsRes.json());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === "AVAILABLE"),
    [vehicles]
  );

  const availableDrivers = useMemo(
    () => drivers.filter((driver) => driver.status === "ON_DUTY" && !isExpired(driver.licenseExpiry)),
    [drivers]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        cargoWeight: Number(form.cargoWeight),
        distanceKm: Number(form.distanceKm),
        revenue: Number(form.revenue),
        status: "DISPATCHED",
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Unable to dispatch trip.");
      return;
    }

    setForm({
      reference: "",
      origin: "",
      destination: "",
      cargoWeight: "",
      distanceKm: "",
      revenue: "",
      vehicleId: "",
      driverId: "",
    });
    loadData();
  };

  const updateTripStatus = async (id: string, status: string) => {
    await fetch("/api/trips", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadData();
  };

  return (
    <div className="flex flex-col gap-8">
      <TopBar 
        title={role === "Dispatcher" ? "Trip Dispatch" : role === "Safety Officer" ? "Trip Compliance" : "Trip Dispatch"} 
        subtitle={role === "Dispatcher" ? "Assign vehicles, validate cargo, and move freight." : role === "Safety Officer" ? "Monitor trip status and driver assignments." : "Assign vehicles, validate cargo, and move freight."} 
        actionLabel="View Analytics" 
        actionHref="/analytics" 
      />

      {(role === "Dispatcher" || role === "Fleet Manager") && (
        <section className="card rounded-[28px] p-6">
          <SectionHeader title="Dispatch New Trip" description="Cargo weight is validated against vehicle capacity." />
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Reference"
            value={form.reference}
            onChange={(event) => setForm((prev) => ({ ...prev, reference: event.target.value }))}
            required
          />
          <input
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Origin"
            value={form.origin}
            onChange={(event) => setForm((prev) => ({ ...prev, origin: event.target.value }))}
            required
          />
          <input
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Destination"
            value={form.destination}
            onChange={(event) => setForm((prev) => ({ ...prev, destination: event.target.value }))}
            required
          />
          <input
            type="number"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Cargo Weight (kg)"
            value={form.cargoWeight}
            onChange={(event) => setForm((prev) => ({ ...prev, cargoWeight: event.target.value }))}
            required
          />
          <input
            type="number"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Distance (km)"
            value={form.distanceKm}
            onChange={(event) => setForm((prev) => ({ ...prev, distanceKm: event.target.value }))}
          />
          <input
            type="number"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Revenue"
            value={form.revenue}
            onChange={(event) => setForm((prev) => ({ ...prev, revenue: event.target.value }))}
          />
          <select
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            value={form.vehicleId}
            onChange={(event) => setForm((prev) => ({ ...prev, vehicleId: event.target.value }))}
            required
          >
            <option value="">Select Vehicle</option>
            {availableVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name} ({vehicle.maxLoad} kg)
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            value={form.driverId}
            onChange={(event) => setForm((prev) => ({ ...prev, driverId: event.target.value }))}
            required
          >
            <option value="">Select Driver</option>
            {availableDrivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} - {driver.licenseClass}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--glow)]"
          >
            Dispatch Trip
          </button>
        </form>
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </section>
      )}

      <section className="card rounded-[28px] p-6">
        <SectionHeader title="Trip Lifecycle" description="Monitor dispatch status and close out trips." />
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              <tr>
                <th className="pb-4">Reference</th>
                <th className="pb-4">Route</th>
                <th className="pb-4">Cargo</th>
                <th className="pb-4">Vehicle</th>
                <th className="pb-4">Driver</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--ink)]">
              {trips.map((trip) => (
                <tr key={trip.id} className="border-t border-[color:var(--border)]">
                  <td className="py-4 font-semibold">{trip.reference}</td>
                  <td className="py-4 text-xs text-[color:var(--muted)]">
                    {trip.origin} to {trip.destination}
                  </td>
                  <td className="py-4">{formatNumber(trip.cargoWeight)} kg</td>
                  <td className="py-4 text-xs text-[color:var(--muted)]">{trip.vehicle?.name || "-"}</td>
                  <td className="py-4 text-xs text-[color:var(--muted)]">{trip.driver?.name || "-"}</td>
                  <td className="py-4">
                    <StatusPill
                      tone={trip.status === "DISPATCHED" ? "blue" : trip.status === "COMPLETED" ? "green" : "slate"}
                      label={trip.status.replace("_", " ")}
                    />
                  </td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      {trip.status === "DISPATCHED" ? (
                        <button
                          className="rounded-full border border-[color:var(--border)] px-3 py-2"
                          onClick={() => updateTripStatus(trip.id, "COMPLETED")}
                        >
                          Mark Completed
                        </button>
                      ) : null}
                      {trip.status !== "CANCELLED" && trip.status !== "COMPLETED" ? (
                        <button
                          className="rounded-full border border-[color:var(--border)] px-3 py-2"
                          onClick={() => updateTripStatus(trip.id, "CANCELLED")}
                        >
                          Cancel Trip
                        </button>
                      ) : null}
                      {trip.status === "COMPLETED" ? (
                        <span className="text-xs text-[color:var(--muted)]">
                          Closed {trip.completedAt ? formatDate(trip.completedAt) : "-"}
                        </span>
                      ) : null}
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
