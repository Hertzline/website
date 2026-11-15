<div align="center">

<a href="https://github.com/Hertzline/website"><img src="https://capsule-render.vercel.app/api?type=waving&height=180&color=0:0f1412,55:12352c,100:0f6b4c&text=Hertzline&fontColor=e8eeeb&fontSize=64&fontAlignY=45&animation=twinkling" alt="Hertzline" width="100%" /></a>

<img src="https://readme-typing-svg.demolab.com?font=IBM+Plex+Mono&weight=500&size=16&color=2A9B7A&center=true&vCenter=true&width=520&height=34&duration=2800&pause=1200&lines=Measure.+Explain.+Restore.;Static+Astro+%2B+Starlight+site;English+default+%2F+Italian+%2Fit%2F;No+unverified+FPS+claims" alt="Measure. Explain. Restore." />

<p>
  <a href="https://github.com/Hertzline"><img src="https://skillicons.dev/icons?i=github&theme=dark" width="44" height="44" alt="GitHub" /></a>&nbsp;
  <a href="https://github.com/Hertzline/app"><img src="https://skillicons.dev/icons?i=rust&theme=dark" width="44" height="44" alt="App" /></a>&nbsp;
  <a href="https://astro.build"><img src="https://skillicons.dev/icons?i=astro&theme=dark" width="44" height="44" alt="Astro" /></a>
</p>

</div>

<br/>

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:0f1412,35:2a9b7a,70:c9a227,100:0f1412" width="100%" alt="" />

<br/>

<p align="center"><img src="https://readme-typing-svg.demolab.com?font=IBM+Plex+Mono&weight=700&size=18&color=2A9B7A&center=true&vCenter=true&width=420&height=40&duration=1&pause=1000000&letterSpacing=6px&lines=WHAT+THIS+REPO+IS" alt="What this repo is" /></p>

Static product site and full docs for [Hertzline](https://github.com/Hertzline). Astro + Starlight. Output is static HTML only: no server functions, no database, no runtime secrets.

Owner deploys on Vercel. Agents never install or run the Vercel CLI.

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:0f1412,35:2a9b7a,70:c9a227,100:0f1412" width="100%" alt="" />

<br/>

<p align="center"><img src="https://readme-typing-svg.demolab.com?font=IBM+Plex+Mono&weight=700&size=18&color=2A9B7A&center=true&vCenter=true&width=420&height=40&duration=1&pause=1000000&letterSpacing=6px&lines=STACK" alt="Stack" /></p>

| Package | Version | License |
|---|---|---|
| astro | 7.4.12 | MIT |
| @astrojs/starlight | 0.43.1 | MIT |
| sharp | 0.35.5 | Apache-2.0 |
| @fontsource/instrument-sans | 5.3.0 | OFL-1.1 |
| @fontsource/ibm-plex-mono | 5.3.0 | OFL-1.1 |

Node `engines.node`: `>=22.23.4`.

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:0f1412,35:2a9b7a,70:c9a227,100:0f1412" width="100%" alt="" />

<br/>

<p align="center"><img src="https://readme-typing-svg.demolab.com?font=IBM+Plex+Mono&weight=700&size=18&color=2A9B7A&center=true&vCenter=true&width=420&height=40&duration=1&pause=1000000&letterSpacing=6px&lines=DEVELOP" alt="Develop" /></p>

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

Design system: [DESIGN.md](DESIGN.md).

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:0f1412,35:2a9b7a,70:c9a227,100:0f1412" width="100%" alt="" />

<br/>

## Deploy on Vercel

Owner-operated only. Agents must not install or run the Vercel CLI.

1. Import `Hertzline/website` in the Vercel dashboard.
2. Default **Astro** preset.
3. Build: `npm run build` · Output: `dist` · Install: `npm ci`.
4. Node 22.x or 24.x (`>=22.23.4`).
5. No Astro adapter. Static only. No env vars required.
6. Replace placeholder `site` in `astro.config.mjs` after first deploy.

## i18n

- English is the Starlight `root` locale (no `/en/` prefix).
- Italian content and routes live under `/it/`.
- Custom UI keys: `src/content/i18n/en.json` and `src/content/i18n/it.json`.
- Starlight emits `hreflang` alternate links (`en`, `it`, `x-default`) when `site` is set.

<img src="https://capsule-render.vercel.app/api?type=rect&height=3&color=0:0f1412,35:2a9b7a,70:c9a227,100:0f1412" width="100%" alt="" />

<br/>

<p align="center"><img src="https://readme-typing-svg.demolab.com?font=IBM+Plex+Mono&weight=700&size=18&color=2A9B7A&center=true&vCenter=true&width=420&height=40&duration=1&pause=1000000&letterSpacing=6px&lines=RELEASE+FEED" alt="Release feed" /></p>

`src/data/releases.json` drives `/download/` and `/changelog/`. Packaging writes it via `../packaging/scripts/write_release_metadata.py`. Never commit secrets.

Package ID: `Hertzline.Hertzline` · `winget install Hertzline.Hertzline`

<p align="center"><sub><i>Clean measurements are like a well-refereed match: when everything works, nobody invents the score.</i></sub></p>

## License

[MIT](LICENSE) · [NOTICE](NOTICE)

<img src="https://capsule-render.vercel.app/api?type=waving&section=footer&height=110&color=0:0f1412,55:12352c,100:0f6b4c" alt="" width="100%" />
