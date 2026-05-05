import type { ReactNode } from "react";

export function StatTile({
  label, value, icon, hint,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-foreground/10 surface-1 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        {icon && <span className="text-foreground/60">{icon}</span>}
      </div>
      <p className="num mt-2 text-[28px] font-semibold leading-none tracking-[-0.03em]">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}