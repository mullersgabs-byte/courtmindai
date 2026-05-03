import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Avatar2D } from "./Avatar2D";
import { clipFor, speedFor, type MovementKey } from "@/lib/avatarClips";

const Avatar3D = lazy(() => import("./Avatar3D").then((m) => ({ default: m.Avatar3D })));

export type SportKey =
  | "tennis"
  | "gym"
  | "running"
  | "football"
  | "basketball"
  | "yoga"
  | "generic";

export function normalizeSport(sport?: string): SportKey {
  if (!sport) return "generic";
  const s = sport.toLowerCase();
  if (s.includes("tenis") || s.includes("tennis")) return "tennis";
  if (s.includes("gym") || s.includes("muscul") || s.includes("force") || s.includes("fuerza")) return "gym";
  if (s.includes("corr") || s.includes("run")) return "running";
  if (s.includes("futeb") || s.includes("foot") || s.includes("soccer") || s.includes("fútbol")) return "football";
  if (s.includes("basket") || s.includes("básquet") || s.includes("basquet")) return "basketball";
  if (s.includes("yoga")) return "yoga";
  return "generic";
}

function sportToMovement(key: SportKey): MovementKey {
  switch (key) {
    case "tennis": return "footwork";
    case "gym": return "squat";
    case "running": return "jogging";
    case "football": return "footwork";
    case "basketball": return "footwork";
    case "yoga": return "yoga";
    default: return "footwork";
  }
}

type Props = {
  sport?: string;
  movement?: MovementKey;
  size?: number | "sm" | "md" | "lg" | "xl";
  paused?: boolean;
  showReference?: boolean; // ignored — kept for back-compat
  className?: string;
};

const SIZE_MAP: Record<string, number> = { sm: 64, md: 120, lg: 180, xl: 240 };

export function SportAvatar({ sport, movement, size = 160, paused, className }: Props) {
  const px = typeof size === "number" ? size : (SIZE_MAP[size] ?? 160);
  const sportKey = useMemo(() => normalizeSport(sport), [sport]);
  const move = movement ?? sportToMovement(sportKey);
  const url = clipFor(move);
  const speed = speedFor(move);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={className}
      style={{ width: px, height: px, borderRadius: 16, overflow: "hidden", background: "#F5F5F5" }}
    >
      {mounted ? (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Avatar2D size={Math.min(px, 240)} /></div>}>
          <Avatar3D clipUrl={url} paused={paused} speed={speed} />
        </Suspense>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Avatar2D size={Math.min(px, 240)} />
        </div>
      )}
    </div>
  );
}

export default SportAvatar;
