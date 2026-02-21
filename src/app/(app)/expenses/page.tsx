"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import { TopBar } from "@/components/TopBar";
import { formatCurrency, formatDate } from "@/lib/format";

interface Vehicle {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  liters: number;
  cost: number;
  expenseDate: string;
  type: string;
  vehicle: Vehicle;
}

export default function ExpensesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vehicleId: "",
    liters: "",
    cost: "",
    expenseDate: "",
    type: "FUEL",
  });

  const loadData = useCallback(async () => {
    const [vehiclesRes, expensesRes] = await Promise.all([
      fetch("/api/vehicles"),
      fetch("/api/expenses"),
    ]);
    setVehicles(await vehiclesRes.json());
    setExpenses(await expensesRes.json());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalCost = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.cost, 0),
    [expenses]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        liters: Number(form.liters),
        cost: Number(form.cost),
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Unable to log expense.");
      return;
    }

    setForm({ vehicleId: "", liters: "", cost: "", expenseDate: "", type: "FUEL" });
    loadData();
  };

  return (
    <div className="flex flex-col gap-8">
      <TopBar title="Expense Logging" subtitle="Track fuel spend and operational costs." actionLabel="View Analytics" actionHref="/analytics" />

      <section className="card rounded-[28px] p-6">
        <SectionHeader title="Log Expense" description="Fuel, tolls, and other trip costs." />
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
                {vehicle.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="FUEL">Fuel</option>
            <option value="TOLL">Toll</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            type="number"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Liters"
            value={form.liters}
            onChange={(event) => setForm((prev) => ({ ...prev, liters: event.target.value }))}
          />
          <input
            type="number"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            placeholder="Cost"
            value={form.cost}
            onChange={(event) => setForm((prev) => ({ ...prev, cost: event.target.value }))}
            required
          />
          <input
            type="date"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
            value={form.expenseDate}
            onChange={(event) => setForm((prev) => ({ ...prev, expenseDate: event.target.value }))}
            required
          />
          <button
            type="submit"
            className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--glow)]"
          >
            Log Expense
          </button>
        </form>
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="card rounded-[28px] p-6">
        <SectionHeader title="Recent Expenses" description={`Total operational spend: ${formatCurrency(totalCost)}`} />
        <div className="mt-6 space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] p-4">
              <div>
                <p className="text-sm font-semibold text-[color:var(--ink)]">{expense.vehicle?.name}</p>
                <p className="text-xs text-[color:var(--muted)]">Logged {formatDate(expense.expenseDate)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill tone={expense.type === "FUEL" ? "blue" : "slate"} label={expense.type} />
                <span className="text-sm font-semibold text-[color:var(--ink)]">{formatCurrency(expense.cost)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
