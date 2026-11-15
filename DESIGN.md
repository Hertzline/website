# Hertzline website design system

Tokens live in `src/styles/design-tokens.css` and map onto Starlight `--sl-*` variables.

## Direction

Leo-Galli README DNA: deep navy panels, teal signal, amber highlight, JetBrains Mono labels. Solid surfaces only. No purple gradients, no glassmorphism, no emoji.

## Type pair

| Role | Family | Source | License |
|---|---|---|---|
| UI / body | Instrument Sans 400/500/600/700 | `@fontsource/instrument-sans@5.3.0` | OFL-1.1 |
| Mono / labels / code | JetBrains Mono 400/500/600/700 | `@fontsource/jetbrains-mono@5.3.0` | OFL-1.1 |

CSS: `--hz-font-sans`, `--hz-font-mono` (also `--sl-font`, `--sl-font-mono`).

## Palette

Aligned to the public Leo-Galli profile README (navy / teal / amber):

| Role | Dark | Light |
|---|---|---|
| Page deep | `#040812` | `#e2e8f0` |
| Page bg | `#0a1220` | `#f8fafc` |
| Panel | `#0f1b30` | `#ffffff` |
| Border | `#24406b` | `#cbd5e1` |
| Body | `#e2e8f0` | `#0f1b30` |
| Muted | `#94a3b8` | `#475569` |
| Accent teal | `#14b8a6` / `#2dd4bf` | `#0d9488` / `#0f766e` |
| Signal amber | `#e5b567` | `#b45309` |

Never pure `#000` for page chrome.

## Light / dark

Starlight theme toggle drives `:root` / `:root[data-theme='light']`. Both themes set `color-scheme`.

## Spacing

8px grid via `--hz-space-*` (4 / 8 / 16 / 24 / 32 / 48 / 64).

## Focus and motion

- Focus: `:focus-visible` 2px solid `--hz-focus`, offset 2px (WCAG 2.2 AA).
- Motion: 150–220ms; `transform`/`opacity`/`color` only; `@media (prefers-reduced-motion: reduce)` disables transitions/animations and ambient gradients.
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
