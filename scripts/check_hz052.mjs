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
if (!Array.isArray(releases.history)) fail('releases.history must be an array')

if (releases.status === 'not_released') {
	if (releases.latest != null) fail('not_released latest must be null')
	if (releases.history.length !== 0) fail('not_released history must be empty')
	for (const os of ['windows', 'linux', 'macos']) {
		if (!Array.isArray(releases.artifacts?.[os]) || releases.artifacts[os].length !== 0) {
			fail(`not_released artifacts.${os} must be []`)
		}
	}
	if (releases.wingetPublished === true) fail('not_released wingetPublished must be false')
} else if (releases.status === 'released') {
	if (!releases.latest?.version) fail('released must set latest.version')
	if (!releases.latest?.published) fail('released must set latest.published')
	if (!releases.latest?.minOs) fail('released must set latest.minOs')
	const total = ['windows', 'linux', 'macos'].reduce(
		(n, os) => n + (releases.artifacts?.[os]?.length || 0),
		0,
	)
	if (total < 1) fail('released requires at least one artifact')
	for (const os of ['windows', 'linux', 'macos']) {
		for (const row of releases.artifacts[os] || []) {
			for (const key of ['id', 'label', 'url', 'sha256']) {
				if (!row?.[key]) fail(`artifact.${os} missing ${key}`)
			}
			if (!String(row.url).startsWith('https://')) fail('artifact url must be https')
			if (!/^[0-9a-f]{64}$/i.test(row.sha256)) fail('artifact sha256 invalid')
		}
	}
	if (releases.history.length < 1) fail('released history must include at least one entry')
} else {
	fail(`unexpected status ${releases.status}`)
}

const blob = JSON.stringify(releases)
for (const re of [
	/BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY/i,
	/ghp_[A-Za-z0-9]{20,}/,
	/github_pat_[A-Za-z0-9_]{20,}/,
	/AKIA[0-9A-Z]{16}/,
	/CSC_KEY_PASSWORD/i,
	/APPLE_ID_PASSWORD/i,
	/aggregateRating/i,
	/\+\s*\d+\s*%?\s*FPS/i,
]) {
	if (re.test(blob)) fail(`banned / secret-like pattern in releases.json: ${re}`)
}

for (const rel of [
	'src/components/DownloadPanel.astro',
	'src/components/ChangelogFeed.astro',
	'src/content/docs/changelog.mdx',
	'src/content/docs/it/changelog.mdx',
]) {
	if (!existsSync(join(root, rel))) fail(`${rel} missing`)
}

const panel = readFileSync(join(root, 'src/components/DownloadPanel.astro'), 'utf8')
const feed = readFileSync(join(root, 'src/components/ChangelogFeed.astro'), 'utf8')
const enCl = readFileSync(join(root, 'src/content/docs/changelog.mdx'), 'utf8')
const itCl = readFileSync(join(root, 'src/content/docs/it/changelog.mdx'), 'utf8')

if (!panel.includes('../data/releases.json')) fail('DownloadPanel must import releases.json')
if (!feed.includes('../data/releases.json')) fail('ChangelogFeed must import releases.json')
if (!feed.includes('history')) fail('ChangelogFeed must read history')
if (!enCl.includes('ChangelogFeed') || !itCl.includes('ChangelogFeed')) {
	fail('changelog pages must use ChangelogFeed')
}
if (!enCl.includes('locale="en"') || !itCl.includes('locale="it"')) {
	fail('changelog pages must pass locale')
}

const readme = readFileSync(join(root, 'README.md'), 'utf8')
if (!/HZ-052|releases\.json|release metadata/i.test(readme)) {
	fail('README must document HZ-052 release metadata hook')
}
if (/\b(npx\s+vercel|vercel\s+login|vercel\s+link|vercel\s+deploy)\b/i.test(readme)) {
	fail('README must not instruct running Vercel CLI login/link/deploy')
}
if (!/never deploy|do not install or run the Vercel CLI|owner deploys/i.test(readme)) {
	fail('README must state owner deploys / no agent Vercel CLI')
}

const dist = join(root, 'dist')
if (!existsSync(join(dist, 'index.html'))) fail('dist/index.html missing; run npm run build first')

for (const rel of [
	'download/index.html',
	'it/download/index.html',
	'changelog/index.html',
	'it/changelog/index.html',
]) {
	if (!existsSync(join(dist, rel))) fail(`built page missing: dist/${rel}`)
}

const pages = [
	['download/index.html', readFileSync(join(dist, 'download/index.html'), 'utf8')],
	['it/download/index.html', readFileSync(join(dist, 'it/download/index.html'), 'utf8')],
	['changelog/index.html', readFileSync(join(dist, 'changelog/index.html'), 'utf8')],
	['it/changelog/index.html', readFileSync(join(dist, 'it/changelog/index.html'), 'utf8')],
]

for (const [rel, html] of pages) {
	if (!/winget install Hertzline\.Hertzline/.test(html)) {
		fail(`dist/${rel} missing winget install Hertzline.Hertzline`)
	}
	if (releases.status === 'not_released') {
		if (!/Not released yet|Non ancora rilasciato/i.test(html)) {
			fail(`dist/${rel} must state not released yet while status=not_released`)
		}
		if (/https?:\/\/[^\s"'<>]+\/(Hertzline|hertzline)[^"'<>]*\.(msi|msix|exe|dmg|AppImage|deb|rpm)/i.test(html)) {
			fail(`dist/${rel} has fake installer URL while not_released`)
		}
	} else if (releases.status === 'released') {
		if (!/1\.0\.0/.test(html)) fail(`dist/${rel} must mention 1.0.0`)
		if (rel.includes('download') && !/https:\/\/github\.com\/Hertzline\/app\/releases\/download\/v1\.0\.0\//.test(html)) {
			fail(`dist/${rel} missing live release asset URL`)
		}
	}
	if (/BEGIN\s+.*PRIVATE\s+KEY|ghp_|CSC_KEY_PASSWORD/i.test(html)) {
		fail(`dist/${rel} leaked secret-like text`)
	}
	if (/\+\s*\d+\s*%?\s*FPS/i.test(html)) fail(`dist/${rel} fake FPS claim`)
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (!pkg.scripts?.['check:hz052']) fail('package.json missing check:hz052 script')

console.log(
	`hz052_ok status=${releases.status} history=${releases.history.length} secrets=0 download+changelog=1`,
)
