"use client";

import { useCallback, useEffect, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import { TopBar } from "@/components/TopBar";
import { formatCurrency, formatDate } from "@/lib/format";

interface Vehicle {
  id: string;
  name: string;
  status: string;
}

interface MaintenanceLog {
  id: string;
  description: string;
  cost: number;
  servicedAt: string;
  resolved: boolean;
  vehicle: Vehicle;
}

export default function MaintenancePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    vehicleId: "",
    description: "",
    cost: "",
    servicedAt: "",
  });

  const loadData = useCallback(async () => {
    const [vehiclesRes, logsRes] = await Promise.all([
      fetch("/api/vehicles"),
      fetch("/api/maintenance"),
    ]);
    setVehicles(await vehiclesRes.json());
    setLogs(await logsRes.json());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        cost: Number(form.cost),
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Unable to log service.");
      return;
    }

    setForm({ vehicleId: "", description: "", cost: "", servicedAt: "" });
    loadData();
  };

  const resolveLog = async (id: string) => {
    await fetch("/api/maintenance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  return (
    <div className="flex flex-col gap-8">
      <TopBar title="Maintenance Logs" subtitle="Auto-hides vehicles when service is logged." actionLabel="View Vehicles" actionHref="/vehicles" />

      <section className="card rounded-[28px] p-6">
        <SectionHeader title="Log Service" description="Place a vehicle in shop instantly." />
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <select
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            value={form.vehicleId}
            onChange={(event) => setForm((prev) => ({ ...prev, vehicleId: event.target.value }))}
            required
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name} ({vehicle.status.replaceAll("_", " ")})
              </option>
            ))}
          </select>
          <input
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Service description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />
          <input
            type="number"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Cost"
            value={form.cost}
            onChange={(event) => setForm((prev) => ({ ...prev, cost: event.target.value }))}
          />
          <input
            type="date"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            value={form.servicedAt}
            onChange={(event) => setForm((prev) => ({ ...prev, servicedAt: event.target.value }))}
            required
          />
          <button
            type="submit"
            className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--glow)]"
          >
            Log Maintenance
          </button>
        </form>
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="card rounded-[28px] p-6">
        <SectionHeader title="Service History" description="Resolve tickets to restore availability." />
        <div className="mt-6 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] p-4">
              <div>
                <p className="text-sm font-semibold text-[color:var(--ink)]">{log.vehicle?.name}</p>
                <p className="text-xs text-[color:var(--muted)]">{log.description}</p>
                <p className="text-xs text-[color:var(--muted)]">Serviced {formatDate(log.servicedAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[color:var(--ink)]">{formatCurrency(log.cost)}</span>
                <StatusPill tone={log.resolved ? "green" : "amber"} label={log.resolved ? "Resolved" : "In Shop"} />
                {!log.resolved ? (
                  <button
                    className="rounded-full border border-[color:var(--border)] px-4 py-2 text-xs"
                    onClick={() => resolveLog(log.id)}
                  >
                    Resolve
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
