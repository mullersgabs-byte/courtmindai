import { useMemo } from "react";

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

type Props = {
  sport?: string;
  size?: number;
  showReference?: boolean;
  className?: string;
};

export function SportAvatar({ sport, size = 160, showReference = false, className }: Props) {
  const key = useMemo(() => normalizeSport(sport), [sport]);
  return (
    <div className={className} style={{ display: "inline-flex", gap: 8, alignItems: "flex-end" }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`Avatar ${key}`}
      >
        {/* head */}
        <circle cx="50" cy="22" r="8" stroke="currentColor" strokeWidth="2" />
        {/* body */}
        <line x1="50" y1="30" x2="50" y2="60" stroke="currentColor" strokeWidth="2" />
        {/* arms */}
        <g>
          <line x1="50" y1="38" x2="35" y2="50" stroke="currentColor" strokeWidth="2">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 38"
              to="20 50 38"
              dur="1.6s"
              repeatCount="indefinite"
              values="0 50 38; 20 50 38; 0 50 38"
            />
          </line>
          <line x1="50" y1="38" x2="65" y2="50" stroke="currentColor" strokeWidth="2">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 38"
              to="-20 50 38"
              dur="1.6s"
              repeatCount="indefinite"
              values="0 50 38; -20 50 38; 0 50 38"
            />
          </line>
        </g>
        {/* legs */}
        <line x1="50" y1="60" x2="42" y2="80" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="60" x2="58" y2="80" stroke="currentColor" strokeWidth="2" />
      </svg>
      {showReference ? (
        <SportAvatar sport={sport} size={Math.round(size * 0.5)} />
      ) : null}
    </div>
  );
}

export default SportAvatar;
