import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

const dataPath = join(root, 'src/data/releases.json')
if (!existsSync(dataPath)) fail('src/data/releases.json missing')

const releases = JSON.parse(readFileSync(dataPath, 'utf8'))
if (releases.status !== 'not_released' && releases.status !== 'released') {
	fail(`releases.status must be not_released or released, got ${releases.status}`)
}
if (releases.wingetId !== 'Hertzline.Hertzline') {
	fail(`wingetId must be Hertzline.Hertzline, got ${releases.wingetId}`)
}
if (releases.wingetCommand !== 'winget install Hertzline.Hertzline') {
	fail(`wingetCommand must be exact winget install Hertzline.Hertzline`)
}
if (releases.status === 'not_released') {
	if (releases.wingetPublished === true) {
		fail('not_released must keep wingetPublished false')
	}
	if (releases.latest != null) fail('not_released must keep latest null')
	if (!Array.isArray(releases.history) || releases.history.length > 0) {
		fail('not_released must keep history as an empty array')
	}
	for (const os of ['windows', 'linux', 'macos']) {
		if (!Array.isArray(releases.artifacts?.[os]) || releases.artifacts[os].length > 0) {
			fail(`not_released artifacts.${os} must be an empty array`)
		}
	}
}

for (const locale of ['en', 'it']) {
	if (!releases.product?.description?.[locale]) {
		fail(`product.description.${locale} missing`)
	}
	for (const os of ['windows', 'linux', 'macos']) {
		if (!releases.requirements?.[os]?.[locale]) {
			fail(`requirements.${os}.${locale} missing`)
		}
	}
	for (const key of [
		'statusLabel',
		'notReleased',
		'wingetTitle',
		'wingetNote',
		'windowsTitle',
		'linuxTitle',
		'macosTitle',
		'slotEmpty',
		'checksumsTitle',
		'checksumsEmpty',
		'requirementsTitle',
	]) {
		if (!releases.ui?.[locale]?.[key]) fail(`ui.${locale}.${key} missing`)
	}
}

const blob = JSON.stringify(releases)
for (const re of [/\+\s*\d+\s*%?\s*FPS/i, /aggregateRating/i, /ratingValue/i, /lorem ipsum/i]) {
	if (re.test(blob)) fail(`banned pattern in releases.json: ${re}`)
}

for (const rel of [
	'src/components/DownloadPanel.astro',
	'src/content/docs/download.mdx',
	'src/content/docs/it/download.mdx',
	'public/robots.txt',
	'public/og.svg',
]) {
	if (!existsSync(join(root, rel))) fail(`${rel} missing`)
}

const panel = readFileSync(join(root, 'src/components/DownloadPanel.astro'), 'utf8')
if (!panel.includes('../data/releases.json')) {
	fail('DownloadPanel must import src/data/releases.json')
}
if (!panel.includes('application/ld+json')) {
	fail('DownloadPanel must emit SoftwareApplication JSON-LD')
}
if (!panel.includes('SoftwareApplication')) {
	fail('DownloadPanel JSON-LD must use SoftwareApplication')
}
if (/aggregateRating|ratingValue/.test(panel)) {
	fail('DownloadPanel must not invent aggregateRating/ratingValue')
}
if (!panel.includes('winget install Hertzline.Hertzline') && !panel.includes('releases.wingetCommand')) {
	fail('DownloadPanel must surface winget command')
}
for (const id of ['hz-winget', 'hz-windows', 'hz-linux', 'hz-macos', 'hz-checksums', 'hz-requirements']) {
	if (!panel.includes(id)) fail(`DownloadPanel missing section id ${id}`)
}

const robots = readFileSync(join(root, 'public/robots.txt'), 'utf8')
if (!/User-agent:\s*\*/i.test(robots)) fail('robots.txt missing User-agent')
if (!/Sitemap:/i.test(robots)) fail('robots.txt missing Sitemap')
if (!/sitemap-index\.xml/i.test(robots)) fail('robots.txt must point at sitemap-index.xml')

