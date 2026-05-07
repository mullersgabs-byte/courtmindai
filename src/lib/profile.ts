export type Profile = {
  name?: string;
  email?: string;
  sport?: string;
  difficulty?: string;
  goal?: string;
  height?: string;
  weight?: string;
  weeklyHours?: string;
  source?: string;
  level?: "beginner" | "intermediate" | "advanced";
  frequency?: string;
  notifEnabled?: boolean;
  notifTime?: string;
  onboarded?: boolean;
};

const KEY = "traino.profile";

export function getProfile(): Profile {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function saveProfile(patch: Profile) {
  if (typeof window === "undefined") return;
  const next = { ...getProfile(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  try { window.dispatchEvent(new CustomEvent("traino:profile-updated")); } catch {}
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
