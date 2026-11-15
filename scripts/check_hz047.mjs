import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const fail = (msg) => {
	console.error(`FAIL: ${msg}`)
	process.exit(1)
}

const requiredSlugs = [
	'docs',
	'docs/getting-started',
	'docs/installation',
	'docs/first-benchmark',
	'docs/profiles',
	'docs/actions',
	'docs/rollback',
	'docs/troubleshooting',
	'docs/faq',
	'docs/building-from-source',
	'docs/contributing',
	'docs/architecture',
	'docs/security',
]

const requiredTopics = [
	'getting started',
	'installation',
	'first benchmark',
	'profiles',
	'every action',
	'rollback',
	'troubleshooting',
	'faq',
	'building from source',
	'contributing',
	'architecture',
	'security',
]

const slugToFile = (slug) => {
	if (slug === 'docs') return 'docs/index.mdx'
	return `${slug}.mdx`
}

const docsRoot = join(root, 'src/content/docs')
const docsIt = join(docsRoot, 'it')

for (const slug of requiredSlugs) {
	const enRel = slugToFile(slug)
	const en = join(docsRoot, enRel)
	const it = join(docsIt, enRel)
	if (!existsSync(en)) fail(`missing English page src/content/docs/${enRel}`)
	if (!existsSync(it)) fail(`missing Italian page src/content/docs/it/${enRel}`)
}

const enActions = readFileSync(join(docsRoot, 'docs/actions.mdx'), 'utf8')
const itActions = readFileSync(join(docsIt, 'docs/actions.mdx'), 'utf8')
if (!enActions.includes('ActionsCatalog') || !itActions.includes('ActionsCatalog')) {
	fail('docs/actions must render ActionsCatalog (every action from shared data)')
}
if (!enActions.includes('actions.json') || !itActions.includes('actions.json')) {
	fail('docs/actions must cite shared actions.json')
}

const enInstall = readFileSync(join(docsRoot, 'docs/installation.mdx'), 'utf8')
for (const os of ['Windows', 'Linux', 'macOS']) {
	if (!enInstall.includes(os)) fail(`docs/installation missing ${os} section`)
}
if (!enInstall.includes('Hertzline.Hertzline')) {
	fail('docs/installation must document winget Hertzline.Hertzline')
}

const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8')
for (const slug of requiredSlugs) {
	const needle = slug === 'docs' ? "slug: 'docs'" : `slug: '${slug}'`
	if (!config.includes(needle) && !config.includes(needle.replaceAll("'", '"'))) {
		fail(`astro.config sidebar missing ${needle}`)
	}
}
if (!config.includes("label: 'Documentation'")) {
	fail('astro.config missing Documentation sidebar group')
}

const banned = [/\+\s*\d+\s*%?\s*FPS/i, /\d+\s*%?\s*more\s*FPS/i, /lorem ipsum/i]
for (const slug of requiredSlugs) {
	const rel = slugToFile(slug)
	const blob = readFileSync(join(docsRoot, rel), 'utf8')
	for (const re of banned) {
		if (re.test(blob)) fail(`banned pattern in ${rel}: ${re}`)
	}
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (!pkg.scripts?.['check:hz047']) fail('package.json missing check:hz047 script')

const ci = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8')
if (!ci.includes('check:hz047')) fail('ci.yml must run check:hz047')

const readme = readFileSync(join(root, 'README.md'), 'utf8')
if (!readme.includes('/docs/')) fail('README must document /docs/')
if (!readme.includes('check:hz047')) fail('README must document check:hz047')

const dist = join(root, 'dist')
if (!existsSync(join(dist, 'index.html'))) fail('dist/index.html missing; run npm run build first')

const distPaths = [
	'docs/index.html',
	'docs/getting-started/index.html',
	'docs/installation/index.html',
	'docs/first-benchmark/index.html',
	'docs/profiles/index.html',
	'docs/actions/index.html',
	'docs/rollback/index.html',
	'docs/troubleshooting/index.html',
	'docs/faq/index.html',
	'docs/building-from-source/index.html',
	'docs/contributing/index.html',
	'docs/architecture/index.html',
	'docs/security/index.html',
	'it/docs/index.html',
	'it/docs/actions/index.html',
	'it/docs/installation/index.html',
]

for (const rel of distPaths) {
	if (!existsSync(join(dist, rel))) fail(`built page missing: dist/${rel}`)
}

const enDocsActionsHtml = readFileSync(join(dist, 'docs/actions/index.html'), 'utf8')
if (!/windows\.power_plan/.test(enDocsActionsHtml)) {
	fail('dist/docs/actions missing windows.power_plan from shared catalog')
}
if (!/linux\.feral_gamemode/.test(enDocsActionsHtml)) {
	fail('dist/docs/actions missing linux.feral_gamemode')
}
if (!/macos\.monitor/.test(enDocsActionsHtml)) {
	fail('dist/docs/actions missing macos.monitor')
}
if (!/AC-4\.23/i.test(enDocsActionsHtml)) {
	fail('dist/docs/actions missing AC-4.23 honesty')
}
if (/\+\s*\d+\s*%?\s*FPS/i.test(enDocsActionsHtml)) {
	fail('dist/docs/actions contains fake FPS claim')
}

const enInstallHtml = readFileSync(join(dist, 'docs/installation/index.html'), 'utf8')
if (!/Windows/i.test(enInstallHtml) || !/Linux/i.test(enInstallHtml) || !/macOS/i.test(enInstallHtml)) {
	fail('dist/docs/installation missing per-OS coverage')
}

const acMarkers = [
	'AC-1',
	'AC-2',
	'AC-3',
	'AC-4',
	'AC-5',
	'AC-6',
	'AC-7',
	'AC-8',
]
const docsBlob = requiredSlugs
	.map((slug) => readFileSync(join(docsRoot, slugToFile(slug)), 'utf8'))
	.join('\n')
for (const ac of acMarkers) {
	if (!docsBlob.includes(ac)) fail(`docs set missing ${ac} coverage marker`)
}

console.log(
	`hz047_ok docs=${requiredSlugs.length} topics=${requiredTopics.length} actions=shared en+it=1`,
)
