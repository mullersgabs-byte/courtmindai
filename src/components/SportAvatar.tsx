export type SportKey =
  | "tennis"
  | "gym"
  | "running"
  | "football"
  | "basketball"
  | "yoga"
  | "mobility"
  | "strength"
  | "recovery"
  | "generic";

const SPORT_ALIAS: Record<string, SportKey> = {
  tennis: "tennis",
  tenis: "tennis",
  gym: "gym",
  strength: "gym",
  força: "gym",
  forca: "gym",
  musculacao: "gym",
  musculação: "gym",
  running: "running",
  run: "running",
  corrida: "running",
  football: "football",
  soccer: "football",
  futebol: "football",
  basket: "basketball",
  basketball: "basketball",
  basquete: "basketball",
  yoga: "yoga",
  mobility: "mobility",
  mobilidade: "mobility",
  recovery: "recovery",
};

export function normalizeSport(s?: string | null): SportKey {
  if (!s) return "generic";
  const k = s.trim().toLowerCase();
  return SPORT_ALIAS[k] ?? "generic";
}

type Props = {
  sport?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** secondary, smaller reference avatar shown beside the main one */
  showReference?: boolean;
  className?: string;
  /** show ground/floor circle */
  ground?: boolean;
  paused?: boolean;
};

const SIZE_PX: Record<NonNullable<Props["size"]>, number> = {
  xs: 56,
  sm: 96,
  md: 160,
  lg: 240,
  xl: 360,
};

/**
 * Pure-SVG, neutral humanoid avatar. Looped sport-specific motion via SMIL
 * (animateTransform / animate) so it renders deterministically with no JS.
 * Monochrome — bone strokes/fills on transparent background, matches the
 * app's premium dark UI.
 */
export function SportAvatar({
  sport,
  size = "md",
  showReference = false,
  className,
  ground = true,
  paused = false,
}: Props) {
  const key = normalizeSport(sport);
  const px = SIZE_PX[size];
  return (
    <div className={["inline-flex items-end gap-3", className ?? ""].join(" ")}> 
      <AvatarStage px={px} sport={key} ground={ground} paused={paused} />
      {showReference && (
        <AvatarStage px={Math.round(px * 0.42)} sport={key} ground={ground} paused={paused} dim />
      )}
    </div>
  );
}

function AvatarStage({
  px,
  sport,
  ground,
  paused,
  dim,
}: {
  px: number;
  sport: SportKey;
  ground: boolean;
  paused: boolean;
  dim?: boolean;
}) {
  return (
    <div
      className="relative inline-block select-none"
      style={{ width: px, height: px }}
      aria-hidden
    >
      {/* glow / floor */}
      {ground && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 4,
            width: px * 0.7,
            height: px * 0.06,
            background:
              "radial-gradient(50% 100% at 50% 50%, oklch(1 0 0 / 0.18), transparent 70%)",
            filter: "blur(2px)",
          }}
        />
      )}
      <svg
        viewBox="0 0 200 200"
        width={px}
        height={px}
        className={dim ? "opacity-70" : ""}
        style={paused ? { ["--play-state" as any]: "paused" } : undefined}
      >
        <defs>
          <linearGradient id="avatar-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.985 0 0)" />
            <stop offset="100%" stopColor="oklch(0.78 0 0)" />
          </linearGradient>
        </defs>
        <SportFigure sport={sport} />
      </svg>
    </div>
  );
}

/* ---------- Figures per sport ---------- */
/* All figures share base proportions: head ~r6 at y=42, torso, two arms,
   two legs. Animations differ per sport. SMIL animates transforms on
   named groups so motion stays smooth and looped. */

function SportFigure({ sport }: { sport: SportKey }) {
  switch (sport) {
    case "tennis":
      return <Tennis />;
    case "gym":
    case "strength":
      return <Gym />;
    case "running":
      return <Running />;
    case "football":
      return <Football />;
    case "basketball":
      return <Basketball />;
    case "yoga":
    case "mobility":
    case "recovery":
      return <Yoga />;
    default:
      return <Generic />;
  }
}

function Body() {
  // shared head + torso (no limbs — limbs are per-figure)
  return (
    <g>
      <circle cx="100" cy="48" r="9" fill="url(#avatar-body)" />
      <path
        d="M100 60 L100 108"
        stroke="url(#avatar-body)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </g>
  );
}

const stroke = {
  stroke: "url(#avatar-body)",
  strokeWidth: 6,
  strokeLinecap: "round" as const,
  fill: "none",
};

/* TENNIS — torso sway, racket-arm swing forehand loop */
function Tennis() {
  return (
    <g>
      <Body />
      {/* legs — split stance with subtle bounce */}
      <g>
        <path d="M100 108 L84 150" {...stroke} />
        <path d="M100 108 L118 150" {...stroke} />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 -2; 0 0"
          dur="1.6s"
          repeatCount="indefinite"
        />
      </g>
      {/* non-racket arm — steady balance */}
      <path d="M100 72 L78 96" {...stroke} />
      {/* racket arm */}
      <g style={{ transformOrigin: "100px 72px" }}>
        <path d="M100 72 L132 92" {...stroke} />
        {/* racket */}
        <g transform="translate(132 92)">
          <line x1="0" y1="0" x2="14" y2="10" {...stroke} />
          <ellipse cx="20" cy="14" rx="9" ry="11" {...stroke} />
        </g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-70 100 72; 40 100 72; -70 100 72"
          keyTimes="0; 0.55; 1"
          dur="1.6s"
          repeatCount="indefinite"
        />
      </g>
    </g>
  );
}

