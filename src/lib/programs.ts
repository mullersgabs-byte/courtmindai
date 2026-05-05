// Pre-built training programs and exercises by sport.
// The order of weeks/sessions is curated — users do not pick exercises,
// they enroll in a program and follow its recommended sequence.

export type Exercise = {
  id: string;
  /** i18n key for the exercise name */
  nameKey: string;
  /** suggested duration in seconds for one set */
  seconds: number;
  /** short cue text key */
  cueKey: string;
};

export type ProgramSession = {
  id: string;
  titleKey: string;
  exercises: Exercise[]; // already in optimal order
};

export type Program = {
  id: string;
  sport: string; // canonical lower case
  titleKey: string;
  descriptionKey: string;
  weeks: number;
  sessionsPerWeek: number;
  level: "beginner" | "intermediate" | "advanced" | "all";
  sessions: ProgramSession[]; // template — repeated weekly with progression
};

/* ---------- Exercise pool per sport ---------- */

const E = (id: string, nameKey: string, seconds: number, cueKey: string): Exercise => ({
  id, nameKey, seconds, cueKey,
});

export const EXERCISES_BY_SPORT: Record<string, Exercise[]> = {
  tennis: [
    E("ten-1", "ex.tennis.shadow_forehand", 60, "ex.cue.tennis.forehand"),
    E("ten-2", "ex.tennis.shadow_backhand", 60, "ex.cue.tennis.backhand"),
    E("ten-3", "ex.tennis.serve_toss", 45, "ex.cue.tennis.serve"),
    E("ten-4", "ex.tennis.split_step", 40, "ex.cue.tennis.split"),
    E("ten-5", "ex.tennis.lateral_shuffle", 45, "ex.cue.tennis.shuffle"),
  ],
  padel: [
    E("pad-1", "ex.padel.bandeja", 60, "ex.cue.padel.bandeja"),
    E("pad-2", "ex.padel.vibora", 45, "ex.cue.padel.vibora"),
    E("pad-3", "ex.padel.wall_volley", 60, "ex.cue.padel.wall"),
    E("pad-4", "ex.padel.split_step", 40, "ex.cue.padel.split"),
  ],
  football: [
    E("fut-1", "ex.football.passing_form", 60, "ex.cue.football.pass"),
    E("fut-2", "ex.football.first_touch", 60, "ex.cue.football.touch"),
    E("fut-3", "ex.football.shooting_form", 45, "ex.cue.football.shoot"),
    E("fut-4", "ex.football.agility_ladder", 45, "ex.cue.football.ladder"),
  ],
  basketball: [
    E("bas-1", "ex.basket.dribble_low", 60, "ex.cue.basket.dribble"),
    E("bas-2", "ex.basket.shooting_form", 45, "ex.cue.basket.shoot"),
    E("bas-3", "ex.basket.lay_up", 45, "ex.cue.basket.layup"),
    E("bas-4", "ex.basket.defensive_slide", 45, "ex.cue.basket.def"),
  ],
  volleyball: [
    E("vol-1", "ex.volley.bump", 60, "ex.cue.volley.bump"),
    E("vol-2", "ex.volley.set", 60, "ex.cue.volley.set"),
    E("vol-3", "ex.volley.spike_approach", 45, "ex.cue.volley.spike"),
    E("vol-4", "ex.volley.block_jump", 45, "ex.cue.volley.block"),
  ],
  running: [
    E("run-1", "ex.run.high_knees", 45, "ex.cue.run.knees"),
    E("run-2", "ex.run.skip_a", 45, "ex.cue.run.skip"),
    E("run-3", "ex.run.stride", 60, "ex.cue.run.stride"),
    E("run-4", "ex.run.cooldown_jog", 90, "ex.cue.run.cool"),
  ],
  strength: [
    E("str-1", "ex.str.air_squat", 45, "ex.cue.str.squat"),
    E("str-2", "ex.str.push_up", 45, "ex.cue.str.push"),
    E("str-3", "ex.str.lunge", 45, "ex.cue.str.lunge"),
    E("str-4", "ex.str.plank", 45, "ex.cue.str.plank"),
    E("str-5", "ex.str.glute_bridge", 45, "ex.cue.str.bridge"),
  ],
  crossfit: [
    E("cf-1", "ex.cf.burpee", 45, "ex.cue.cf.burpee"),
    E("cf-2", "ex.cf.air_squat", 45, "ex.cue.cf.squat"),
    E("cf-3", "ex.cf.sit_up", 45, "ex.cue.cf.situp"),
    E("cf-4", "ex.cf.mountain_climber", 45, "ex.cue.cf.mc"),
  ],
  pilates: [
    E("pil-1", "ex.pil.hundred", 60, "ex.cue.pil.hundred"),
    E("pil-2", "ex.pil.roll_up", 60, "ex.cue.pil.rollup"),
    E("pil-3", "ex.pil.leg_circle", 60, "ex.cue.pil.circle"),
  ],
  yoga: [
    E("yog-1", "ex.yog.sun_salute", 90, "ex.cue.yog.sun"),
    E("yog-2", "ex.yog.warrior_2", 60, "ex.cue.yog.warrior"),
    E("yog-3", "ex.yog.downward_dog", 60, "ex.cue.yog.dog"),
  ],
  boxing: [
    E("box-1", "ex.box.jab_cross", 60, "ex.cue.box.jab"),
    E("box-2", "ex.box.hook", 45, "ex.cue.box.hook"),
    E("box-3", "ex.box.footwork", 60, "ex.cue.box.foot"),
  ],
  climbing: [
    E("clb-1", "ex.clb.hang", 30, "ex.cue.clb.hang"),
    E("clb-2", "ex.clb.toe_hook", 45, "ex.cue.clb.toe"),
    E("clb-3", "ex.clb.silent_feet", 60, "ex.cue.clb.feet"),
  ],
  golf: [
    E("glf-1", "ex.glf.posture", 60, "ex.cue.glf.posture"),
    E("glf-2", "ex.glf.half_swing", 60, "ex.cue.glf.half"),
    E("glf-3", "ex.glf.full_swing", 60, "ex.cue.glf.full"),
  ],
  swimming: [
    E("swm-1", "ex.swm.dryland_pull", 60, "ex.cue.swm.pull"),
    E("swm-2", "ex.swm.kick_drill", 60, "ex.cue.swm.kick"),
    E("swm-3", "ex.swm.streamline", 45, "ex.cue.swm.line"),
  ],
};

