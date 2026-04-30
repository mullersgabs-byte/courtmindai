import { Flame, Footprints, Droplet, Calendar, ChevronLeft, ChevronRight, Plus, Home, BarChart3, Trophy, Menu, Maximize2 } from "lucide-react";

export function AppScreenHome() {
  return (
    <div className="flex h-full w-full flex-col bg-card px-4 pt-10 text-foreground">
      {/* status bar */}
      <div className="flex items-center justify-between px-2 pb-2 text-[10px] font-semibold">
        <span>9:41</span>
        <span className="opacity-60">●●● ▮</span>
      </div>

      {/* header */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-secondary ring-1 ring-border" />
          <div className="leading-tight">
            <p className="text-[10px] text-muted-foreground">Good morning</p>
            <p className="text-[12px] font-semibold">Alex Carter</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><Calendar className="h-3.5 w-3.5" /></div>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary">🔔</div>
        </div>
      </div>

      {/* hero card */}
      <div className="mt-4 rounded-2xl bg-accent p-3.5 text-accent-foreground">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-medium opacity-80">⚡ Daily intake</p>
            <p className="mt-1 text-[15px] font-bold leading-tight">Your Weekly<br/>Progress</p>
          </div>
          <div className="relative grid h-14 w-14 place-items-center rounded-full bg-card text-center">
            <div>
              <p className="text-[14px] font-bold leading-none">6</p>
              <p className="text-[8px] opacity-70">days</p>
            </div>
          </div>
        </div>
      </div>

      {/* stats row */}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-secondary p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium">Step to walk</p>
            <Footprints className="h-3.5 w-3.5 text-orange-500" />
          </div>
          <p className="mt-2 text-[14px] font-bold">5,500 <span className="text-[9px] font-normal text-muted-foreground">steps</span></p>
        </div>
        <div className="rounded-2xl bg-secondary p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium">Drink Water</p>
            <Droplet className="h-3.5 w-3.5 fill-sky-400 text-sky-400" />
          </div>
          <p className="mt-2 text-[14px] font-bold">12 <span className="text-[9px] font-normal text-muted-foreground">glass</span></p>
        </div>
      </div>

      {/* calendar */}
      <div className="mt-2.5 rounded-2xl bg-secondary p-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold">August 2025</p>
          <div className="flex gap-1">
            <div className="grid h-5 w-5 place-items-center rounded-full bg-card"><ChevronLeft className="h-3 w-3" /></div>
            <div className="grid h-5 w-5 place-items-center rounded-full bg-card"><ChevronRight className="h-3 w-3" /></div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} className="text-[8px] text-muted-foreground">{d}</div>
          ))}
          {["07","08","09","10","11","12","13"].map((n) => (
            <div key={n} className={`grid place-items-center rounded-full py-1 text-[10px] font-semibold ${n === "10" ? "bg-accent text-accent-foreground" : "bg-card"}`}>{n}</div>
          ))}
        </div>
      </div>

      {/* meal */}
      <div className="mt-2.5 flex items-center justify-between rounded-2xl bg-secondary p-2.5">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <div>
            <p className="text-[10px] font-semibold">Breakfast</p>
            <p className="text-[9px] text-muted-foreground">456 - 512 kcal</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-7 rounded-lg bg-orange-200" />
          <div className="grid h-6 w-6 place-items-center rounded-full bg-card"><Plus className="h-3 w-3" /></div>
        </div>
      </div>

      {/* tab bar */}
      <div className="mt-auto flex items-center justify-around pt-3 pb-2">
        {[Home, BarChart3, null, Trophy, Menu].map((Icon, i) =>
          Icon === null ? (
            <div key={i} className="-mt-5 grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg">
              <Maximize2 className="h-4 w-4" />
            </div>
          ) : (
            <Icon key={i} className={`h-4 w-4 ${i === 0 ? "text-foreground" : "text-muted-foreground"}`} />
          )
        )}
      </div>
    </div>
  );
}
