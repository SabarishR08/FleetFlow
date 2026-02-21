"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const roles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roles[0]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem("fleetflow.role", role);
    localStorage.setItem("fleetflow.email", email);
    router.push("/");
  };

  return (
    <div className="page-fade flex min-h-screen items-center justify-center px-6 py-16">
      <div className="card w-full max-w-lg rounded-[32px] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">FleetFlow</p>
        <h1 className="mt-3 font-[family:var(--font-fraunces)] text-3xl text-[color:var(--ink)]">Secure Access</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Demo-only login. Select a role to preview role-aware workflows.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="fleet.manager@fleetflow.ai"
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3"
            >
              {roles.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="w-full rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--glow)]"
          >
            Enter Command Center
          </button>
        </form>
        <p className="mt-6 text-xs text-[color:var(--muted)]">
          Forgot password flow is simulated for the hackathon demo.
        </p>
      </div>
    </div>
  );
}
