import type { ReactNode } from "react";

export function EmptyState({
  icon, title, description, action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-foreground/10 surface-1 p-8 text-center">
      {icon && <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full surface-2 text-foreground/70">{icon}</div>}
      <p className="text-[16px] font-semibold tracking-tight">{title}</p>
      {description && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}