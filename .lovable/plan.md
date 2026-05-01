
# CourtMind Elite — Premium AI Training App

Pivot the current warm-beige editorial site into a **dark, elite athletic product**: black `#0B0B0B`, soft white `#F5F5F5`, signature **tennis green** accent. Apple-grade typography, Nike-grade energy. AI analysis is real (Lovable AI Gateway), not mocked.

## 1. Design system reset (`src/styles.css`)

- Repaint tokens to:
  - `--background: #0B0B0B` (soft black)
  - `--foreground: #F5F5F5` (soft white)
  - `--accent / --lime: #C6F24E` (soft tennis green) + `--lime-soft` glow
  - `--card: #141414`, `--muted-foreground: #8A8A8A`, hairline borders at `white/8`
- Keep Inter (display) + Instrument Serif (italic accents only, used sparingly)
- Add utilities: `.glass` (blurred dark card), `.ring-lime`, `.grain` (kept), shimmer/skeleton keyframes for "Analyzing…" state, smooth route transitions

## 2. Hero & landing (`src/routes/index.tsx` — full rewrite)

Sections, all dark:
1. **Sticky nav** — CourtMind Elite wordmark, links (Method · Features · Pricing), `Sign in` + lime pill `Start Your Analysis`
2. **Hero** — full-bleed AI-generated athlete photo (tennis serve, dramatic lighting) with black gradient overlay
   - H1: *"Train Smarter. Perform Better."* (huge, tight tracking, italic serif on "Better")
   - Sub: "AI-powered analysis for real athletes."
   - CTAs: lime `Start Your Analysis` → `/onboarding`, ghost `Watch Demo`
3. **Logo marquee** (silent credibility ticker)
4. **Features grid** (6 cards w/ lucide icons): Video Analysis, AI Coach Feedback, Performance Tracking, Custom Plans, Weekly Reports, Body Markers
5. **How it works** — 3 steps (Upload → Analyze → Improve)
6. **AI preview card** — mock score 82/100 with strengths/weaknesses (teaser)
7. **Pricing** — Monthly vs Annual (highlighted lime border, "Save 40%")
8. **Closing CTA** + footer

## 3. Onboarding flow (`src/routes/onboarding.tsx` — rebuilt, 5 steps)

Premium Duolingo-style with progress hairline + lime fill, smooth `float-up` per step:

1. **Auth** — Continue with Google / Apple / Email (large rounded buttons, Lucide brand icons). Stored locally for now (no backend auth yet).
2. **Sport** — Tennis · Gym · Running · Football (image cards, AI-generated)
3. **Level** — Beginner · Intermediate · Advanced · Competitive
4. **Frequency** — 2x · 3x · 5x · Daily
5. **Goal** — Performance · Aesthetic · Recovery · Competition

Persists choices to `localStorage` → routes to `/dashboard`.

## 4. Dashboard (`src/routes/dashboard.tsx` — rebuilt dark)

- Greeting with stored name + sport
- Two big action tiles: **Upload Video** (drag & drop, accepts mp4/mov) and **Describe Training** (textarea)
- Weekly progress chart (custom SVG line, lime stroke)
- Training history list
- AI insights summary card
- Performance evolution stat trio (Performance · Consistency · Evolution)
- "Start Training" lime CTA

## 5. AI analysis (real, via Lovable AI)

**Edge / server function**: `src/server/analyze.functions.ts` using `createServerFn` POST.
- Input: `{ mode: "video" | "text", description: string, sport, level, goal }`
- For video mode: client extracts filename + duration + a single frame (canvas → base64) and sends as image part. (True video analysis isn't supported by current models; we analyze the still + user description — clearly labeled.)
- Calls `https://ai.gateway.lovable.dev/v1/chat/completions` with `google/gemini-3-flash-preview`, **tool calling** to return structured JSON:
  ```
  { score, strengths[], weaknesses[], improvements[], plan[{day,focus,duration}], bodyMarkers[{label, x, y, status}] }
  ```
- Handles 429/402 → returns friendly error toasts.
- `LOVABLE_API_KEY` already provisioned.

**Analysis route** (`src/routes/analysis.tsx`):
- Loading state: full-screen "Analyzing your performance…" with rotating intelligent messages ("Reading footwork…", "Measuring tempo…", "Comparing to elite baseline…") + lime shimmer
- Result UI:
  - Big **Overall Score** ring (lime stroke SVG)
  - **Strengths** / **Weaknesses** / **Improvements** three-column premium cards
  - **Body markers** — athlete silhouette SVG with lime/red dots positioned from `bodyMarkers`
  - **Suggested plan** — 7-day list

## 6. Paywall

- Free user sees results **blurred** (`backdrop-blur-xl` over content) + lime "Unlock Full Analysis" CTA
- "Pro" flag in `localStorage` toggled by clicking Unlock (no real payment yet — placeholder, Stripe can be added later)
- Pricing cards on landing link to same toggle for now

## 7. Imagery

Generate (Lovable AI Gateway image model `google/gemini-3.1-flash-image-preview`) and store in `src/assets/`:
- `hero-athlete.jpg` — tennis serve, dark studio
- `sport-tennis.jpg`, `sport-gym.jpg`, `sport-running.jpg`, `sport-football.jpg`
- `analysis-pose.jpg` — athlete silhouette for body markers overlay

## 8. Micro-interactions

- All buttons: `transition-all duration-300 ease-out`, lime glow on hover
- Page transitions: `animate-float-up` on route mount
- Loading: shimmering hairline + cycling status text
- Hover lift on cards (`-translate-y-0.5` + ring-lime/20)

## Technical notes

- Delete current beige tokens; keep file names/structure (no router edits beyond adding `/analysis`).
- New routes: `/analysis`. Update `__root.tsx` meta to "CourtMind Elite — Train Smarter. Perform Better."
- Server function in `src/server/analyze.functions.ts` (uses `createServerFn`, `inputValidator` with zod, handler reads `process.env.LOVABLE_API_KEY`).
- Client uploads frame as base64 data URL → server forwards as `image_url` content part to AI gateway.
- Errors surfaced via `sonner` toasts.
- No auth backend yet (localStorage only) — flagged so we can wire Lovable Cloud auth later if you want.

## Open questions (will assume defaults if you don't answer)

- **Auth**: real Google/Apple sign-in via Lovable Cloud, or keep simulated for now? *Default: simulated.*
- **Payments**: wire Stripe for paywall now, or keep "Unlock" as a demo toggle? *Default: demo toggle.*

Approve and I'll build it end-to-end.