/* GYM / STRENGTH — squat with barbell */
function Gym() {
  return (
    <g>
      <Body />
      {/* arms holding bar overhead/across shoulders */}
      <path d="M100 70 L78 70" {...stroke} />
      <path d="M100 70 L122 70" {...stroke} />
      <line x1="60" y1="64" x2="140" y2="64" {...stroke} />
      <circle cx="56" cy="64" r="6" {...stroke} />
      <circle cx="144" cy="64" r="6" {...stroke} />
      {/* legs squat */}
      <g style={{ transformOrigin: "100px 108px" }}>
        <path d="M100 108 L84 138 L82 158" {...stroke} />
        <path d="M100 108 L116 138 L118 158" {...stroke} />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 14; 0 0"
          keyTimes="0; 0.5; 1"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </g>
    </g>
  );
}

/* RUNNING — opposite arm/leg swing */
function Running() {
  return (
    <g>
      {/* slight forward lean */}
      <g transform="rotate(-8 100 100)">
        <Body />
        {/* arms */}
        <g style={{ transformOrigin: "100px 72px" }}>
          <path d="M100 72 L82 96" {...stroke} />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-50 100 72; 50 100 72; -50 100 72"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </g>
        <g style={{ transformOrigin: "100px 72px" }}>
          <path d="M100 72 L118 96" {...stroke} />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="50 100 72; -50 100 72; 50 100 72"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </g>
        {/* legs */}
        <g style={{ transformOrigin: "100px 108px" }}>
          <path d="M100 108 L84 148" {...stroke} />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="40 100 108; -30 100 108; 40 100 108"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </g>
        <g style={{ transformOrigin: "100px 108px" }}>
          <path d="M100 108 L116 148" {...stroke} />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-30 100 108; 40 100 108; -30 100 108"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </g>
      </g>
    </g>
  );
}

/* FOOTBALL — kicking motion + ball */
function Football() {
  return (
    <g>
      <Body />
      <path d="M100 72 L80 96" {...stroke} />
      <path d="M100 72 L120 94" {...stroke} />
      {/* planted leg */}
      <path d="M100 108 L92 152" {...stroke} />
      {/* kicking leg */}
      <g style={{ transformOrigin: "100px 108px" }}>
        <path d="M100 108 L120 148" {...stroke} />
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-40 100 108; 50 100 108; -40 100 108"
          keyTimes="0; 0.45; 1"
          dur="1.4s"
          repeatCount="indefinite"
        />
      </g>
      {/* ball */}
      <g>
        <circle cx="150" cy="158" r="8" {...stroke} />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; -22 -10; 0 0"
          keyTimes="0; 0.45; 1"
          dur="1.4s"
          repeatCount="indefinite"
        />
      </g>
    </g>
  );
}

/* BASKETBALL — dribble */
function Basketball() {
  return (
    <g>
      <Body />
      {/* defensive stance arms */}
      <path d="M100 72 L72 92" {...stroke} />
      {/* dribble arm */}
      <g style={{ transformOrigin: "100px 72px" }}>
        <path d="M100 72 L130 110" {...stroke} />
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 100 72; 22 100 72; 0 100 72"
          dur="0.7s"
          repeatCount="indefinite"
        />
      </g>
      {/* legs split */}
      <path d="M100 108 L84 150" {...stroke} />
      <path d="M100 108 L116 150" {...stroke} />
      {/* ball bouncing */}
      <g>
        <circle cx="138" cy="130" r="8" {...stroke} />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 22; 0 0"
          dur="0.7s"
          repeatCount="indefinite"
        />
      </g>
    </g>
  );
}

/* YOGA / MOBILITY — slow breathing reach */
function Yoga() {
  return (
    <g>
      <g style={{ transformOrigin: "100px 100px" }}>
        <Body />
        {/* arms reach overhead with slow rise */}
        <g style={{ transformOrigin: "100px 70px" }}>
          <path d="M100 70 L70 90" {...stroke} />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-10 100 70; -90 100 70; -10 100 70"
            dur="4.5s"
            repeatCount="indefinite"
          />
        </g>
        <g style={{ transformOrigin: "100px 70px" }}>
          <path d="M100 70 L130 90" {...stroke} />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="10 100 70; 90 100 70; 10 100 70"
            dur="4.5s"
            repeatCount="indefinite"
          />
        </g>
        {/* legs grounded together */}
        <path d="M100 108 L92 152" {...stroke} />
        <path d="M100 108 L108 152" {...stroke} />
        {/* slight breathing scale */}
        <animateTransform
          attributeName="transform"
          type="scale"
          additive="sum"
          values="1 1; 1 1.02; 1 1"
          dur="4.5s"
          repeatCount="indefinite"
        />
      </g>
    </g>
  );
}

/* GENERIC — idle breathing */
function Generic() {
  return (
    <g>
      <Body />
      <path d="M100 70 L78 96" {...stroke} />
      <path d="M100 70 L122 96" {...stroke} />
      <path d="M100 108 L88 150" {...stroke} />
      <path d="M100 108 L112 150" {...stroke} />
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0 0; 0 -2; 0 0"
        dur="3s"
        repeatCount="indefinite"
      />
    </g>
  );
}

export default SportAvatar;