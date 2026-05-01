export type Profile = {
  name?: string;
  email?: string;
  sport?: string;
  level?: string;
  frequency?: string;
  goal?: string;
  pro?: boolean;
};

const KEY = "courtmind.profile.v1";

export function getProfile(): Profile {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function saveProfile(patch: Profile) {
  if (typeof window === "undefined") return;
  const next = { ...getProfile(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
