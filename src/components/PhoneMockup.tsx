import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function PhoneMockup({ children, className = "" }: Props) {
  return (
    <div
      className={`relative mx-auto w-[280px] sm:w-[300px] rounded-[3rem] bg-foreground p-[10px] shadow-[0_40px_100px_-30px_rgb(0_0_0/0.45),0_0_0_1px_rgb(0_0_0/0.05)] ${className}`}
    >
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.4rem] bg-card">
        {/* Notch */}
        <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-foreground" />
        <div className="relative h-full w-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
