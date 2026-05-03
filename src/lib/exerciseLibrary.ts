import type { MovementKey } from "./avatarClips";

export type Exercise = {
  id: string;
  name: string;
  type: string;
  sets: number;
  workSec: number;
  restSec: number;
  movement: MovementKey;
  sportTag: string;
};

export const EXERCISES: Exercise[] = [
  { id: "warmup",   name: "Warm-up jog",       type: "Cardio",      sets: 1, workSec: 180, restSec: 30, movement: "jogging", sportTag: "Running" },
  { id: "footwork", name: "Lateral split-step", type: "Footwork",    sets: 4, workSec: 30,  restSec: 15, movement: "footwork", sportTag: "Tennis" },
  { id: "pushup",   name: "Push-ups",           type: "Calisthenics",sets: 3, workSec: 40,  restSec: 20, movement: "pushup",   sportTag: "Strength" },
  { id: "squat",    name: "Squat jumps",        type: "Power",       sets: 4, workSec: 30,  restSec: 20, movement: "squat",    sportTag: "Strength" },
  { id: "plank",    name: "Plank hold",         type: "Core",        sets: 3, workSec: 45,  restSec: 20, movement: "plank",    sportTag: "Core" },
  { id: "sprint",   name: "Sprint intervals",   type: "Cardio",      sets: 6, workSec: 20,  restSec: 40, movement: "sprint",   sportTag: "Running" },
  { id: "jab",      name: "Jab",                type: "Boxing",      sets: 4, workSec: 30,  restSec: 20, movement: "jab",      sportTag: "Boxing" },
  { id: "combo",    name: "Jab + Cross",        type: "Boxing",      sets: 4, workSec: 30,  restSec: 20, movement: "jab_cross", sportTag: "Boxing" },
  { id: "yoga",     name: "Yoga hold",          type: "Mobility",    sets: 1, workSec: 120, restSec: 30, movement: "yoga",     sportTag: "Yoga" },
];

export function findExercise(id?: string | null): Exercise {
  return EXERCISES.find((e) => e.id === id) ?? EXERCISES[1];
}