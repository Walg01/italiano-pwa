# Product

## Register

product

## Users

A single user: a Spanish-speaking architecture student preparing for the PLIDA B2 Italian exam (18 marzo 2027) while also applying to a dual-degree exchange at Politecnico di Torino. Irregular schedule with deadline spikes (architecture coursework). Uses the app in short, high-frequency bursts: a 20-minute hard-capped SRS review most mornings (often on a phone, in transit or between tasks), plus a session-prep screen used before longer study sessions with Claude Code, and a history/hours screen checked periodically to track weekly quota and debt/credit.

## Product Purpose

A personal PWA that replaces Anki for spaced-repetition review of ~1000 Italian vocabulary cards (SM-2 scheduling), and supports the surrounding study system: a daily checklist, weekly hour tracking against quota, active error tracking (max 3 at a time), and a "session" screen that assembles a prompt to hand off to Claude Code for the day's study session. Success = the user actually opens it every day, finishes the 20-minute cap without friction, and trusts the numbers (streak, hours, errors) enough to act on them honestly.

## Brand Personality

Warm but firm. Not soft/gamified, not cold/clinical. The tone mirrors the study philosophy behind the system: brutal honesty over encouragement, production over recognition, precision over decoration. Numbers (hours, streak, error count) should read as firm/serious facts, not celebratory. Warmth comes through color and type choice, not through soft language or playful motion.

## Anti-references

- Duolingo-style gamification (mascots, cheerful copy, badge/confetti explosions) — wrong tone for an exam-serious tool.
- Generic dark SaaS dashboard look (this was the previous direction: near-black bg, GitHub-dark palette, Inter, glow buttons) — explicitly moving away from dark theme.
- AI-slop defaults: purple/violet gradients, Inter as the default typeface, nested nearly-identical cards stacked vertically, ghost-card pattern (1px border + wide soft shadow together), oversized border-radius (24px+) on cards.

## Design Principles

1. **Numbers are the interface.** Hours, streak, error count, card counts are the primary content on most screens — treat them as first-class typography, not small labels next to icons.
2. **20 minutes is sacred.** The SRS review screen (flashcards tab) is used under a hard timer, often one-handed on a phone. It must be the calmest, most legible, least decorated screen in the app — nothing competes with the card itself.
3. **Honesty over encouragement.** Debt shows as debt, errors show as errors, in color and language. No softening copy, no fake positivity.
4. **One committed color, not a palette of five.** Warmth should come from a single deliberate accent carrying real weight (not a rainbow of status colors used decoratively).
5. **Every screen serves the daily habit loop**, not a marketing narrative — no hero sections, no persuasive copy, just the fastest path to today's task.

## Accessibility & Inclusion

WCAG AA standard (≥4.5:1 body text, ≥3:1 large text/UI). Respect `prefers-reduced-motion`. No specific additional accessibility requirements from the user; used in normal daylight and evening conditions, not exclusively in the dark, so contrast must hold up in bright ambient light too (this was the reason to move off the near-black theme).
