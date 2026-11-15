import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8')
const tokens = readFileSync(join(root, 'src/styles/design-tokens.css'), 'utf8')
const design = readFileSync(join(root, 'DESIGN.md'), 'utf8')
const notice = readFileSync(join(root, 'NOTICE'), 'utf8')
const favicon = readFileSync(join(root, 'public/favicon.svg'), 'utf8')

for (const [name, want] of [
	['@fontsource/instrument-sans', '5.3.0'],
	['@fontsource/jetbrains-mono', '5.3.0'],
]) {
	const got = pkg.dependencies?.[name]
	if (got !== want) fail(`${name} must be pinned to ${want}, got ${got}`)
}

if (!existsSync(join(root, 'src/assets/logo.svg'))) fail('src/assets/logo.svg missing')
if (!config.includes('customCss')) fail('astro.config must set customCss')
if (!config.includes('design-tokens.css')) fail('customCss must include design-tokens.css')
if (!config.includes('@fontsource/instrument-sans')) fail('customCss must load Instrument Sans')
if (!config.includes('@fontsource/jetbrains-mono')) fail('customCss must load JetBrains Mono')

if (!tokens.includes('--hz-font-sans')) fail('tokens missing --hz-font-sans')
if (!tokens.includes('--hz-font-mono')) fail('tokens missing --hz-font-mono')
if (!tokens.includes("data-theme='light'")) fail('tokens missing light theme')
if (!tokens.includes('prefers-reduced-motion')) fail('tokens missing prefers-reduced-motion')
if (!tokens.includes(':focus-visible')) fail('tokens missing :focus-visible')
if (!tokens.includes('color-scheme')) fail('tokens missing color-scheme')
if (!tokens.includes('#0a1220') || !tokens.includes('#14b8a6') || !tokens.includes('#e5b567')) {
	fail('tokens must include Leo README navy/teal/amber anchors')
}

const bannedInTokens = [
	[/backdrop-filter:\s*blur/i, 'glassmorphism blur'],
	[/hsl\(\s*2[6-8]\d\b/i, 'purple-range accent hsl'],
	[/linear-gradient\([^)]*hsl\(\s*2[6-8]\d/i, 'purple gradient'],
]

for (const [re, label] of bannedInTokens) {
	if (re.test(tokens)) fail(`banned pattern in tokens: ${label}`)
}

if (/[\u{1F300}-\u{1FAFF}]/u.test(tokens) || /[\u{1F300}-\u{1FAFF}]/u.test(design)) {
	fail('emoji found in design system files')
}

if (!design.includes('Refuse list')) fail('DESIGN.md must include Refuse list')

if (/backdrop-filter:\s*(?!none)\w+/i.test(tokens)) {
	fail('non-none backdrop-filter in design tokens')
}

if (!design.includes('Instrument Sans') || !design.includes('JetBrains Mono')) {
	fail('DESIGN.md must document type pair')
}
if (!design.includes('OFL-1.1')) fail('DESIGN.md must cite OFL-1.1')
if (!design.includes('WCAG 2.2')) fail('DESIGN.md must cite WCAG 2.2 focus')

if (!notice.includes('Instrument Sans') || !notice.includes('JetBrains Mono')) {
	fail('NOTICE must attribute fonts')
}
if (!notice.includes('OFL-1.1')) fail('NOTICE must cite OFL-1.1 for fonts')

if (favicon.includes('emoji') || /[\u{1F300}-\u{1FAFF}]/u.test(favicon)) {
	fail('favicon must not use emoji')
}

if (!existsSync(join(root, 'dist', 'index.html'))) {
	fail('dist/index.html missing; run npm run build first')
}

const { readdirSync } = await import('node:fs')
const distCssDir = join(root, 'dist', '_astro')
const cssFiles = readdirSync(distCssDir).filter((n) => n.endsWith('.css'))
const cssBlob = cssFiles
	.map((n) => readFileSync(join(distCssDir, n), 'utf8'))
	.join('\n')

if (!cssBlob.includes('Instrument Sans')) fail('built CSS missing Instrument Sans')
if (!cssBlob.includes('JetBrains Mono')) fail('built CSS missing JetBrains Mono')
if (!cssBlob.includes('--hz-font-sans')) fail('built CSS missing --hz-font-sans')
if (!cssBlob.includes('prefers-reduced-motion')) {
	fail('built CSS missing prefers-reduced-motion')
}
if (!cssBlob.includes('focus-visible')) fail('built CSS missing focus-visible')

console.log(
	'hz041_ok fonts=1 light_dark=1 focus=1 reduced_motion=1 no_glass=1 no_emoji=1 design_doc=1',
)
