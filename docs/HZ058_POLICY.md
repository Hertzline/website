# Hertzline HZ-058 -- Forbidden-claim and anti-cheat policy freeze (website)

Frozen 2026-11-15. Changing this policy needs a new roadmap task and owner review.
Source of truth: workspace `RULES.md` / `PROJECT_SPEC.md` Strictly forbidden.
App twin: `Hertzline/app` `docs/HZ058_POLICY.md`.

## Forbidden claims (site copy)

English and Italian product pages, docs, and shared data must not assert:

- Any `+N FPS` or `+N% FPS` marketing number without the user's own measured result
- Cross-machine "average FPS gains"
- Guaranteed or instant FPS / boost language
- Fake testimonials or invented benchmark stats

Saying that Hertzline forbids "+X FPS" marketing is allowed. Inventing a numeric gain is not.

## Anti-cheat page (frozen requirements)

`/anti-cheat/` and `/it/anti-cheat/` must keep:

1. No injection
2. No memory reading
3. No game file modification
4. Overlay off by default when anti-cheat markers are present
5. Named systems: Easy Anti-Cheat / BattlEye / Vanguard / Ricochet (or Italian equivalents)

## Forbidden product surface (must stay documented)

How-it-works / security / FAQ must continue to exclude: registry FPS boost packs, Defender/mitigation disables, unmeasured TCP optimizers, BCDEdit, standby-list RAM cleaners, overclock/undervolt in v1, injection, default telemetry.

## Enforcement

- `scripts/check_hz058.mjs` greps `src/` copy and verifies anti-cheat pages
- `npm run check:hz058` in CI after build
