import Link from "next/link";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function TopBar({ title, subtitle, actionLabel, actionHref }: TopBarProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">FleetFlow</p>
        <h2 className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-[color:var(--muted)]">{subtitle}</p> : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--glow)] transition hover:translate-y-[-1px]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
