# Premium Training UI + Real 3D Avatar System

## Goals (in priority order)

1. Replace the current stick-figure SVG avatar everywhere with a **real 3D humanoid** rendered via React Three Fiber, using the provided FBX animations.
2. Rebuild `/exercise` (and the entry from `/training`) into an **Apple-Fitness-style** training screen: prominent timer, large pause/continue, ring progress, and an exercise selector list.
3. Strict fallback policy: if 3D fails to load, render a clean 2D silhouette card. **Never** render the stick figure again. Remove `SportAvatar` stick SVG entirely.
4. Remove all emojis from UI strings across the app.

## 1. 3D Avatar System

### Dependencies (added via `bun add`)

- `three`
- `@react-three/fiber`
- `@react-three/drei`

(FBX loading uses `three/examples/jsm/loaders/FBXLoader` — already shipped with `three`, no extra package.)

### Assets

Copy the uploaded FBX files into `public/avatars/` (served statically):

```
public/avatars/
  push-up.fbx          (Push_Up_To_Idle.fbx)
  goalkeeper-side.fbx  (Goalkeeper_Sidestep_1_1.fbx)
  cross-jumps.fbx      (Cross_Jumps.fbx)
  baseball-strike.fbx  (Baseball_Strike_1.fbx)
  jog-back.fbx         (Jog_Backward_Diagonal_1.fbx)
```

(Duplicates `_-_Copia` / `-2` are ignored — same files.)

The FBX files include both mesh + rig + animation (Mixamo-style). We load the mesh from one canonical file and overlay other clips when the user switches movement.

### New component: `src/components/Avatar3D.tsx`

- Wraps a `<Canvas>` (R3F) with:
  - Soft three-point lighting (ambient + directional key + rim) — Apple Fitness vibe.
  - Neutral light-grey ground plane with contact shadow (`<ContactShadows>` from drei).
  - Camera: perspective, slight angle, auto-frames the model.
  - `<OrbitControls enableZoom={false} enablePan={false} />` for subtle interaction (optional).
- Loads an FBX via `useLoader(FBXLoader, url)`.
- Recolors all mesh materials to a clean white (`#FFFFFF`), `roughness: 0.55`, `metalness: 0.05`, removes textures (premium clean look, no face detail).
- Plays the embedded animation clip in a loop using `THREE.AnimationMixer`, advanced in `useFrame`.
- Props: `clipUrl: string`, `paused?: boolean`, `className?: string`.
- Suspense boundary + `<Loader2D />` fallback while the FBX downloads.
- `ErrorBoundary` → falls back to `<Avatar2D />` (no stick figure).

### New component: `src/components/Avatar2D.tsx`

A clean, premium **3D silhouette** (single SVG path of a human silhouette, soft gradient fill, subtle drop shadow). Used only as fallback. No lines, no stick limbs.

### Movement → clip mapping (`src/lib/avatarClips.ts`)

```ts
export const CLIPS = {
  pushup:    "/avatars/push-up.fbx",
  squat:     "/avatars/cross-jumps.fbx",   // closest available; biomechanical squat-jump
  plank:     "/avatars/push-up.fbx",       // hold pose / static (paused mixer)
  jogging:   "/avatars/jog-back.fbx",
  sprint:    "/avatars/jog-back.fbx",      // played at higher mixer.timeScale
  jab:       "/avatars/baseball-strike.fbx",
  jab_cross: "/avatars/baseball-strike.fbx",
  footwork:  "/avatars/goalkeeper-side.fbx",
  yoga:      "/avatars/push-up.fbx",       // static pose, paused
};
```

Each exercise in the app declares a `movement` key. Unknown sport → `footwork` default. Avatar component accepts `speed` to scale animation.

### Removal

- Delete the SVG body in `src/components/SportAvatar.tsx`. Replace its export with a thin wrapper that renders `<Avatar3D clipUrl={…}/>` so existing imports keep working.
- Remove the small "reference" mini-avatar grid (currently shows another stick figure).

