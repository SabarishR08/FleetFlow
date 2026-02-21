interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="card rounded-[24px] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[color:var(--ink)]">{value}</p>
      {hint ? <p className="mt-2 text-sm text-[color:var(--muted)]">{hint}</p> : null}
    </div>
  );
}
