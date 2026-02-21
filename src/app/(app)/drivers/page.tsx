"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import { TopBar } from "@/components/TopBar";
import { formatDate, isExpired } from "@/lib/format";

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseClass: string;
  status: string;
  safetyScore: number;
  tripCompletionRate: number;
  region: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    licenseNumber: "",
    licenseExpiry: "",
    licenseClass: "Van",
    region: "East",
    safetyScore: "90",
    tripCompletionRate: "95",
  });

  const loadDrivers = useCallback(async () => {
    const response = await fetch("/api/drivers");
    setDrivers(await response.json());
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const expiredCount = useMemo(
    () => drivers.filter((driver) => isExpired(driver.licenseExpiry)).length,
    [drivers]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        safetyScore: Number(form.safetyScore),
        tripCompletionRate: Number(form.tripCompletionRate),
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Unable to add driver.");
      return;
    }

    setForm({
      name: "",
      licenseNumber: "",
      licenseExpiry: "",
      licenseClass: "Van",
      region: "East",
      safetyScore: "90",
      tripCompletionRate: "95",
    });
    loadDrivers();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/drivers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadDrivers();
  };

  return (
    <div className="flex flex-col gap-8">
      <TopBar title="Driver Profiles" subtitle="Monitor compliance, safety score, and duty status." actionLabel="View Trips" actionHref="/trips" />

      <section className="card rounded-[28px] p-6">
        <SectionHeader title="Add Driver" description={`${expiredCount} license(s) currently expired.`} />
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Driver name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="License number"
            value={form.licenseNumber}
            onChange={(event) => setForm((prev) => ({ ...prev, licenseNumber: event.target.value }))}
            required
          />
          <input
            type="date"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            value={form.licenseExpiry}
            onChange={(event) => setForm((prev) => ({ ...prev, licenseExpiry: event.target.value }))}
            required
          />
          <input
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="License class"
            value={form.licenseClass}
            onChange={(event) => setForm((prev) => ({ ...prev, licenseClass: event.target.value }))}
            required
          />
          <input
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Region"
            value={form.region}
            onChange={(event) => setForm((prev) => ({ ...prev, region: event.target.value }))}
          />
          <input
            type="number"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Safety Score"
            value={form.safetyScore}
            onChange={(event) => setForm((prev) => ({ ...prev, safetyScore: event.target.value }))}
          />
          <input
            type="number"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Trip Completion Rate"
            value={form.tripCompletionRate}
            onChange={(event) => setForm((prev) => ({ ...prev, tripCompletionRate: event.target.value }))}
          />
          <button
            type="submit"
            className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--glow)]"
          >
            Add Driver
          </button>
        </form>
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="card rounded-[28px] p-6">
        <SectionHeader title="Driver Roster" description="Toggle duty status to reflect availability." />
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              <tr>
                <th className="pb-4">Driver</th>
                <th className="pb-4">License</th>
                <th className="pb-4">Expiry</th>
                <th className="pb-4">Safety</th>
                <th className="pb-4">Completion</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--ink)]">
              {drivers.map((driver) => {
                const expired = isExpired(driver.licenseExpiry);
                return (
                  <tr key={driver.id} className="border-t border-[color:var(--border)]">
                    <td className="py-4">
                      <p className="font-semibold">{driver.name}</p>
                      <p className="text-xs text-[color:var(--muted)]">{driver.region}</p>
                    </td>
                    <td className="py-4 text-xs text-[color:var(--muted)]">{driver.licenseNumber}</td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <span>{formatDate(driver.licenseExpiry)}</span>
                        {expired ? <StatusPill tone="red" label="Expired" /> : null}
                      </div>
                    </td>
                    <td className="py-4">{driver.safetyScore.toFixed(1)}</td>
                    <td className="py-4">{driver.tripCompletionRate.toFixed(1)}%</td>
                    <td className="py-4">
                      <StatusPill
                        tone={driver.status === "ON_TRIP" ? "blue" : driver.status === "ON_DUTY" ? "green" : "slate"}
                        label={driver.status.replaceAll("_", " ")}
                      />
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button
                          className="rounded-full border border-[color:var(--border)] px-3 py-2"
                          onClick={() => updateStatus(driver.id, "ON_DUTY")}
                        >
                          On Duty
                        </button>
                        <button
                          className="rounded-full border border-[color:var(--border)] px-3 py-2"
                          onClick={() => updateStatus(driver.id, "OFF_DUTY")}
                        >
                          Off Duty
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
