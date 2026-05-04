export type Profile = {
  name?: string;
  email?: string;
  photoDataUrl?: string;
  sport?: string;
  level?: "beginner" | "intermediate" | "advanced";
  goal?: string;
  frequency?: string;
  notifEnabled?: boolean;
  notifTime?: string; // "HH:MM"
};

const KEY = "courtmind.profile";

export function getProfile(): Profile {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function saveProfile(patch: Profile) {
  if (typeof window === "undefined") return;
  const next = { ...getProfile(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  try { window.dispatchEvent(new CustomEvent("courtmind:profile-updated")); } catch {}
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
