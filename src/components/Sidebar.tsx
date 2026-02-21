"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Command Center" },
  { href: "/vehicles", label: "Vehicle Registry" },
  { href: "/trips", label: "Trip Dispatch" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/expenses", label: "Expenses" },
  { href: "/drivers", label: "Drivers" },
  { href: "/analytics", label: "Analytics" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass sticky top-6 h-[calc(100vh-48px)] w-full max-w-[260px] rounded-[28px] p-6">
      <div className="flex flex-col gap-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">FleetFlow</p>
          <h1 className="mt-2 font-[family:var(--font-fraunces)] text-2xl text-[color:var(--ink)]">
            Command Core
          </h1>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          {navItems.map((item) => {
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
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] p-4 text-xs text-[color:var(--muted)]">
          <p className="font-semibold text-[color:var(--ink)]">Demo Access</p>
          <p className="mt-2">Role-based UI is simulated. Use Login to switch roles.</p>
          <Link className="mt-3 inline-flex text-[color:var(--accent)]" href="/login">
            Go to Login
          </Link>
        </div>
      </div>
    </aside>
  );
}
