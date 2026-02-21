"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/lib/role-context";

const navByRole = {
  "Fleet Manager": [
    { href: "/", label: "Command Center" },
    { href: "/vehicles", label: "Vehicle Registry" },
    { href: "/trips", label: "Trip Dispatch" },
    { href: "/maintenance", label: "Maintenance" },
    { href: "/drivers", label: "Drivers" },
    { href: "/analytics", label: "Analytics" },
  ],
  "Dispatcher": [
    { href: "/", label: "Dashboard" },
    { href: "/trips", label: "Trip Dispatch" },
    { href: "/vehicles", label: "Vehicles" },
    { href: "/drivers", label: "Available Drivers" },
  ],
  "Safety Officer": [
    { href: "/", label: "Compliance Hub" },
    { href: "/drivers", label: "Driver Compliance" },
    { href: "/maintenance", label: "Fleet Health" },
    { href: "/analytics", label: "Safety Metrics" },
  ],
  "Financial Analyst": [
    { href: "/", label: "Finance Dashboard" },
    { href: "/analytics", label: "ROI & Efficiency" },
    { href: "/expenses", label: "Expense Tracking" },
    { href: "/trips", label: "Trip Revenue" },
  ],
};

export function RoleSidebar() {
  const pathname = usePathname();
  const { role, switchRole } = useRole();

  if (!role) {
    return null;
  }

  const items = navByRole[role] || [];

  return (
    <aside className="glass sticky top-6 h-[calc(100vh-48px)] w-full max-w-[260px] rounded-[28px] p-6">
      <div className="flex flex-col gap-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">FleetFlow</p>
          <h1 className="mt-2 font-[family:var(--font-fraunces)] text-2xl text-[color:var(--ink)]">
            {role === "Fleet Manager"
              ? "Command Core"
              : role === "Dispatcher"
                ? "Dispatch"
                : role === "Safety Officer"
                  ? "Safety"
                  : "Finance"}
          </h1>
          <p className="text-xs text-[color:var(--muted)]">{role}</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-4 py-3 transition ${
                  isActive
                    ? "bg-[color:var(--ink)] text-[color:var(--surface)] shadow-lg"
                    : "text-[color:var(--muted)] hover:bg-[color:var(--border)] hover:text-[color:var(--ink)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] p-4 text-xs">
          <p className="font-semibold text-[color:var(--ink)]">Quick Switch</p>
          <div className="mt-3 flex flex-col gap-2">
            {(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"] as const).map(
              (r) => (
                <button
                  key={r}
                  className={`rounded-lg px-2 py-1 text-xs transition ${
                    role === r
                      ? "bg-[color:var(--accent)] text-white"
                      : "border border-[color:var(--border)] text-[color:var(--muted)] hover:bg-[color:var(--border)]"
                  }`}
                  onClick={() => switchRole(r)}
                >
                  {r === "Fleet Manager" ? "FM" : r[0]}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
