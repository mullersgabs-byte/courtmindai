# Remove Gold Accent — Pure Black & White Elite Palette

The user wants the gold (#C6A962) accent removed. We'll pivot to a strictly monochrome luxury palette — black, soft white, and subtle platinum/silver hairlines. This keeps the "Apple-level" minimal premium feel without warm metallic tones.

## New Palette

- **Ink** `#0B0B0B` — primary background (unchanged)
- **Bone** `#F5F5F5` — primary foreground (unchanged)
- **Platinum** `#E8E8E8` — accent / highlights (replaces gold)
- **Smoke** subtle white-on-black hairlines for borders & dividers

All `--gold` / `--gold-soft` tokens become `--platinum` / `--platinum-soft` (cool neutral, no hue).

## Changes

### 1. `src/styles.css`
- Remove `--gold` and `--gold-soft` variables; introduce `--platinum` (oklch ~0.92 0 0) and `--platinum-soft` (oklch ~0.82 0 0).
- Update `--accent`, `--ring`, and `::selection` to use bone/platinum instead of gold.
- Replace utility classes:
  - `.text-gold` → `.text-platinum`
  - `.bg-gold` → `.bg-platinum`
  - `.border-gold` → `.border-platinum`
  - `.gold-gradient` → `.platinum-gradient` (white→platinum→soft gray)
  - `.text-gold-gradient` → `.text-platinum-gradient`
  - `.glow-gold` → `.glow-soft` (neutral white glow)
- Replace `@keyframes pulse-gold` and `.animate-shimmer` colors with neutral white/platinum tones (rename to `pulse-soft`).

### 2. `src/routes/__root.tsx`
- Swap `text-gold-gradient` on the 404 page for `text-platinum-gradient` (or plain bone).
- Update theme-color meta if it referenced gold.

### 3. Hydration error fix (quiet)
- Dashboard renders `new Date()` formatted in header → causes SSR/client mismatch. Wrap the date label in a `useEffect` + state (render empty on SSR) or use `suppressHydrationWarning`.

## Result

Pure monochrome elite aesthetic — black canvas, soft white type, cool platinum accents for buttons/rings/highlights. No warm gold anywhere. Existing layouts, typography (Instrument Serif + Inter), animations, and imagery remain intact.

https://chatgpt.com/s/m_69f6b65ff27c819191004626a7e244fb
export default function Logo() {
  return (
    <svg width="120" height="120" viewBox="0 0 200 200">
      <style>{`
        .bg { fill: white; }
        .stroke { stroke: black; }
        .dot { fill: black; }

        @media (prefers-color-scheme: dark) {
          .bg { fill: black; }
          .stroke { stroke: white; }
          .dot { fill: white; }
        }
      `}</style>

      <rect width="200" height="200" className="bg" />

      <path
        d="M140 40 A60 60 0 1 0 140 160"
        fill="none"
        className="stroke"
        strokeWidth="30"
        strokeLinecap="round"
      />

      <circle cx="155" cy="100" r="10" className="dot" />
    </svg>
  );
}