const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8')
if (!config.includes("slug: 'download'") && !config.includes('slug: "download"')) {
	fail('astro.config sidebar missing download slug')
}
if (!config.includes('og:image') || !config.includes('twitter:image')) {
	fail('astro.config must set site-wide og:image and twitter:image')
}

const dist = join(root, 'dist')
if (!existsSync(join(dist, 'index.html'))) fail('dist/index.html missing; run npm run build first')

for (const rel of [
	'download/index.html',
	'it/download/index.html',
	'robots.txt',
	'og.svg',
	'sitemap-index.xml',
	'sitemap-0.xml',
]) {
	if (!existsSync(join(dist, rel))) fail(`built asset missing: dist/${rel}`)
}

const enHtml = readFileSync(join(dist, 'download/index.html'), 'utf8')
const itHtml = readFileSync(join(dist, 'it/download/index.html'), 'utf8')

for (const [rel, html] of [
	['download/index.html', enHtml],
	['it/download/index.html', itHtml],
]) {
	if (!/<h1[\s>]/i.test(html)) fail(`dist/${rel} missing h1`)
	if (!/winget install Hertzline\.Hertzline/.test(html)) {
		fail(`dist/${rel} missing winget install Hertzline.Hertzline`)
	}
	if (releases.status === 'not_released') {
		if (!/Not released yet|Non ancora rilasciato/i.test(html)) {
			fail(`dist/${rel} must state not released yet`)
		}
		if (/https?:\/\/[^\s"'<>]+\/(Hertzline|hertzline)[^"'<>]*\.(msi|msix|exe|dmg|AppImage|deb|rpm)/i.test(html)) {
			fail(`dist/${rel} has fake installer URL while not_released`)
		}
	} else {
		if (!/1\.0\.0/.test(html)) fail(`dist/${rel} must show version 1.0.0`)
		if (!/https:\/\/github\.com\/Hertzline\/app\/releases\/download\/v1\.0\.0\//.test(html)) {
			fail(`dist/${rel} missing live Hertzline/app release download URL`)
		}
	}
	if (!/application\/ld\+json/.test(html)) fail(`dist/${rel} missing JSON-LD`)
	if (!/SoftwareApplication/.test(html)) fail(`dist/${rel} missing SoftwareApplication`)
	if (/aggregateRating|ratingValue/.test(html)) {
		fail(`dist/${rel} must not invent ratings`)
	}
	if (!/property=["']og:image["']|property=["']og:title["']/i.test(html)) {
		fail(`dist/${rel} missing Open Graph tags`)
	}
	if (!/name=["']twitter:card["']/i.test(html)) {
		fail(`dist/${rel} missing twitter:card`)
	}
	if (/\+\s*\d+\s*%?\s*FPS/i.test(html)) fail(`dist/${rel} contains fake FPS claim`)
}

const sitemap = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8')
if (!/\/download\//.test(sitemap)) fail('sitemap missing /download/')
if (!/\/it\/download\//.test(sitemap)) fail('sitemap missing /it/download/')

const distRobots = readFileSync(join(dist, 'robots.txt'), 'utf8')
if (!/Sitemap:/i.test(distRobots)) fail('dist/robots.txt missing Sitemap')

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (!pkg.scripts?.['check:hz046']) fail('package.json missing check:hz046 script')

const enTitle = enHtml.match(/<title>([^<]*)<\/title>/i)?.[1] || ''
const itTitle = itHtml.match(/<title>([^<]*)<\/title>/i)?.[1] || ''
if (!/Download/i.test(enTitle)) fail(`English download title unexpected: ${enTitle}`)
if (!/Download/i.test(itTitle)) fail(`Italian download title unexpected: ${itTitle}`)

console.log(
	`hz046_ok status=${releases.status} winget=${releases.wingetId} locales=2 jsonld=1 robots=1 sitemap=1 og=1`,
)