## 2. Training Screen Rebuild

Rewrite `src/routes/exercise.tsx` (kept route, new layout). Add a small landing strip on `/training` that links into it with a chosen exercise.

### Layout (mobile-first, viewport 390px)

```text
┌──────────────────────────────┐
│  ← Back        Tennis · 03/12│
├──────────────────────────────┤
│                              │
│        [ 3D AVATAR ]         │
│      (full-bleed canvas)     │
│                              │
├──────────────────────────────┤
│       Lateral split-step     │
│                              │
│        ╭──────────╮          │
│        │  02:14    │ ring     │
│        ╰──────────╯          │
│                              │
│   [   Pause   ]  [ Skip ]    │
│                              │
├──────────────────────────────┤
│  EXERCISES                   │
│  ▸ Warm-up         · 5 min   │
│  ● Lateral split   · 4×30s   │
│  ▸ Push-ups        · 3×12    │
│  ▸ Sprint          · 6×20s   │
│  ▸ Cooldown        · 5 min   │
└──────────────────────────────┘
```

### Components / behavior

- **Timer**: keep existing `phase / setIdx / remaining` state. Big SF-mono digits; circular SVG progress ring; phase label (Get ready / Work / Rest / Complete).
- **Controls**: large pill buttons — primary `Pause` (toggles to `Resume`), secondary `Skip phase`, tertiary `Reset`.
- **Exercise selector**: vertical list of cards with name, type tag, duration. Click → loads that exercise's clip into the avatar and resets the timer to its config. Active row highlighted with a subtle hairline.
- **3D Canvas**: top section, ~45% viewport height on mobile, `aspect-[4/5]` on desktop. Pauses the animation mixer when `running === false`.

### Data

A small static array of exercises lives in `src/lib/exerciseLibrary.ts`:

```ts
{ id, name, type, sets, workSec, restSec, movement, sportTag }
```

`/training` "Start session" CTA navigates to `/exercise?id=...`.

## 3. App-wide Cleanup

- Remove emoji characters from any user-facing strings (scan `src/routes/*.tsx`, `src/components/*.tsx`, `src/lib/i18n.tsx`).
- Keep the existing pure black/white token system. Add a `--surface-soft` (very light grey) only for the 3D ground plane and exercise card hover.
- Confirm `home.tsx` "Today's session" card uses `<Avatar3D>` thumbnail (or omits avatar) — never the stick figure.

## Technical Notes

- **Bundle size**: three + drei ≈ 600KB gzipped. Acceptable for a fitness app whose hero is the 3D avatar. Lazy-load the `Avatar3D` component with `React.lazy` so the marketing/landing pages stay light.
- **SSR**: R3F is client-only. Wrap `<Avatar3D>` in a `typeof window !== 'undefined'` guard + `lazy` import to avoid SSR crashes in TanStack Start.
- **FBX served from `/public**`: works in TanStack Start dev + Cloudflare Worker prod (static assets). No special config.
- **No stick figure** ever rendered: `SportAvatar` becomes pure proxy → `Avatar3D` → on error → `Avatar2D` silhouette → on fatal error → `null`.

## Files

Created

- `src/components/Avatar3D.tsx`
- `src/components/Avatar2D.tsx`
- `src/lib/avatarClips.ts`
- `src/lib/exerciseLibrary.ts`
- `public/avatars/*.fbx` (5 files)

Edited

- `src/components/SportAvatar.tsx` (becomes thin wrapper, no SVG)
- `src/routes/exercise.tsx` (new layout: 3D + timer + selector)
- `src/routes/training.tsx` (link cards pass `?id=` to exercise)
- `src/routes/home.tsx` (replace any avatar usage; remove emojis)
- `package.json` (three, @react-three/fiber, @react-three/drei)

## Out of scope

- Custom Mixamo-quality animations for sports without source FBX (we map to the closest provided clip and label honestly — no fake/incorrect movements).
- Auth/security changes.