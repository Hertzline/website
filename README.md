# Hertzline / website

Static product site and documentation for [Hertzline](https://github.com/Hertzline).

Built with Astro + Starlight. Output is static HTML only: no server functions, no database, no runtime secrets.

## Versions (verified 2026-11-15)

| Package | Version | License | Source |
|---|---|---|---|
| astro | 7.4.12 | MIT | npm / docs.astro.build (latest 7.4.x) |
| @astrojs/starlight | 0.43.1 | MIT | npm / starlight.astro.build (peer astro ^7.2.10) |
| sharp | 0.35.5 | Apache-2.0 | npm |
| @astrojs/check | 0.9.12 | MIT | npm |
| typescript | 5.9.3 | Apache-2.0 | npm |

Node.js `engines.node` is `>=22.23.4` (Astro 7 requirement from official install docs).

D7 snapshot was Astro 7.4.11 / Starlight 0.42.11; scaffold re-pinned to the versions above.

## Layout

| Path | Role |
|---|---|
| `src/content/docs/` | Starlight Markdown / MDX docs |
| `src/content.config.ts` | Docs content collection |
| `astro.config.mjs` | Static Astro + Starlight; `site` placeholder URL |
| `public/` | Static assets |

## Develop

```bash
npm ci
npm run check
npm run build
```

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

## Site URL

`astro.config.mjs` sets `site: 'https://hertzline.example'` as a placeholder for sitemap/canonical URLs until the owner configures the real domain.

## License

[MIT](LICENSE)

Third-party notices: [NOTICE](NOTICE)
