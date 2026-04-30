import { ChevronLeft, MoreHorizontal, Activity, Heart, Dumbbell, Droplet } from "lucide-react";

export function AppScreenStats() {
  const bars = [44, 34, 47, 110, 32, 79, 24];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const max = 120;
  return (
    <div className="flex h-full w-full flex-col bg-card px-4 pt-10 text-foreground">
      <div className="flex items-center justify-between px-2 pb-2 text-[10px] font-semibold">
        <span>9:41</span>
        <span className="opacity-60">●●● ▮</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><ChevronLeft className="h-4 w-4" /></div>
        <p className="text-[13px] font-semibold">Statistic</p>
        <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><MoreHorizontal className="h-4 w-4" /></div>
      </div>

      {/* Calories card */}
      <div className="mt-3 rounded-2xl bg-secondary p-4">
        <p className="text-[10px] font-medium text-muted-foreground">Calories</p>
        <div className="flex items-end justify-between">
          <p className="text-[26px] font-bold leading-none">1250 <span className="text-[11px] font-normal text-muted-foreground">Kcal</span></p>
          <p className="text-[9px] text-muted-foreground">Target: <span className="font-semibold text-foreground">1920</span> Kcal</p>
        </div>

        {/* chart */}
        <div className="mt-3 flex h-28 items-end justify-between gap-1.5">
          {bars.map((v, i) => {
            const isActive = i === 3;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className={`text-[8px] font-semibold ${isActive ? "text-accent-foreground" : "text-muted-foreground"}`}>{v}%</span>
                <div className="relative flex w-full justify-center">
                  <div className="w-1 rounded-full bg-border" style={{ height: `${(v / max) * 80}px` }} />
                  <div className={`absolute bottom-0 w-2.5 rounded-full ${isActive ? "bg-accent" : "bg-accent/40"}`} style={{ height: `${(v / max) * 80}px` }} />
                </div>
                <span className={`text-[8px] ${isActive ? "font-semibold" : "text-muted-foreground"}`}>{labels[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* metrics grid */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetricCard icon={<Activity className="h-3.5 w-3.5 text-emerald-600" />} label="Exercise" value="2.0" unit="hours" />
        <MetricCard icon={<Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />} label="BPM" value="86" unit="bpm" />
        <MetricCard icon={<Dumbbell className="h-3.5 w-3.5 text-amber-600" />} label="Weight" value="72" unit="kg" />
        <MetricCard icon={<Droplet className="h-3.5 w-3.5 fill-sky-400 text-sky-400" />} label="Water" value="1.8" unit="L" />
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl bg-secondary p-3">
      <div className="flex items-center gap-1.5">
        <div className="grid h-6 w-6 place-items-center rounded-full bg-card">{icon}</div>
        <p className="text-[10px] font-medium">{label}</p>
      </div>
      <p className="mt-2 text-[14px] font-bold">{value} <span className="text-[9px] font-normal text-muted-foreground">{unit}</span></p>
    </div>
  );
}
