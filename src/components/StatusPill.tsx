interface StatusPillProps {
  tone: "green" | "amber" | "red" | "slate" | "blue";
  label: string;
}

const toneMap: Record<StatusPillProps["tone"], string> = {
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-rose-100 text-rose-700",
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-sky-100 text-sky-700",
};

export function StatusPill({ tone, label }: StatusPillProps) {
  return <span className={`pill ${toneMap[tone]}`}>{label}</span>;
}
