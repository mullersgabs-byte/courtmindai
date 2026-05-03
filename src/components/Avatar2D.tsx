type Props = { className?: string; size?: number };

/**
 * Premium 2D human silhouette fallback. No stick figures, no lines.
 * Pure filled silhouette with a soft platinum gradient.
 */
export function Avatar2D({ className, size = 240 }: Props) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-label="Avatar">
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D9D9D9" />
          </linearGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>
        <g fill="url(#bodyGrad)" filter="url(#soft)">
          {/* head */}
          <ellipse cx="100" cy="42" rx="22" ry="26" />
          {/* neck + torso */}
          <path d="M88 66 Q100 74 112 66 L128 100 Q132 130 124 170 L76 170 Q68 130 72 100 Z" />
          {/* arms */}
          <path d="M72 96 Q56 130 60 178 Q66 184 74 178 Q78 140 88 110 Z" />
          <path d="M128 96 Q144 130 140 178 Q134 184 126 178 Q122 140 112 110 Z" />
          {/* legs */}
          <path d="M82 168 Q78 220 84 268 Q92 272 98 266 Q98 220 96 170 Z" />
          <path d="M118 168 Q122 220 116 268 Q108 272 102 266 Q102 220 104 170 Z" />
        </g>
      </svg>
    </div>
  );
}

export default Avatar2D;