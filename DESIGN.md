# Hertzline website design system

HZ-041. Tokens live in `src/styles/design-tokens.css` and map onto Starlight `--sl-*` variables.

## Direction

Precision instrument / signal lab. Cool green-gray neutrals, teal accent (frequency), amber signal for CTA emphasis. Solid surfaces only. No purple gradients, no glassmorphism, no emoji.

## Type pair

| Role | Family | Source | License |
|---|---|---|---|
| UI / body | Instrument Sans 400/500/600/700 | `@fontsource/instrument-sans@5.3.0` | OFL-1.1 |
| Mono / metrics / code | IBM Plex Mono 400/500/600/700 | `@fontsource/ibm-plex-mono@5.3.0` | OFL-1.1 |

CSS: `--hz-font-sans`, `--hz-font-mono` (also `--sl-font`, `--sl-font-mono`).

## Palette

### Neutrals (60%)

| Token | Dark | Light |
|---|---|---|
| Page bg | `hsl(160, 16%, 8%)` | `hsl(150, 18%, 98%)` |
| Elevated | `hsl(160, 14%, 13%)` | `hsl(150, 16%, 96%)` |
| Border | `hsl(160, 12%, 20%)` | `hsl(150, 8%, 78%)` |
| Muted text | `hsl(155, 7%, 52%)` | `hsl(160, 8%, 38%)` |
| Body text | `hsl(150, 10%, 88%)` | `hsl(160, 14%, 16%)` |

Never pure `#000` for page chrome.

### Brand (30%)

| Token | Dark | Light |
|---|---|---|
| Accent | `hsl(168, 68%, 40%)` | `hsl(168, 70%, 30%)` |
| Accent high (links on dark / strong on light) | `hsl(168, 62%, 70%)` | `hsl(168, 72%, 22%)` |
| Accent low | `hsl(168, 42%, 14%)` | `hsl(168, 38%, 90%)` |

### Signal (10%)

| Token | Use |
|---|---|
| `--hz-signal` | Primary CTA emphasis |
| `--hz-success` / `--hz-warning` / `--hz-danger` / `--hz-info` | Status only |

## Light / dark

Starlight theme toggle drives `:root` / `:root[data-theme='light']`. Both themes set `color-scheme`. Product pages and docs share the same tokens.

## Spacing

8px grid via `--hz-space-*` (4 / 8 / 16 / 24 / 32 / 48 / 64).

## Focus and motion

- Focus: `:focus-visible` 2px solid `--hz-focus`, offset 2px (WCAG 2.2 AA).
- Motion: 150–220ms; `transform`/`opacity`/`color` only; `@media (prefers-reduced-motion: reduce)` disables transitions/animations and the background grid.
- No `transition: all`. No `outline: none` without replacement.

## Refuse list

- Purple-on-white or purple-to-indigo gradients
- Glassmorphism / heavy backdrop blur
- Emoji in UI chrome or marketing copy
- Fake stats, testimonials, or screenshots
- Inter / Roboto / Arial as primary type
- Cream + terracotta artisan look; broadsheet hairline newspaper look

## Checks

```bash
npm run check:hz041
```
