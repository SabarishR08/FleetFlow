interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl font-semibold text-[color:var(--ink)]">{title}</h3>
      {description ? <p className="text-sm text-[color:var(--muted)]">{description}</p> : null}
    </div>
  );
}
