const KEY_LAST = "courtmind.notif.last";

export function notifSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotifPermission(): Promise<NotificationPermission> {
  if (!notifSupported()) return "denied";
  if (Notification.permission === "granted" || Notification.permission === "denied") return Notification.permission;
  return await Notification.requestPermission();
}

export function notifPermission(): NotificationPermission {
  if (!notifSupported()) return "denied";
  return Notification.permission;
}

export function showLocalNotification(title: string, body: string) {
  if (!notifSupported() || Notification.permission !== "granted") return;
  try { new Notification(title, { body, tag: "courtmind-daily" }); } catch {}
}

/** Foreground scheduler: while app/tab is open, fire a daily reminder at HH:MM if not already fired today. */
export function startDailyReminder(time: string, title: string, body: string) {
  if (!notifSupported()) return () => {};
  const tick = () => {
    if (Notification.permission !== "granted") return;
    const now = new Date();
    const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return;
    const todayKey = now.toISOString().slice(0, 10);
    const last = localStorage.getItem(KEY_LAST);
    if (last === todayKey) return;
    if (now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm)) {
      showLocalNotification(title, body);
      localStorage.setItem(KEY_LAST, todayKey);
    }
  };
  tick();
  const id = window.setInterval(tick, 60_000);
  return () => window.clearInterval(id);
}
