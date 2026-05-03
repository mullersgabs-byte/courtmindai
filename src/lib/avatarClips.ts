export type MovementKey =
  | "pushup"
  | "squat"
  | "plank"
  | "jogging"
  | "sprint"
  | "jab"
  | "jab_cross"
  | "footwork"
  | "yoga";

export const CLIPS: Record<MovementKey, string> = {
  pushup: "/avatars/push-up.fbx",
  squat: "/avatars/cross-jumps.fbx",
  plank: "/avatars/push-up.fbx",
  jogging: "/avatars/jog-back.fbx",
  sprint: "/avatars/jog-back.fbx",
  jab: "/avatars/baseball-strike.fbx",
  jab_cross: "/avatars/baseball-strike.fbx",
  footwork: "/avatars/goalkeeper-side.fbx",
  yoga: "/avatars/push-up.fbx",
};

export const SPEED: Partial<Record<MovementKey, number>> = {
  sprint: 1.6,
  jogging: 1.0,
  jab_cross: 1.2,
  yoga: 0,
  plank: 0,
};

export function clipFor(movement?: string): string {
  const k = (movement ?? "footwork") as MovementKey;
  return CLIPS[k] ?? CLIPS.footwork;
}

export function speedFor(movement?: string): number {
  const k = (movement ?? "footwork") as MovementKey;
  return SPEED[k] ?? 1;
}