const sportKey = (s?: string): string => {
  const v = (s || "tennis").trim().toLowerCase();
  if (EXERCISES_BY_SPORT[v]) return v;
  // common labels from onboarding (Capitalised english)
  const map: Record<string, string> = {
    "tênis": "tennis", "padel": "padel", "padel/paddel": "padel",
    "futebol": "football", "fútbol": "football", "soccer": "football",
    "basquete": "basketball", "baloncesto": "basketball",
    "vôlei": "volleyball", "voleibol": "volleyball",
    "corrida": "running", "course": "running",
    "musculação": "strength", "fuerza": "strength", "force": "strength",
    "crossfit": "crossfit",
    "pilates": "pilates", "yoga": "yoga",
    "boxe": "boxing", "boxeo": "boxing", "boxe/luta": "boxing",
    "escalada": "climbing", "escalade": "climbing",
    "golfe": "golf", "golf": "golf",
    "natação": "swimming", "natación": "swimming", "natation": "swimming",
  };
  return map[v] ?? "strength";
};

export function exercisesForSport(sport?: string): Exercise[] {
  return EXERCISES_BY_SPORT[sportKey(sport)] ?? EXERCISES_BY_SPORT.strength;
}

/* ---------- Programs (curated multi-week journeys) ---------- */

function buildSessions(sport: string): ProgramSession[] {
  const list = EXERCISES_BY_SPORT[sport] ?? EXERCISES_BY_SPORT.strength;
  // Two complementary sessions per week, ordered for progression
  const half = Math.ceil(list.length / 2);
  return [
    { id: `${sport}-A`, titleKey: "program.session.a", exercises: list.slice(0, half) },
    { id: `${sport}-B`, titleKey: "program.session.b", exercises: list.slice(half) },
  ];
}

export const PROGRAMS: Program[] = (Object.keys(EXERCISES_BY_SPORT) as string[]).map((sport) => ({
  id: `${sport}-foundation-6w`,
  sport,
  titleKey: `program.${sport}.foundation.title`,
  descriptionKey: `program.${sport}.foundation.desc`,
  weeks: 6,
  sessionsPerWeek: 3,
  level: "all",
  sessions: buildSessions(sport),
}));

export function programsForSport(sport?: string): Program[] {
  const k = sportKey(sport);
  return PROGRAMS.filter((p) => p.sport === k);
}

export function recommendedProgram(sport?: string): Program | undefined {
  return programsForSport(sport)[0];
}

/* ---------- Enrollment storage ---------- */
const ENROLL_KEY = "courtmind.enrollment.v1";

export type Enrollment = {
  programId: string;
  startedAt: string; // ISO
  currentWeek: number;
  completedSessions: number;
};

export function getEnrollment(): Enrollment | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(ENROLL_KEY) || "null"); } catch { return null; }
}

export function enroll(programId: string): Enrollment {
  const e: Enrollment = {
    programId,
    startedAt: new Date().toISOString(),
    currentWeek: 1,
    completedSessions: 0,
  };
  localStorage.setItem(ENROLL_KEY, JSON.stringify(e));
  return e;
}

export function unenroll() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ENROLL_KEY);
}

export function getProgramById(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}
