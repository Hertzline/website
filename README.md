<div align="center">

# Hertzline / website

**Measure. Explain. Restore.**

Static product site and documentation for [Hertzline](https://github.com/Hertzline).

Astro + Starlight. Static HTML only: no server functions, no database, no runtime secrets.

Visual DNA matches the [Leo-Galli profile README](https://github.com/Leo-Galli/Leo-Galli): deep navy, teal, amber, JetBrains Mono labels.

</div>

---

## Versions (verified 2026-11-15)

| Package | Version | License | Source |
|---|---|---|---|
| astro | 7.4.12 | MIT | npm / docs.astro.build (latest 7.4.x) |
| @astrojs/starlight | 0.43.1 | MIT | npm / starlight.astro.build (peer astro ^7.2.10) |
| sharp | 0.35.5 | Apache-2.0 | npm |
| @fontsource/instrument-sans | 5.3.0 | OFL-1.1 | npm / fontsource.org |
| @fontsource/jetbrains-mono | 5.3.0 | OFL-1.1 | npm / fontsource.org |
| @astrojs/check | 0.9.12 | MIT | npm |
| typescript | 5.9.3 | Apache-2.0 | npm |
| linkinator | 8.1.0 | MIT | npm (HZ-043 link checker) |
| @lhci/cli | 0.16.1 | Apache-2.0 | npm (HZ-043 Lighthouse CI; bundles lighthouse 13.6.0) |

Node.js `engines.node` is `>=22.23.4` (Astro 7 requirement from official install docs).

D7 snapshot was Astro 7.4.11 / Starlight 0.42.11; scaffold re-pinned to the versions above.

## Layout

| Path | Role |
|---|---|
| `src/content/docs/` | English (root) Starlight Markdown / MDX docs |
| `src/content/docs/it/` | Italian docs (`/it/`) |
| `src/content/i18n/` | Custom UI string dictionaries (`en.json`, `it.json`) |
| `src/content.config.ts` | Docs + i18n content collections |
| `src/styles/design-tokens.css` | Light/dark palette, type, focus, reduced motion (HZ-041) |
| `src/styles/product-pages.css` | Product page layout accents (HZ-044 / HZ-045) |
| `src/data/actions.json` | Shared actions catalog (AC-4.x / AC-8.1); `/actions/` + `/docs/actions/` |
| `src/content/docs/docs/` | Technical docs under `/docs/` (HZ-047) |
| `src/data/releases.json` | Release feed for `/download/` + `/changelog/` (HZ-046 / HZ-052) |
| `src/components/ActionsCatalog.astro` | Renders `/actions/` from shared data |
| `src/components/DownloadPanel.astro` | Renders `/download/` from releases data + SoftwareApplication JSON-LD |
| `src/components/ChangelogFeed.astro` | Renders `/changelog/` from the same releases feed |
| `public/robots.txt` | Allow all + sitemap pointer |
| `public/og.svg` | Default Open Graph / Twitter image |
| `src/assets/logo.svg` | Header mark |
| `src/assets/ui-preview-placeholder.svg` | Labeled UI preview placeholder (not a screenshot) |
| `DESIGN.md` | Design system reference |
| `astro.config.mjs` | Static Astro + Starlight; `site` placeholder URL; locales |
| `public/` | Static assets |

## i18n

- Default language: **English** as Starlight `root` locale (URLs have no `/en/` prefix).
- Italian: content and routes under `/it/` (`locales.it`, `lang: 'it'`).
- Custom Hertzline UI keys live in `src/content/i18n/en.json` and `src/content/i18n/it.json`. `npm run check:hz042` fails if any key is missing or empty on either side, and if docs pages lack Italian parity. `npm run check:hz048` is the dedicated missing-key/missing-page gate for the required Italian `/docs/` set (translated titles, no English `/docs/` links, built `/it/docs/`).
- Starlight built-in Italian UI labels ship with `@astrojs/starlight` (`dist/translations/it.js`).
- **hreflang:** Starlight emits `<link rel="alternate" hreflang="en|it|x-default">` on multilingual pages when `site` is set (see `@astrojs/starlight` `dist/utils/head.js`). Verified by `check:hz042` on the static build. After the owner replaces the placeholder `site` URL, production canonicals and hreflang targets will use that domain.

## Develop

```bash
npm ci
npm run check
npm run build
npm run check:hz040
npm run check:hz041
npm run check:hz042
npm run check:links
npm run check:a11y
npm run check:hz043
npm run check:hz044
npm run check:hz045
npm run check:hz046
npm run check:hz047
npm run check:hz048
npm run check:lhci
```

| Script | Role |
|---|---|
| `check:links` | Recursive linkinator crawl of `dist/` (skips placeholder `hertzline.example`) |
| `check:a11y` | Structural accessibility gate on built HTML (`lang`, `title`, `h1`, `img` alt) |
| `check:lhci` | Lighthouse CI mobile; all categories (performance, accessibility, best-practices, seo) must score >= 0.95 |
| `check:hz043` | Asserts CI wiring, pins, and config for the gates above |
| `check:hz044` | Product routes en/it, unique titles/descriptions, labeled placeholder, no fake FPS claims |
| `check:hz045` | Shared actions catalog: AC-4.1--4.22 + AC-4.23 honesty, en/it fields, `/actions/` build |
| `check:hz046` | Download page: not_released, winget ID, OS slots, checksums, JSON-LD without fake ratings, robots/OG/sitemap |
| `check:hz047` | Starlight `/docs/` set: install per OS, benchmark, profiles, every action, rollback, FAQ, build, contribute, architecture, security |
| `check:hz048` | Italian docs parity: missing-key + missing-page gate for required `/it/docs/` locales |

Lighthouse CI uses `lighthouserc.cjs` (`staticDistDir: ./dist`, mobile form factor). Requires a local Chrome/Chromium (`CHROME_PATH` or chrome-launcher discovery). GitHub Actions runs LHCI on `ubuntu-latest` with `browser-actions/setup-chrome` pinned to SHA.

Design system details: [DESIGN.md](DESIGN.md).

Requires Node.js 22.23.4 or newer (even LTS preferred; odd Node majors are unsupported by Astro).

## Deploy on Vercel

Owner-operated only. Agents must not install or run the Vercel CLI, log in, link, configure, or deploy.

1. Import `Hertzline/website` in the Vercel dashboard (GitHub).
2. Use the default **Astro** preset. Framework preset: Astro.
3. Build command: `npm run build` (Vercel Astro default).
4. Output directory: `dist` (Vercel Astro default).
5. Install command: `npm ci` (or Vercel default `npm install`).
6. Node.js version: 22.x or 24.x LTS that satisfies `>=22.23.4`.
7. Do **not** add the Vercel Astro adapter. This project is static (`output: 'static'`); no server/edge functions.
8. No environment variables are required for the static build.
9. After the first deploy, replace the placeholder `site` URL in `astro.config.mjs` (`https://hertzline.example`) with the real production domain, then redeploy.

Non-default settings: none required for a default Astro static import. Document any future override here before changing CI or Vercel.

## Product pages (HZ-044)

| Path | Role |
|---|---|
| `/` | Splash product home (en); `/it/` Italian |
| `/how-it-works/` | Measure / explain / restore workflow |
| `/anti-cheat/` | No-injection posture and overlay policy |
| `/privacy/` | Local-first defaults; no telemetry by default |
| `/changelog/` | Honest pre-release state until signed artifacts exist |
| `/download/` | Pre-release download page: winget command, OS slots, checksums, requirements (HZ-046) |

Imagery uses a labeled placeholder SVG until real screenshots exist. No fake stats or testimonials.

## Documentation (HZ-047)

Technical docs live under `/docs/` (Italian `/it/docs/`): getting started, installation (Windows/Linux/macOS), first benchmark, profiles, every action (shared `actions.json`), rollback, troubleshooting, FAQ, building from source, contributing, architecture, and security. Covers AC-1--AC-8 narrative for the desktop product.

## Download / releases (HZ-046 / HZ-052)

`src/data/releases.json` is the static release feed for `/download/` and `/changelog/`. While `status` is `not_released`, `latest` is null, `history` is `[]`, artifact arrays stay empty, and both pages state that fact. Package ID: `Hertzline.Hertzline` (`winget install Hertzline.Hertzline`). SoftwareApplication JSON-LD is emitted without invented ratings. Starlight emits Open Graph + Twitter card tags; `public/og.svg` supplies `og:image` / `twitter:image`. Astro emits the sitemap from `site`; `public/robots.txt` points at `/sitemap-index.xml`.

Packaging produces the feed via `../packaging/scripts/write_release_metadata.py` (see `../packaging/release/RELEASE_FEED.md`). Commit the updated JSON here with version, HTTPS URLs, and SHA-256 only -- never secrets. Owner deploys on Vercel; do not install or run the Vercel CLI from this repo.

## Site URL

`astro.config.mjs` sets `site: 'https://hertzline.example'` as a placeholder for sitemap/canonical URLs until the owner configures the real domain.

## License

[MIT](LICENSE)

Third-party notices: [NOTICE](NOTICE)
