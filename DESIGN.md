# Design

## Theme

Light. Previous version was a near-black GitHub-dark palette (#0D1117/#161B22 + neon green/glow accents); moving off dark by explicit request. The app is used in normal daylight and evening light, not exclusively at night, so contrast has to hold in bright ambient conditions — dark theme was optimizing for a use case (dark room, phone at night) that isn't the actual primary one.

Color strategy: **Committed**. One saturated color (terracotta/rust — the color of Italian terra cotta roofs) carries real visual weight across primary actions, progress indicators, and key numbers. It is not a decorative accent buried among five status colors.

## Color Tokens (OKLCH)

```css
--bg:          oklch(98% 0.002 90);   /* true off-white, chroma ~0 — not the cream/sand AI-default */
--surface:     oklch(97% 0.006 55);   /* card surface, faint warm tint toward terra hue */
--surface-2:   oklch(94% 0.008 55);   /* inputs, recessed areas */
--border:      oklch(88% 0.012 50);

--ink:         oklch(24% 0.025 40);   /* primary text — warm near-black, not flat gray/black */
--ink-2:       oklch(48% 0.02 40);    /* secondary text */
--ink-3:       oklch(68% 0.015 45);   /* tertiary / placeholder-adjacent labels */

--terra:       oklch(52% 0.16 40);    /* primary brand color — buttons, active nav, rings, streaks */
--terra-deep:  oklch(40% 0.15 38);    /* pressed/active state, headers-on-terra */
--terra-tint:  oklch(93% 0.035 45);   /* light wash for badges/chips on --bg */

--olive:       oklch(48% 0.09 135);   /* secondary accent: "done/correct", replaces neon green */
--olive-tint:  oklch(93% 0.03 130);

--red:         oklch(50% 0.19 25);    /* errors, debt — firm brick/oxblood, not candy red */
--red-tint:    oklch(95% 0.03 25);

--slate:       oklch(55% 0.03 250);   /* quiet neutral accent for non-primary info (sync/status) */
```

Rules:
- Body/page background is neutral (chroma ≈ 0). Warmth is carried by `--terra` and typography, never by tinting the page bg toward cream.
- Gray-on-color is banned: text on `--terra` uses `#fff` or `--terra-deep`'s complementary light tint, never `--ink-3` gray.
- `--red` and `--terra` sit in the same warm hue family on purpose (terracotta ↔ oxblood) so the palette reads as one considered family, not five arbitrary status colors.

## Typography

- **Display** (big numbers, module titles, screen titles): `Fraunces` (variable, optical size axis). A soft-contrast serif — carries the "warm" half of the personality without slipping into gamified/rounded. Used for: hours value, streak/ring numbers, module title, screen headers (Historial, Setup), SRS keyword front/back.
- **UI / body** (labels, buttons, inputs, list text, paragraphs): `Public Sans`. Humanist grotesque, distinct from Inter, tuned for small-size mobile legibility.
- **Mono** (timer, prompt/briefing textarea): system stack `'SF Mono', 'Cascadia Code', ui-monospace, monospace` — unchanged, functional not decorative.

Pairing logic: serif display + humanist sans body is a deliberate contrast axis (not two similar grotesques), and it's the one place personality lives — everything else stays quiet so the 20-minute SRS screen doesn't compete with itself.

Scale keeps the existing step sizes (11/12/13/15/16/20/22/24/28/30/34px) — the hierarchy was already reasonable; only the family and color change.

## Components

- **Cards**: single-level only (`--surface` bg, 1px `--border`, radius 16px/12px/6px as already scaled). No nested cards. No shadow + border combined — cards get a border, zero shadow.
- **Primary button** (`cta-btn`, `submit-btn`): solid `--terra` fill, white text, radius 16px/10px, no box-shadow (removed the glow-shadow pattern). Active state darkens to `--terra-deep` + scale(.97).
- **Secondary button**: `--surface-2` fill, `--border` outline, `--ink` text.
- **Danger button**: `--red-tint` fill, `--red` text/border.
- **Progress bars / rings**: solid `--terra`, no gradient fill (removes the green→terra gradient that read as decorative).
- **Chips/badges**: tint bg + solid text of the same hue (`--terra-tint`/`--terra`, `--olive-tint`/`--olive`, `--red-tint`/`--red`).
- **Bottom nav**: `--surface` bg (was translucent dark blur) with `--border` top hairline; active item in `--terra`.

## Motion

Existing staggered `fade-up` entrance on dashboard cards is legitimate (distinct items revealing in sequence, not a uniform page-wide reflex) — kept, retimed to an expo ease-out. Every transition gets a `prefers-reduced-motion: reduce` fallback (instant/opacity-only) — this was missing before and is now required sitewide.

## Anti-patterns fixed in this pass

- Default `Inter` typeface → replaced with `Fraunces` + `Public Sans`.
- Dark near-black theme → light theme, neutral-chroma body bg (not the cream/sand AI default).
- Glow box-shadows on buttons/CTAs → flat fill, no shadow.
- Gradient progress fills → solid `--terra`.
- Missing `prefers-reduced-motion` handling → added.
